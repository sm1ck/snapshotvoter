/**
 * Скрипт для голосования на snapshot.org
 * @Author Jancrypto (telegram)
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
 */

import ethers from 'ethers';
import snapshot from '@snapshot-labs/snapshot.js';
import * as accs from './accs.js';

// rpc node url

const url = "https://rpc.ankr.com/eth";

// Базовые переменные

const rand_mode = 0; // 0 => стандартный, 1 => рандомная отправка варианта
const random_min = 1; // минимальный номер в голосовании
const random_max = 4; // максимальный номер в голосовании
const isSleep = false; // задержка перед отправкой, нужна ли? изменить на true, если нужна
const sleep_from = 30; // от 30 секунд
const sleep_to = 60; // до 60 секунд
const isPropList = false; // кастомный список проползалов

/**
 * Абстрактная задержка
 * @param {Integer} millis 
 * @returns 
 */

const sleep = async (millis) => {
    return new Promise(resolve => setTimeout(resolve, millis));
};

/**
 * Случайное min/max целое значение
 * @param {Integer} min 
 * @param {Integer} max 
 * @returns Случайное число
 */

const randomIntInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Парсинг параметров

let project, prop_id, vote;
process.argv.forEach(function (val, index, array) {
    switch (index) {
        case 2:
            project = val;
        case 3:
            prop_id = val;
        case 4:
            vote = val;
    }
});

// Запуск rpc

const web3 = new ethers.providers.JsonRpcProvider(url);
const hub = 'https://hub.snapshot.org'; // or https://testnet.snapshot.org for testnet
const client = new snapshot.Client712(hub);

// Чтение аккаунтов

const adata = accs.importAccs();
let props_list = isPropList ? accs.importProps() : [prop_id];

// Перебор аккаунтов

let i = 0;
for (let acc of adata) {
    const ethWallet = new ethers.Wallet(acc, web3);
    const address = await ethWallet.getAddress();
    let prom = new Promise(async (resolve, reject) => {

        // Голосование

        let prom_list = [];
        for (let prop of props_list) {
            prom_list.push(new Promise((resolve, reject) => {
                const prom_vote = client.vote(ethWallet, address, {
                    space: project,
                    proposal: prop,
                    type: 'single-choice',
                    choice: rand_mode == 0 ? Number(vote) : randomIntInRange(random_min, random_max),
                    reason: '',
                    app: 'snapshot'
                }).then((result) => {
                    if (result.hasOwnProperty('id')) {
                        console.log('(Голосование) '+address+' => голос засчитан');
                    } else {
                        console.log('(Голосование) '+address+' =>');
                        console.dir(result);
                    }
                    resolve();
                }).catch((err) => {
                    console.log('(Голосование) '+address+' => ошибка "'+err.error+'": '+err.error_description);
                    resolve();
                });
            }));
        }

        // Подписка

        prom_list.push(new Promise((resolve, reject) => {
            const prom_sub = client.follow(ethWallet, address, {
                space: project
            }).then((result) => {
                if (result.hasOwnProperty('id')) {
                    console.log('(Подписка) '+address+' => вы подписались');
                } else {
                    console.log('(Подписка) '+address+' =>');
                    console.dir(result);
                }
                resolve();
            }).catch((err) => {
                console.log('(Подписка) '+address+' => ошибка "'+err.error+'": '+err.error_description);
                resolve();
            });
        }));
        
        await Promise.all(prom_list).then(() => resolve());

    });
    ++i;

    // Задержка

    if (isSleep) {
        let sle = randomIntInRange(sleep_from, sleep_to);
        prom.then(() => i < adata.length ? console.log('Задержка '+sle+'с..') : null);
        if (i < adata.length) {
            await sleep(sle * 1000);
        }  
    }
}