import React, { useRef, useEffect} from "react";
import {toast as to, Toaster } from 'react-hot-toast';
import { useToast } from '../contexts/ToastContext';
import { ReadyState } from "react-use-websocket";
import DOMPurify from 'dompurify';

// Компонент вывода всплывающих подсказок

export default function Toast() {
    const {toast, readyState, setStarted} = useToast();
    const ref = useRef(null);

    const reconnect = () => to(
        <span style={{textAlign: 'center'}}>
            <b>Переподключение к ws</b><br />
            ожидайте..
        </span>, {
            icon: '⚠',
            style: {
                backgroundColor: 'rgb(255, 153, 0, 0.4)',
            }
        }
    );

    const connect = () => to.success(
        <span style={{textAlign: 'center'}}>
            <b>Подключение к ws</b><br />
            успешно!
        </span>, {
            style: {
                backgroundColor: 'rgb(97, 211, 69, 0.4)',
            }
        }
    );

    const end = () => to.success(
        <span style={{textAlign: 'center'}}>
            <b>Конец работы</b><br />
            {toast.message}..
        </span>, {
            style: {
                backgroundColor: 'rgb(97, 211, 69, 0.4)',
            }
        }
    );

    const info = () => to(
        <span style={{textAlign: 'center'}}>
            <b>{toast.head}</b><br />
            {toast !== null && toast !== undefined && toast.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(toast.head === 'Список проползалов' ? String(toast.message).split('<br />').map((e) => e.slice(0, 7)).join('<br />') : toast.message)}}></span> : ''}
        </span>, {
            icon: 'ℹ',
            style: {
                backgroundColor: 'rgb(158, 223, 255, 0.4)',
            }
        }
    );

    const vote = () => to(
        <span style={{textAlign: 'center'}}>
            <b>Голосование</b><br />
            {String(toast.address).slice(0, 7)}..
        </span>, {
            icon: 'ℹ',
            style: {
                backgroundColor: 'rgb(158, 223, 255, 0.4)',
            }
        }
    );

    const subscribe = () => to(
        <span style={{textAlign: 'center'}}>
            <b>Подписка</b><br />
            {String(toast.address).slice(0, 7)}..
        </span>, {
            icon: 'ℹ',
            style: {
                backgroundColor: 'rgb(158, 223, 255, 0.4)',
            }
        }
    );

    const error = () => to.error(
        <span style={{textAlign: 'center'}}>
            <b>Ошибка{toast !== null && toast !== undefined && toast.hasOwnProperty('space') ? ` | ${toast.space}` : ''}</b><br />
            {toast !== null && toast !== undefined && toast.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(toast.message)}}></span> : ''}..
        </span>, {
            style: {
                backgroundColor: 'rgb(255, 0, 0, 0.4)',
            }
        }
    );

    const error_custom = (custom) => to.error(
        <span style={{textAlign: 'center'}}>
            <b>Ошибка | {custom.space}</b><br />
            {custom.message}..
        </span>, {
            style: {
                backgroundColor: 'rgb(255, 0, 0, 0.4)',
            }
        }
    );

    const error_end = () => to.error(
        <span style={{textAlign: 'center'}}>
            <b>Аварийная остановка</b><br />
            {toast.head}<br />
            {toast !== null && toast !== undefined && toast.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(toast.message)}}></span> : ''}
        </span>, {
            style: {
                backgroundColor: 'rgb(255, 0, 0, 0.4)',
            }
        }
    );

    useEffect(() => {
        if (toast !== null && toast !== ref.current) {
            ref.current = toast;
            switch(toast.type) {
                case 'Vote':
                    vote();
                    break;
                case 'Subscribe':
                    subscribe();
                    break;
                case 'Info':
                    info();
                    break;
                case 'End':
                    end();
                    setStarted(false);
                    break;
                case 'Error':
                    error();
                    break;
                case 'ErrorEnd':
                    error_end();
                    setStarted(false);
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