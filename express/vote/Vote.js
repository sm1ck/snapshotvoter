import { ethers } from "ethers";
import snapshot from "@snapshot-labs/snapshot.js";
import { HttpsProxyAgent } from "https-proxy-agent";
import chalk from "chalk";
import fetch from "node-fetch";
import * as accs from "./accs.js";
import {
  keyIndex,
  ws_error_msg,
  ws_vote,
  ws_sub,
  ws_info,
  ws_end,
  ws_error_end,
} from "./ws.js";

// rpc node url

const url = "https://rpc.ankr.com/eth";

// Базовые переменные

let rand_mode = 0; // 0 => стандартный, 1 => рандомная отправка варианта
let random_min = 1; // минимальный номер в голосовании
let random_max = 3; // максимальный номер в голосовании
let isSleep = true; // задержка перед отправкой, нужна ли? изменить на true, если нужна
let sleep_from = 3; // от 30 секунд
let sleep_to = 10; // до 60 секунд
let type_voting = 0; // 0 => стандартный, 1 => approval
let isSubscribe = false; // делаем ли подписку

// Прокси

let proxies = (await accs.importProxies()).map((v) => new HttpsProxyAgent(v));

// Кастомный клиент для обработки исключений

class ClientCustom extends snapshot.Client712 {
  async send(envelop) {
    const url = `${this.address}/api/msg`;
    let init = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(envelop),
    };
    if (proxies.length > 0) {
      init = {
        ...init,
        agent: proxies[randomIntInRange(0, proxies.length - 1)],
      };
    }
    return new Promise((resolve, reject) => {
      fetch(url, init)
        .then((res) => {
          if (res.ok) {
            return resolve(res.json());
          }
          throw res;
        })
        .catch(async (e) => {
          if (typeof e.text === "function") {
            const text = await e.text();
            try {
              const data = JSON.parse(text);
              reject(data);
            } catch (e) {
              reject({
                error: "Error",
                error_description: "Can't parse json in fetch",
              });
            }
          } else {
            reject({
              error: "Error",
              error_description: e.message,
              error_stack: e.stack,
            });
          }
        });
    });
  }
}

/**
 * Абстрактная задержка (async)
 * @param {Integer} millis
 * @returns
 */

const sleep = async (millis) =>
  new Promise((resolve) => setTimeout(resolve, millis));

/**
 * Абстрактная задержка
 * @param {Integer} millis
 * @returns
 */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Запись в итоговый результат
 * @param {String} address
 * @param {String} result
 * @returns
 */

const add_result = (address, result) =>
  pretty_result.push({ Адрес: address, Результат: result });

/**
 * Случайное min/max целое значение
 * @param {Integer} min
 * @param {Integer} max
 * @returns Случайное число
 */

const randomIntInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Повторная отправка действия
 * @param {String} address адрес
 * @param {Arrow function} operation стрелочная функция
 * @param {Integer} delay задержка в милли секундах
 * @param {Integer} retries количество повторов
 * @returns Promise
 */

const retryOperation = (address, operation, delay, retries) =>
  new Promise((resolve, reject) => {
    return operation.then(resolve).catch((reason) => {
      if (retries > 0) {
        if (!flag.isRunning) {
          return reject(reason);
        }
        if (
          typeof reason === "string" &&
          (reason.includes("timeout") || reason.includes("failed")) &&
          retries === 3
        ) {
          retries = 1000;
        }
        console.log(
          `(${chalk.red(
            "Ошибка"
          )}) ${address} => повторная отправка действия, задержка: ${delay}с, осталось попыток: ${
            retries - 1
          }`
        );
        ws_error_msg(
          ws_sock,
          "Повтор",
          `${address.slice(
            0,
            7
          )}<br />новая попытка<br />задержка: ${delay}с<br />осталось попыток: ${
            retries - 1
          }`
        );
        return wait(delay * 1000)
          .then(
            retryOperation.bind(null, address, operation, delay, retries - 1)
          )
          .then(resolve)
          .catch(reject);
      }
      return reject(reason);
    });
  });

/**
 * Голосование
 * @param {Wallet} wallet
 * @param {String} address
 * @param {String} project
 * @param {String} prop
 * @param {Integer | Array} vote
 * @returns Promise
 */

