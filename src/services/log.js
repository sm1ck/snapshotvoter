import { Message } from "react-bulma-components";
import DOMPurify from 'dompurify';
import { WS_TYPE } from "shared";

export default function jsonLogToString(json) {
    switch(json.type) {
        case WS_TYPE.VOTE:
            return(
            <Message color="success" key={json.keyIndex}>
                <Message.Header>Голосование</Message.Header>
                <Message.Body>
                    Адрес: {json.address}<br />
                    Проект: {json.project}<br />
                    Проползал: {json.propolsal}<br />
                    Голос: {json.vote} 
                </Message.Body>
            </Message>);
        case WS_TYPE.SUBSCRIBE:
            return(
            <Message color="success" key={json.keyIndex}>
                <Message.Header>Подписка</Message.Header>
                <Message.Body>
                    Адрес: {json.address}<br />
                    Проект: {json.project} 
                </Message.Body>
            </Message>);
        case WS_TYPE.INFO:
            return(
            <Message color="info" key={json.keyIndex}>
                <Message.Header>{json.head}</Message.Header>
                <Message.Body>
                    {json.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(json.message)}}></span> : ''}
                </Message.Body>
            </Message>);
        case WS_TYPE.END:
            return(
            <Message color="success" key={json.keyIndex}>
                <Message.Header>Конец работы</Message.Header>
                <Message.Body>
                    {json.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(json.message)}}></span> : ''}
                </Message.Body>
            </Message>);
        case WS_TYPE.ERROR:
            return(
            <Message color="danger" key={json.keyIndex}>
                <Message.Header>Ошибка{json.hasOwnProperty('space') ? ` | ${json.space}` : ''}</Message.Header>
                <Message.Body>
                    {json.hasOwnProperty('message') ? <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(json.message)}}></span> : ''}
                </Message.Body>
            </Message>);
        case WS_TYPE.ERROR_END:
            return(
            <Message color="danger" key={json.keyIndex}>
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
}