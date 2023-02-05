import React, { useEffect, useCallback } from "react";
import { Panel, Form } from "react-bulma-components";
import { EVENTS_TYPE, INPUT_TYPE } from "shared";
import { useInput, useFormSelect } from "../../services/form";
import { labelStyle, panelStyle, helpStyle } from "../styles/styles";

export default function InputText({type}) {
    const formAttr = useFormSelect(type);
    const input = useInput(formAttr.context);
    const onHelpEvent = useCallback((e) => {
        if (e.detail.type !== type) {
            return false;
        }
        if (e.detail.message === EVENTS_TYPE.CLEAR) {
            input.clear();
        } else {
            input.danger(e.detail.message);
        }
    }, [input, type]);
    const onCheckBoxEvent = useCallback(() => {
        if (type === INPUT_TYPE.PROPOLSAL) {
            input.setDisabled(!input.disabled);
        }
    }, [input, type]);
    useEffect(() => {
        window.addEventListener(EVENTS_TYPE.HELP.toString(), onHelpEvent);
        window.addEventListener(EVENTS_TYPE.CHECKBOX.toString(), onCheckBoxEvent);
        return () => {
            window.removeEventListener(EVENTS_TYPE.HELP.toString(), onHelpEvent);
            window.removeEventListener(EVENTS_TYPE.CHECKBOX.toString(), onCheckBoxEvent);
        }
    }, [onHelpEvent, onCheckBoxEvent]);
    return (
        <Panel.Block style={panelStyle}>
            <Form.Label style={labelStyle}>{formAttr.label}</Form.Label>
            <Form.Input
                placeholder={formAttr.placeholder}
                type="text"
                color={input.color}
                onChange={input.onChange}
                disabled={input.disabled}
            />
            <Form.Help style={helpStyle} color={input.color}>{input.help}</Form.Help>
        </Panel.Block>
    );
};