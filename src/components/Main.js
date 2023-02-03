import React, { useEffect, useState, useCallback } from "react";
import { Container, Panel, Form, Box, Button, Navbar} from "react-bulma-components";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useInput, useRenderInput, fastCheck, validateEth, validateProposal, validateIntegerWithHyphen } from "../services/form";
import { useWindowSize } from "../services/window";
import { ToastContext } from '../contexts/ToastContext';
import Toast from "./Toast";
import Logs from "./Logs";
import Title from "./Title";

// Быстрые стили

const helpStyle = {
    fontSize: '0.85rem',
    marginTop: 0
};

const panelStyle = {
    borderBottom: 0,
    alignItems: 'baseline',
    display: 'block'
};

const labelStyle = {
    width: '100%',
    maxWidth: 'max-content'
};

const navbarStyle = {
    backgroundColor: '#ededed',
    display: 'flex'
};

// Главный компонент

export default function Main() {
    // Флаг активной работы бекенда
    const [isStarted, setStarted] = useState(false);
    // Инпуты для формы
    const project = useInput('');
    const propolsal = useInput('');
    const selectorInput = useInput('');
    const sleep = useInput('');
    const typeVoting = useRenderInput('0', false);
    const parseProps = useRenderInput(false, false, true);
    // Последняя полученная подсказка
    const [toast, setToast] = useState(null);
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
        project: project.value.current,
        propolsal: propolsal.value.current,
        vote: selectorInput.value.current,
        sleep: sleep.value.current,
        typeVote: typeVoting.rvalue.current,
        parseProps: parseProps.rvalue.current
    }), [sendJsonMessage, project.value, propolsal.value, selectorInput.value, sleep.value, typeVoting.rvalue, parseProps.rvalue]);

    const handleClickStopVote = useCallback(() => sendJsonMessage({ type: 'Stop' }), [sendJsonMessage]);

    // Валидация формы при отправке

    const onVote = () => {
        if (!fastCheck(project, validateEth(project.value.current), 'Название должно заканчиваться на .eth')) {
            return;
        } else if (!parseProps.rvalue.current && !fastCheck(propolsal, validateProposal(propolsal.value.current), 'ID проползала должен начинаться с 0x и иметь длинну 66 символов')) {
            return;
        } else if (!fastCheck(selectorInput, validateIntegerWithHyphen(selectorInput.value.current), 'Вариант должен быть целым числом')) {
            return;
        } else if (!fastCheck(sleep, validateIntegerWithHyphen(sleep.value.current), 'Значение задержки должно быть целым числом')) {
            return;
        }
        setStarted(true);
        handleClickStartVote();
    };

    const onStop = () => {
        setStarted(false);
        handleClickStopVote();
    };

    const onTogglePage = (num) => setPage(num);

    useEffect(() => {
        if (lastJsonMessage !== null) {
            setToast(lastJsonMessage);
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        if (parseProps.value) {
            propolsal.clear();
        }
    }, [parseProps.value, propolsal]);

    return (
        <>
        {page === 0 ? <Title title={`${process.env.REACT_APP_NAME} v${process.env.REACT_APP_VERSION} | Главная`} /> : <Title title={`${process.env.REACT_APP_NAME} v${process.env.REACT_APP_VERSION} | Логи`} />}
        <ToastContext.Provider value={{toast, readyState, setStarted, page}}>
            <Toast />
        </ToastContext.Provider>
        <Container>
            <Panel>
                <Panel.Header>
                    <Navbar style={navbarStyle}>
                        <Navbar.Item onClick={() => onTogglePage(0)}>Голосование</Navbar.Item> <Navbar.Item onClick={() => onTogglePage(1)}>Логи</Navbar.Item>
                    </Navbar>
                </Panel.Header>
                <Box style={page === 0 ? {display: 'block'} : {display: 'none'}}>
                    <Panel.Block style={panelStyle}>
                        <Form.Label style={labelStyle}>Название проекта:</Form.Label>
                        <Form.Input
                            placeholder="например stgdao.eth"
                            type="text"
                            color={project.color}
                            {...project.bind}
                        />
                        <Form.Help style={helpStyle} color={project.color}>{project.help}</Form.Help>
                    </Panel.Block>
                    <Panel.Block style={panelStyle}>
                        <Form.Label style={labelStyle}>ID проползала:</Form.Label>
                        <Form.Input
                            placeholder="например 0x4218ee725798f5450583c29e20fa231c782b9f6880ef9170229235e9eb0442ef"
                            type="text"
                            color={propolsal.color}
                            disabled={parseProps.value}
                            {...propolsal.bind}
                        />
                        <Form.Help style={helpStyle} color={propolsal.color}>{propolsal.help}</Form.Help>
                    </Panel.Block>
                    <Panel.Block style={panelStyle}>
                        <Form.Label style={labelStyle}>Введите номер варианта:</Form.Label>
                        <Form.Input
                                placeholder="например 1 или 1-4 для случайного варианта"
                                type="text"
                                color={selectorInput.color}
                                {...selectorInput.bind}
                        />
                        <Form.Help style={helpStyle} color={selectorInput.color}>{selectorInput.help}</Form.Help>
                    </Panel.Block>
                    <Panel.Block style={panelStyle}>
                        <Form.Label style={labelStyle}>Введите значение задержки:</Form.Label>
                        <Form.Input
                                placeholder="например 0 или 5-10"
                                type="text"
                                color={sleep.color}
                                {...sleep.bind}
                        />
                        <Form.Help style={helpStyle} color={sleep.color}>{sleep.help}</Form.Help>
                    </Panel.Block>
                    <Panel.Block style={size.width >= 1024 ? {...panelStyle, display: 'flex'} : panelStyle}>
                        <Form.Label style={size.width >= 1024 ? {...labelStyle, whiteSpace: 'pre'} : labelStyle}>Тип голосования:  </Form.Label>
                        <Form.Radio
                                {...typeVoting.bind}
                                checked={typeVoting.value === '0'}
                                value="0"
                        >Обычный</Form.Radio>
                        <Form.Radio
                                {...typeVoting.bind}
                                checked={typeVoting.value === '1'}
                                value="1"
                        >Approval</Form.Radio>
                    </Panel.Block>
                    <Panel.Block style={size.width >= 1024 ? {...panelStyle, display: 'flex'} : panelStyle}>
                        <Form.Label style={size.width >= 1024 ? {...labelStyle, whiteSpace: 'pre'} : labelStyle}>Голосовать во всех активных проползалах проекта:  </Form.Label>
                        <Form.Checkbox {...parseProps.bind}></Form.Checkbox>
                    </Panel.Block>
                    <Panel.Block style={panelStyle}>
                        <Button color="link" onClick={() => onVote()} disabled={readyState !== ReadyState.OPEN || isStarted}>Проголосовать</Button> <Button color="danger" onClick={() => onStop()} disabled={!isStarted}>Завершить</Button>
                    </Panel.Block>
                </Box>
                <Logs lastJsonMessage={lastJsonMessage} page={page} isStarted={isStarted} />
            </Panel>
        </Container>
        </>
    );
}