const voteSnap = (ethWallet, address, project, prop, vote) =>
  new Promise(async (resolve, reject) => {
    const rand_cache = randomIntInRange(random_min, random_max);
    await client
      .vote(ethWallet, address, {
        space: project,
        proposal: prop,
        type: type_voting == 0 ? "single-choice" : "approval",
        choice:
          rand_mode == 0
            ? type_voting == 0
              ? vote
              : Array.isArray(vote)
              ? vote
              : [vote]
            : type_voting == 0
            ? rand_cache
            : rand_cache,
        reason: "",
        app: "snapshot",
      })
      .then((result) => {
        if (result.hasOwnProperty("id")) {
          console.log(
            `(${chalk.green("Голосование")}) ${address} => голос засчитан`
          );
          add_result(address, "засчитано");
          ws_vote(
            ws_sock,
            address,
            project,
            prop,
            rand_mode == 0 ? vote : rand_cache
          );
        } else {
          console.log(`(${chalk.red("Голосование")}) ${address} =>`);
          console.dir(result);
          add_result(address, "неизвестно");
          ws_error_msg(
            ws_sock,
            "Голосование",
            `${address.slice(0, 7)}<br />Неизвестная ошибка`
          );
        }
        resolve();
      })
      .catch((err) => {
        if (typeof err.error_description !== "string") {
          console.log(
            `(${chalk.red("Голосование")}) ${address} => ошибка "${err.error}":`
          );
          console.dir(err.error_description);
          if (err.hasOwnProperty("error_stack")) {
            console.log(err.error_stack);
          }
          ws_error_msg(
            ws_sock,
            "Голосование",
            `${address.slice(0, 7)}<br />${err.error}<br />см. консоль`
          );
        } else {
          console.log(
            `(${chalk.red("Голосование")}) ${address} => ошибка "${
              err.error
            }": ${err.error_description}`
          );
          if (err.hasOwnProperty("error_stack")) {
            console.log(err.error_stack);
          }
          ws_error_msg(
            ws_sock,
            "Голосование",
            `${address.slice(0, 7)}<br />${err.error}<br />${
              err.error_description
            }`
          );
        }
        add_result(address, `${err.error}: ${err.error_description}`);
        (typeof err.error_description === "string" &&
          (err.error_description.includes("timeout") ||
            err.error_description.includes("many") ||
            err.error_description.includes("failed"))) ||
        typeof err.error_description !== "string"
          ? reject(err.error_description)
          : resolve();
      });
  });

/**
 * Подписка
 * @param {Wallet} wallet
 * @param {String} address
 * @param {String} project
 * @returns Promise
 */

const subSnap = (ethWallet, address, project) =>
  new Promise(async (resolve, reject) => {
    await client
      .follow(ethWallet, address, {
        space: project,
      })
      .then((result) => {
        if (result.hasOwnProperty("id")) {
          console.log(
            `(${chalk.green("Подписка")}) ${address} => вы подписались`
          );
          ws_sub(ws_sock, address, project);
        } else {
          console.log(`(${chalk.red("Подписка")}) ${address} =>`);
          console.dir(result);
          ws_error_msg(
            ws_sock,
            "Подписка",
            `${address.slice(0, 7)}<br />Неизвестная ошибка`
          );
        }
        resolve();
      })
      .catch((err) => {
        if (typeof err.error_description !== "string") {
          console.log(
            `(${chalk.red("Подписка")}) ${address} => ошибка "${err.error}":`
          );
          console.dir(err.error_description);
          if (err.hasOwnProperty("error_stack")) {
            console.log(err.error_stack);
          }
          ws_error_msg(
            ws_sock,
            "Подписка",
            `${address.slice(0, 7)}<br />${err.error}<br />см. консоль`
          );
        } else {
          console.log(
            `(${chalk.red("Подписка")}) ${address} => ошибка "${err.error}": ${
              err.error_description
            }`
          );
          if (err.hasOwnProperty("error_stack")) {
            console.log(err.error_stack);
          }
          ws_error_msg(
            ws_sock,
            "Подписка",
            `${address.slice(0, 7)}<br />${err.error}<br />${
              err.error_description
            }`
          );
        }
        (typeof err.error_description === "string" &&
          (err.error_description.includes("timeout") ||
            err.error_description.includes("many") ||
            err.error_description.includes("failed"))) ||
        typeof err.error_description !== "string"
          ? reject(err.error_description)
          : resolve();
      });
  });

/**
 * Парсинг списка активных проползалов
 * @param {String} project
 * @returns Promise
 */

