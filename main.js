/**
 * Скрипт для голосования на snapshot.org
 * @Author JanSergeev (telegram)
 * Donate: 0x9D278054C3e73294215b63ceF34c385Abe52768B
 * node main.js <название_проекта> <айди_проползала> <номер_варианта>
 * Название проекта - скопировать из строки, например https://snapshot.org/#/arbitrum-odyssey.eth
 * arbitrum-odyssey.eth - это то, что нам нужно
 * Айди проползала - скопируйте из браузера, например
 * https://snapshot.org/#/arbitrum-odyssey.eth/proposal/0x44aba87414d2d7ce88218b676d9938338d7866a245f48a7829e805a99bcda6a2
 * хеш 0x44aba87414d2d7ce88218b676d9938338d7866a245f48a7829e805a99bcda6a2 - айди
 * Номер варианта - просто порядковый номер варианта
 * Так как бывает подкидывают проползал специально для ботов, поэтому моя реализация
 * для голосования по ID проползала не в полном авто-режиме
 * Автоматически спарсить и скопировать в файл props.json список активных проползалов проекта:
 * node main.js <название_проекта> getprops
 */

import ethers from 'ethers';
import snapshot from '@snapshot-labs/snapshot.js';
import * as accs from './accs.js';
import fetch from 'node-fetch'
import { exit } from 'process';
import * as fs from 'fs';
import * as path from 'path';

const version = '1.2.1';
const __dirname = path.resolve();

// rpc node url

const url = "https://rpc.ankr.com/eth";

// Базовые переменные

const rand_mode = 0; // 0 => стандартный, 1 => рандомная отправка варианта
const random_min = 1; // минимальный номер в голосовании
const random_max = 3; // максимальный номер в голосовании
const isSleep = true; // задержка перед отправкой, нужна ли? изменить на true, если нужна
const sleep_from = 3; // от 30 секунд
const sleep_to = 10; // до 60 секунд
const isPropList = false; // кастомный список проползалов
const type_voting = 0; // 0 => стандартный, 1 => approval
let isParseProps = false;

// Кастомный клиент для обработки исключений

