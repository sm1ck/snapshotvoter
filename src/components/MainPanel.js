import React, { useEffect, useState, useRef } from "react";
import useWebSocket from 'react-use-websocket';
import { Box } from "react-bulma-components";
import { INPUT_TYPE, RADIO_BUTTON_TYPE, CHECKBOX_TYPE, WS_TYPE } from "shared";
import jsonLogToString from "../services/log";
import { useWindowSize } from "../services/window";
import { ToastContext } from "../contexts/ToastContext";
import { InputContext } from "../contexts/InputContext";
import ParentComponent from './ParentComponent';
import NavBar from "./html/NavBar";
import InputText from "./html/InputText";
import RadioButton from "./html/RadioButton";
import CheckBox from "./html/CheckBox";
import SendButton from "./html/SendButton";
import Title from "./Title";
import Logs from "./Logs";
import Toast from "./Toast";

export default function MainPanel() {
    // Флаг активной работы бекенда
    const [isStarted, setStarted] = useState(false);
    // История сообщений
    const [messageHistory, setMessageHistory] = useState(['пока тут пусто 😉']);
    // Инпуты для формы
    const projectRef = useRef('');
    const propolsalRef = useRef('');
    const selectorInputRef = useRef('');
    const sleepRef = useRef('');
    const typeVotingRef = useRef('0');
    const parsePropsRef = useRef('');
    // Активная страница приложения
    const [page, setPage] = useState(0);
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket('ws://localhost/api', {
        shouldReconnect: () => true,
        reconnectInterval: 5000
    });
    const size = useWindowSize();

    useEffect(() => {
        if (lastJsonMessage !== null) {
            setMessageHistory((prev) => [jsonLogToString(lastJsonMessage), ...prev]);
            if (lastJsonMessage.type === WS_TYPE.END || lastJsonMessage.type === WS_TYPE.ERROR_END) {
                setStarted(false);
            }
        }
    }, [lastJsonMessage, setMessageHistory]);

    useEffect(() => {
        if (isStarted) {
            setMessageHistory([]);
        }
    }, [isStarted, setMessageHistory]);

    // Прокидываем все в контекст
    return (
        <ToastContext.Provider value={{toast: lastJsonMessage, readyState, setStarted, page, setPage, size, isStarted, messageHistory, sendJsonMessage}}>
            {page === 0 ? <Title title={`${process.env.REACT_APP_NAME} v${process.env.REACT_APP_VERSION} | Главная`} /> : <Title title={`${process.env.REACT_APP_NAME} v${process.env.REACT_APP_VERSION} | Логи`} />}
            <Toast />
            <NavBar />
            <ParentComponent>
                <Box style={page === 0 ? {display: 'block'} : {display: 'none'}}>
                    <InputContext.Provider value={{projectRef, propolsalRef, selectorInputRef, sleepRef, typeVotingRef, parsePropsRef}}>
                        <InputText type={INPUT_TYPE.PROJECT} />
                        <InputText type={INPUT_TYPE.PROPOLSAL} />
                        <InputText type={INPUT_TYPE.SELECTOR} />
                        <InputText type={INPUT_TYPE.SLEEP} />
                        <RadioButton type={RADIO_BUTTON_TYPE.VOTE} />
                        <CheckBox type={CHECKBOX_TYPE.PARSEPROPS} />
                        <SendButton />
                    </InputContext.Provider>
                </Box>
                <Logs />
            </ParentComponent>
        </ToastContext.Provider>
    );
};