const parsePropsFetch = async (project) =>
  new Promise(async (resolve, reject) => {
    let q = `
    query {
        proposals (
          where: {
            space_in: ["${project}"],
            state: "active"
          }
        ) {
          id
        }
      }`;
    await fetch("https://hub.snapshot.org/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query: q }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (
          data.hasOwnProperty("data") &&
          data.data.hasOwnProperty("proposals")
        ) {
          let arr = [];
          data.data.proposals.forEach((i) => arr.push(i.id));
          if (arr.length == 0) {
            flag.isRunning = false;
            console.log("Нет активных проползалов, прерываем работу..");
            ws_error_end(
              ws_sock,
              "нет активных",
              "проползалов<br />прерываем работу.."
            );
            return resolve([]);
          }
          console.log("Используем список активных проползалов:", arr);
          ws_info(ws_sock, "Список проползалов", arr.join("<br />"));
          return resolve(arr);
        }
        throw new Error("Ошибка при парсинге данных");
      })
      .catch((e) => {
        flag.isRunning = false;
        console.log("Ошибка при парсинге данных, прерываем работу.");
        console.dir(e.stack);
        ws_error_end(ws_sock, "Ошибка при парсинге", "прерываем работу..");
        resolve([]);
      });
  });

const web3 = new ethers.providers.JsonRpcProvider(url);
const hub = "https://hub.snapshot.org"; // or https://testnet.snapshot.org for testnet
const client = new ClientCustom(hub);

let pretty_result = [],
  ws_sock = null;

// Индикатор работы голосования на бэкенде

export const flag = {
  isRunning: true,
};

/**
 * Запуск голосования и подписки в цикле
 * @param {WebSocket} ws
 * @param {JSON} json
 * @returns
 */

export const wsVote = async (ws, json) => {
  let i = 0,
    promises = [];
  (ws_sock = ws),
    (pretty_result = []),
    (flag.isRunning = true),
    (keyIndex.value = 0);

  ws_info(ws, "Начало работы", `не закрывайте страницу!`);

  // Импорт аккаунтов

  const adata = await accs.importAccs();

  // Получаем проползалы из json или с сайта snapshot.org

  let props_list = json.parseProps
    ? await parsePropsFetch(json.project)
    : [json.propolsal];

  // Парсим голосование (и заодно рандомный режим)

  if (String(json.vote).includes("-")) {
    rand_mode = 1;
    [random_max, random_max] = String(json.vote).split("-").map(Number);
  } else {
    json.vote = +json.vote;
  }

  // Парсим задержку

  if (String(json.sleep).includes("-")) {
    isSleep = true;
    [sleep_from, sleep_to] = String(json.sleep).split("-").map(Number);
  } else if (+json.sleep == 0) {
    isSleep = false;
  } else {
    isSleep = true;
    sleep_from, (sleep_to = +json.sleep);
  }

  // Тип голосования

  type_voting = +json.typeVote;

  // Есть ли подписка

  isSubscribe = json.subscribe ? Boolean(json.subscribe) : isSubscribe;

  for (let acc of adata) {
    if (!flag.isRunning) {
      console.log("Связь с вебсокетом потеряна, прерываем..");
      break;
    }
    const ethWallet = new ethers.Wallet(acc, web3);
    const address = await ethWallet.getAddress();
    let prom = promises.push(
      new Promise(async (resolve, reject) => {
        // Голосование

        let prom_list = [];
        props_list.forEach((prop) =>
          prom_list.push(
            retryOperation(
              address,
              voteSnap(ethWallet, address, json.project, prop, json.vote),
              isSleep ? randomIntInRange(sleep_from, sleep_to) : 1,
              3
            )
          )
        );

        // Подписка

        if (isSubscribe) {
          prom_list.push(
            retryOperation(
              address,
              subSnap(ethWallet, address, json.project),
              isSleep ? randomIntInRange(sleep_from, sleep_to) : 1,
              3
            )
          );
        }

        await Promise.allSettled(prom_list).then(() => resolve());
      })
    );

    // Задержка

    if (isSleep) {
      let sle = randomIntInRange(sleep_from, sleep_to);
      promises
        .at(prom - 1)
        .then(() =>
          i < adata.length
            ? console.log(`Задержка ${chalk.yellow(sle)}с..`)
            : null
        );
      i < adata.length ? await sleep(sle * 1000) : null;
    }

    ++i;
  }

  // Результат

  flag.isRunning &&
    (await Promise.allSettled(promises).then(() => {
      console.table(pretty_result);
      ws_end(
        ws,
        `Всего голосов: ${pretty_result.length}<br />Всего успешных голосов: ${
          pretty_result.filter((e) => e["Результат"] === "засчитано").length
        }`
      );
    }));
};