class ClientCustom extends snapshot.Client712 {
    async send(envelop) {
        const url = `${this.address}/api/msg`;
        const init = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(envelop)
        };
        return new Promise((resolve, reject) => {
            fetch(url, init).then((res) => {
                if (res.ok) {
                    return resolve(res.json());
                }
                throw res;
            })
            .catch(async (e) => {
                if (typeof e.text === 'function') { 
                    const text = await e.text();
                    try {
                        const data = JSON.parse(text);
                        reject(data);
                    } catch (e) {
                        reject({error: 'Error', error_description: 'Can\'t parse json in fetch'});
                    }
                } else {
                    reject({error: 'Error', error_description: e.message, error_stack: e.stack});
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

const sleep = async (millis) => new Promise(resolve => setTimeout(resolve, millis));

/**
 * Абстрактная задержка
 * @param {Integer} millis 
 * @returns 
 */

const wait = ms => new Promise(r => setTimeout(r, ms));

/**
 * Запись в итоговый результат
 * @param {String} address
 * @param {String} result
 * @returns
 */

const add_result = (address, result) => pretty_result.push({'Адрес': address, 'Результат': result});

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

const retryOperation = (address, operation, delay, retries) => new Promise((resolve, reject) => {
    return operation
        .then(resolve)
        .catch((reason) => {
            if (retries > 0) {
                if (typeof reason === 'string' && (reason.includes('timeout') || reason.includes('failed')) && retries === 3) {
                    retries = 1000;
                }
                console.log(`(Ошибка) ${address} => повторная отправка действия, задержка: ${delay}с, осталось попыток: ${retries - 1}`);
                return wait(delay*1000)
                    .then(retryOperation.bind(null, address, operation, delay, retries - 1))
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
 * @param {String} prop
 * @returns Promise
 */

const voteSnap = (ethWallet, address, prop) => new Promise(async (resolve, reject) => {
    await client.vote(ethWallet, address, {
        space: project,
        proposal: prop,
        type: type_voting == 0 ? 'single-choice' : 'approval',
        choice: rand_mode == 0 ? type_voting == 0 ? vote : Array.isArray(vote) ? vote : [vote] : type_voting == 0 ? randomIntInRange(random_min, random_max) : [randomIntInRange(random_min, random_max)],
        reason: '',
        app: 'snapshot'
    }).then((result) => {
        if (result.hasOwnProperty('id')) {
            console.log(`(Голосование) ${address} => голос засчитан`);
            add_result(address, 'засчитано');
        } else {
            console.log(`(Голосование) ${address} =>`);
            console.dir(result);
            add_result(address, 'неизвестно');
        }
        resolve();
    }).catch((err) => {
        if (typeof err.error_description !== 'string') {
            console.log(`(Голосование) ${address} => ошибка "${err.error}":`);
            console.dir(err.error_description);
            if (err.hasOwnProperty('error_stack')) {
                console.log(err.error_stack);
            }
        } else {
            console.log(`(Голосование) ${address} => ошибка "${err.error}": ${err.error_description}`);
            if (err.hasOwnProperty('error_stack')) {
                console.log(err.error_stack);
            }
        }
        add_result(address, `${err.error}: ${err.error_description}`);
        ((typeof err.error_description === 'string' && (err.error_description.includes('timeout') || err.error_description.includes('many') || err.error_description.includes('failed'))) || typeof err.error_description !== 'string') ? reject(err.error_description) : resolve();
    });
});

/**
 * Подписка
 * @param {Wallet} wallet 
 * @param {String} address
 * @returns Promise
 */

const subSnap = (ethWallet, address) => new Promise(async (resolve, reject) => {
    await client.follow(ethWallet, address, {
        space: project
    }).then((result) => {
        if (result.hasOwnProperty('id')) {
            console.log(`(Подписка) ${address} => вы подписались`);
        } else {
            console.log(`(Подписка) ${address} =>`);
            console.dir(result);
        }
        resolve();
    }).catch((err) => {
        if (typeof err.error_description !== 'string') {
            console.log(`(Подписка) ${address} => ошибка "${err.error}":`);
            console.dir(err.error_description);
            if (err.hasOwnProperty('error_stack')) {
                console.log(err.error_stack);
            }
        } else {
            console.log(`(Подписка) ${address} => ошибка "${err.error}": ${err.error_description}`);
            if (err.hasOwnProperty('error_stack')) {
                console.log(err.error_stack);
            }
        }
        ((typeof err.error_description === 'string' && (err.error_description.includes('timeout') || err.error_description.includes('many') || err.error_description.includes('failed'))) || typeof err.error_description !== 'string') ? reject(err.error_description) : resolve();
    });
});

// Авторство

console.log(`-=- snapshotvoter v${version} -=-`);
console.log('License: ISC\nAuthor: @JanSergeev\nDonate: 0x9D278054C3e73294215b63ceF34c385Abe52768B');

// Парсинг параметров

let project, prop_id, vote;
process.argv.forEach(function (val, index, array) {
    switch (index) {
        case 2:
            project = val;
        case 3:
            if (String(val).toLowerCase() == 'getprops') {
                isParseProps = true;
            } else {
                prop_id = val;
            }
        case 4:
            vote = val.includes(',') ? val.split(',').map(Number) : +val;
    }
});

// Unhandled errors/promises, fix app crash

process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----');
    console.dir(error);
    console.log('----- Exception origin -----');
    console.dir(origin);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----');
    console.dir(promise);
    console.log('----- Reason -----');
    console.dir(reason);
});

// Парсинг

if (isParseProps) {
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
    await fetch('https://hub.snapshot.org/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({query: q})
    }).then(r => r.json()).then(data => {
        if (data.hasOwnProperty('data') && data.data.hasOwnProperty('proposals')) {
            let arr = [];
            data.data.proposals.forEach(i => arr.push(i.id));
            fs.writeFileSync(path.join(__dirname, '/props.json'), JSON.stringify(arr, null, 4), { encoding: 'utf8', flag: 'w' });
            console.log('Данные сохранены, проверьте props.json.');
        } else {
            console.log('Ошибка при парсинге данных.')
        }
    });
    exit();
}

// Запуск rpc

const web3 = new ethers.providers.JsonRpcProvider(url);
const hub = 'https://hub.snapshot.org'; // or https://testnet.snapshot.org for testnet
const client = new ClientCustom(hub);

// Чтение аккаунтов

const adata = accs.importAccs();
let props_list = isPropList ? accs.importProps() : [prop_id];

// Перебор аккаунтов

let i = 0, promises = [], pretty_result = [];
for (let acc of adata) {
    const ethWallet = new ethers.Wallet(acc, web3);
    const address = await ethWallet.getAddress();
    let prom = promises.push(new Promise(async (resolve, reject) => {

        // Голосование

        let prom_list = [];
        props_list.forEach((prop) => prom_list.push(retryOperation(address, voteSnap(ethWallet, address, prop), isSleep ? randomIntInRange(sleep_from, sleep_to) : 1, 3)));

        // Подписка

        prom_list.push(retryOperation(address, subSnap(ethWallet, address), isSleep ? randomIntInRange(sleep_from, sleep_to) : 1, 3));
        
        await Promise.allSettled(prom_list).then(() => resolve());

    }));

    // Задержка

    if (isSleep) {
        let sle = randomIntInRange(sleep_from, sleep_to);
        promises.at(prom - 1).then(() => i < adata.length ? console.log(`Задержка ${sle}с..`) : null);
        i < adata.length ? await sleep(sle * 1000) : null;
    }

    ++i;
}

// Результат

await Promise.allSettled(promises).then(() => console.table(pretty_result));