import React, { useEffect, useState } from "react";
import { Box, Message } from "react-bulma-components";
import DOMPurify from 'dompurify';

const logStyle = {
    overflowWrap: 'break-word'
};

const jsonLogToString = (json) => {
    switch(json.type) {
        case 'Vote':
            return(
            <Message color="success">
                <Message.Header>Голосование</Message.Header>
                <Message.Body>
                    Адрес: {json.address}<br />
                    Проект: {json.project}<br />
                    Проползал: {json.propolsal}<br />
                    Голос: {json.vote} 
                </Message.Body>
            </Message>);
        case 'Subscribe':
            return(
            <Message color="success">
                <Message.Header>Подписка</Message.Header>
                <Message.Body>
                    Адрес: {json.address}<br />
                    Проект: {json.project} 
                </Message.Body>
            </Message>);
        case 'Info':
            return(
            <Message color="info">
                <Message.Header>{json.head}</Message.Header>
                <Message.Body>
                    {json.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(json.message)}}></span> : ''}
                </Message.Body>
            </Message>);
        case 'End':
            return(
            <Message color="success">
                <Message.Header>Конец работы</Message.Header>
                <Message.Body>
                    {json.message}
                </Message.Body>
            </Message>);
        case 'Error':
            return(
            <Message color="danger">
                <Message.Header>Ошибка{json.hasOwnProperty('space') ? ` | ${json.space}` : ''}</Message.Header>
                <Message.Body>
                    {json.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(json.message)}}></span> : ''}
                </Message.Body>
            </Message>);
        case 'ErrorEnd':
            return(
            <Message color="danger">
                <Message.Header>Аварийная остановка</Message.Header>
                <Message.Body>
                    {json.head}<br />
                    {json.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(json.message)}}></span> : ''}
                </Message.Body>
            </Message>);
        default:
            return(
            <Message color="danger">
                <Message.Header>Неизвестный тип данных</Message.Header>
                <Message.Body>
                    Приложение передало с бекэнда неподдерживаемый тип данных.
                </Message.Body>
            </Message>);
    }
};

// Компонент вывода логов

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