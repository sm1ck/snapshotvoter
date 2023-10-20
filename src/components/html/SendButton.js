import React, { useCallback } from "react";
import { Panel, Button } from "react-bulma-components";
import { ReadyState } from "react-use-websocket";
import { INPUT_TYPE } from "shared";
import {
  deepCheck,
  validateProposal,
  validateIntegerWithHyphen,
} from "../../services/form";
import { useToast } from "../../contexts/ToastContext";
import { useInputContext } from "../../contexts/InputContext";
import { panelStyle } from "../styles/styles";

export default function SendButton() {
  const { isStarted, readyState, sendJsonMessage, setStarted } = useToast();
  const {
    projectRef,
    propolsalRef,
    selectorInputRef,
    sleepRef,
    typeVotingRef,
    parsePropsRef,
    subscribeRef,
  } = useInputContext();

  // Отправляем данные на бекенд через веб-сокет

  const handleClickStartVote = useCallback(
    () =>
      sendJsonMessage({
        type: "Vote",
        project: projectRef.current,
        propolsal: propolsalRef.current,
        vote: selectorInputRef.current,
        sleep: sleepRef.current,
        typeVote: typeVotingRef.current,
        parseProps: parsePropsRef.current,
        subscribe: subscribeRef.current,
      }),
    [
      sendJsonMessage,
      projectRef,
      propolsalRef,
      selectorInputRef,
      sleepRef,
      typeVotingRef,
      parsePropsRef,
      subscribeRef,
    ]
  );

  const handleClickStopVote = useCallback(
    () => sendJsonMessage({ type: "Stop" }),
    [sendJsonMessage]
  );

  // Валидация формы при отправке

  const onVote = () => {
    if (!deepCheck(INPUT_TYPE.PROJECT)) {
      return;
    } else if (
      !parsePropsRef.current &&
      !deepCheck(
        INPUT_TYPE.PROPOLSAL,
        validateProposal(propolsalRef.current),
        "ID проползала должен начинаться с 0x и иметь длинну 66 символов"
      )
    ) {
      return;
    } else if (
      !deepCheck(
        INPUT_TYPE.SELECTOR,
        validateIntegerWithHyphen(selectorInputRef.current),
        "Вариант должен быть целым числом"
      )
    ) {
      return;
    } else if (
      !deepCheck(
        INPUT_TYPE.SLEEP,
        validateIntegerWithHyphen(sleepRef.current),
        "Значение задержки должно быть целым числом"
      )
    ) {
      return;
    }
    setStarted(true);
    handleClickStartVote();
  };

  const onStop = () => {
    setStarted(false);
    handleClickStopVote();
  };

  return (
    <Panel.Block style={panelStyle}>
      <Button
        color="link"
        onClick={() => onVote()}
        disabled={readyState !== ReadyState.OPEN || isStarted}
      >
        Проголосовать
      </Button>{" "}
      <Button color="danger" onClick={() => onStop()} disabled={!isStarted}>
        Завершить
      </Button>
    </Panel.Block>
  );
}
