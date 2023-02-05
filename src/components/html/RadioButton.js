import React from "react";
import { Panel, Form } from "react-bulma-components";
import { useToast } from "../../contexts/ToastContext";
import { useRenderInput, useFormSelect } from "../../services/form";
import { panelStyle, labelStyle } from "../styles/styles";

export default function RadioButton({type}) {
    const { size } = useToast();
    const formAttr = useFormSelect(type);
    const input = useRenderInput(formAttr.context, false);
    const renderRadioButton = () => formAttr.radio.map((v, i) => {
        return(
            <Form.Radio
                onChange={input.onChange}
                checked={input.value === String(i)}
                value={i}
                key={`radiobutton${i}`}
            >{v}</Form.Radio>
        );
    });
    const onRenderRadioButton = renderRadioButton();
    return (
        <Panel.Block style={size.width >= 1024 ? {...panelStyle, display: 'flex'} : panelStyle}>
            <Form.Label style={size.width >= 1024 ? {...labelStyle, whiteSpace: 'pre'} : labelStyle}>{formAttr.label}</Form.Label>
            {onRenderRadioButton}
        </Panel.Block>
    );
};