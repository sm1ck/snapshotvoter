import React, { useEffect, useState, useCallback, useRef } from "react";
import useWebSocket from 'react-use-websocket';
import { Box } from "react-bulma-components";
import { INPUT_TYPE, RADIO_BUTTON_TYPE, CHECKBOX_TYPE, WS_TYPE } from "shared";
import { deepCheck, validateEth, validateProposal, validateIntegerWithHyphen } from "../services/form";
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

    // Отправляем данные на бекенд через веб-сокет

    const handleClickStartVote = useCallback(() => sendJsonMessage({
        type: 'Vote',
        project: projectRef.current,
        propolsal: propolsalRef.current,
        vote: selectorInputRef.current,
        sleep: sleepRef.current,
        typeVote: typeVotingRef.current,
        parseProps: parsePropsRef.current
    }), [sendJsonMessage, projectRef, propolsalRef, selectorInputRef, sleepRef, typeVotingRef, parsePropsRef]);

    const handleClickStopVote = useCallback(() => sendJsonMessage({ type: 'Stop' }), [sendJsonMessage]);

    // Валидация формы при отправке

    const onVote = () => {
        if (!deepCheck(INPUT_TYPE.PROJECT, validateEth(projectRef.current), 'Название должно заканчиваться на .eth')) {
            return;
        } else if (!parsePropsRef.current && !deepCheck(INPUT_TYPE.PROPOLSAL, validateProposal(propolsalRef.current), 'ID проползала должен начинаться с 0x и иметь длинну 66 символов')) {
            return;
        } else if (!deepCheck(INPUT_TYPE.SELECTOR, validateIntegerWithHyphen(selectorInputRef.current), 'Вариант должен быть целым числом')) {
            return;
        } else if (!deepCheck(INPUT_TYPE.SLEEP, validateIntegerWithHyphen(sleepRef.current), 'Значение задержки должно быть целым числом')) {
            return;
        }
        setStarted(true);
        handleClickStartVote();
    };

    const onStop = () => {
        setStarted(false);
        handleClickStopVote();
    };

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
        <ToastContext.Provider value={{toast: lastJsonMessage, readyState, setStarted, page, setPage, size, isStarted, messageHistory}}>
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
                        <SendButton onVote={onVote} onStop={onStop} />
                    </InputContext.Provider>
                </Box>
                <Logs />
            </ParentComponent>
        </ToastContext.Provider>
    );
};