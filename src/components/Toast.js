import React, { useRef, useEffect} from "react";
import {toast as to, Toaster } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { WS_TYPE } from "shared";
import { useToast } from '../contexts/ToastContext';
import { ReadyState } from "react-use-websocket";

// Компонент вывода всплывающих подсказок

export default function Toast() {
    // Принимаем данные через контекст
    const {toast, readyState, page} = useToast();
    // Ссылка для кеша предыдущего состояния, возможно избыточно (?)
    const ref = useRef(null);

    const reconnect = () => to(
        <span>
            <b>Переподключение к ws</b><br />
            ожидайте..
        </span>, {
            icon: '⚠',
            style: {
                backgroundColor: 'rgb(255, 153, 0, 0.4)',
                textAlign: 'center'
            }
        }
    );

    const connect = () => to.success(
        <span>
            <b>Подключение к ws</b><br />
            успешно!
        </span>, {
            style: {
                backgroundColor: 'rgb(97, 211, 69, 0.4)',
                textAlign: 'center'
            }
        }
    );

    const end = () => to.success(
        <span>
            <b>Конец работы</b><br />
            {toast !== null && toast !== undefined && toast.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(toast.message)}}></span> : ''}
        </span>, {
            style: {
                backgroundColor: 'rgb(97, 211, 69, 0.4)',
                textAlign: 'center'
            }
        }
    );

    const info = () => to(
        <span>
            <b>{toast.head}</b><br />
            {toast !== null && toast !== undefined && toast.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(toast.head === 'Список проползалов' ? String(toast.message).split('<br />').map((e) => e.slice(0, 7)).join('<br />') : toast.message)}}></span> : ''}
        </span>, {
            icon: 'ℹ',
            style: {
                backgroundColor: 'rgb(158, 223, 255, 0.4)',
                textAlign: 'center'
            }
        }
    );

    const vote = () => to(
        <span>
            <b>Голосование</b><br />
            {String(toast.address).slice(0, 7)}..
        </span>, {
            icon: 'ℹ',
            style: {
                backgroundColor: 'rgb(158, 223, 255, 0.4)',
                textAlign: 'center'
            }
        }
    );

    const subscribe = () => to(
        <span>
            <b>Подписка</b><br />
            {String(toast.address).slice(0, 7)}..
        </span>, {
            icon: 'ℹ',
            style: {
                backgroundColor: 'rgb(158, 223, 255, 0.4)',
                textAlign: 'center'
            }
        }
    );

    const error = () => to.error(
        <span>
            <b>Ошибка{toast !== null && toast !== undefined && toast.hasOwnProperty('space') ? ` | ${toast.space}` : ''}</b><br />
            {toast !== null && toast !== undefined && toast.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(toast.message)}}></span> : ''}..
        </span>, {
            style: {
                backgroundColor: 'rgb(255, 0, 0, 0.4)',
                textAlign: 'center'
            }
        }
    );

    const error_custom = (custom) => to.error(
        <span>
            <b>Ошибка | {custom.space}</b><br />
            {custom.message}..
        </span>, {
            style: {
                backgroundColor: 'rgb(255, 0, 0, 0.4)',
                textAlign: 'center'
            }
        }
    );

    const error_end = () => to.error(
        <span>
            <b>Аварийная остановка</b><br />
            {toast.head}<br />
            {toast !== null && toast !== undefined && toast.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(toast.message)}}></span> : ''}
        </span>, {
            style: {
                backgroundColor: 'rgb(255, 0, 0, 0.4)',
                textAlign: 'center'
            }
        }
    );

    useEffect(() => {
        if (toast !== null && toast !== ref.current) {
            ref.current = toast;
            // Не рендерим подсказки на странице логов
            if (page === 1) {
                return;
            }
            switch(toast.type) {
                case WS_TYPE.VOTE:
                    vote();
                    break;
                case WS_TYPE.SUBSCRIBE:
                    subscribe();
                    break;
                case WS_TYPE.INFO:
                    info();
                    break;
                case WS_TYPE.END:
                    end();
                    break;
                case WS_TYPE.ERROR:
                    error();
                    break;
                case WS_TYPE.ERROR_END:
                    error_end();
                    break;
                default:
                    error_custom({space: 'Тип данных ws', message: 'Неизвестный тип'});
            }
        }
    });

    useEffect(() => {
        switch(readyState) {
            case ReadyState.CLOSING:
                reconnect();
                break;
            case ReadyState.OPEN:
                connect();
                break;
            default:
        }
    }, [readyState]);

    return (
        <>
        <div>
            <Toaster position="top-right" reverseOrder={false} />
        </div>
        </>
    );
}