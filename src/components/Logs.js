import React, { useEffect, useState } from "react";
import { Box, Message } from "react-bulma-components";
import DOMPurify from 'dompurify';

// Компонент для вывода логов

const logStyle = {
    overflowWrap: 'break-word'
};

const jsonLogToString = (json) => {
    let str = null;
    switch(json.type) {
        case 'Vote':
            str =
            <Message color="success">
                <Message.Header>Голосование</Message.Header>
                <Message.Body>
                    Адрес: {json.address}<br />
                    Проект: {json.project}<br />
                    Проползал: {json.propolsal}<br />
                    Голос: {json.vote} 
                </Message.Body>
            </Message>;
            break;
        case 'Subscribe':
            str =
            <Message color="success">
                <Message.Header>Подписка</Message.Header>
                <Message.Body>
                    Адрес: {json.address}<br />
                    Проект: {json.project} 
                </Message.Body>
            </Message>;
            break;
        case 'Info':
            str =
            <Message color="info">
                <Message.Header>{json.head}</Message.Header>
                <Message.Body>
                    {json.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(json.message)}}></span> : ''}
                </Message.Body>
            </Message>;
            break;
        case 'End':
            str =
            <Message color="success">
                <Message.Header>Конец работы</Message.Header>
                <Message.Body>
                    {json.message}
                </Message.Body>
            </Message>;
            break;
        case 'Error':
            str =
            <Message color="danger">
                <Message.Header>Ошибка{json.hasOwnProperty('space') ? ` | ${json.space}` : ''}</Message.Header>
                <Message.Body>
                    {json.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(json.message)}}></span> : ''}
                </Message.Body>
            </Message>;
            break;
        case 'ErrorEnd':
            str =
            <Message color="danger">
                <Message.Header>Аварийная остановка</Message.Header>
                <Message.Body>
                    {json.head}<br />
                    {json.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(json.message)}}></span> : ''}
                </Message.Body>
            </Message>;
            break;
        default:

    }
    return str;
};

export default function Logs({ lastJsonMessage, page, isStarted }) {
    const [messageHistory, setMessageHistory] = useState([]);
    useEffect(() => {
        if (lastJsonMessage !== null) {
            setMessageHistory((prev) => prev.concat(lastJsonMessage));
        }
    }, [lastJsonMessage, setMessageHistory]);
    useEffect(() => {
        if (isStarted) {
            setMessageHistory([]);
        }
    }, [isStarted, setMessageHistory]);
    return (
        <>
            <Box style={page === 1 ? {...logStyle, display: 'block'} : {...logStyle, display: 'none'}}>
                {messageHistory.length !== 0 ? messageHistory.map((json) => jsonLogToString(json)).reverse() : 'пусто 😉'}
            </Box>
        </>
    );
}