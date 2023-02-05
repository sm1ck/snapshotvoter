import React from "react";
import { Panel, Button } from "react-bulma-components";
import { ReadyState } from "react-use-websocket";
import { useToast } from "../../contexts/ToastContext";
import { panelStyle } from "../styles/styles";

export default function SendButton({onVote, onStop}) {
    const { isStarted, readyState } = useToast();
    return (
        <Panel.Block style={panelStyle}>
            <Button color="link" onClick={() => onVote()} disabled={readyState !== ReadyState.OPEN || isStarted}>Проголосовать</Button> <Button color="danger" onClick={() => onStop()} disabled={!isStarted}>Завершить</Button>
        </Panel.Block>
    );
};