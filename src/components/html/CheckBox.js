import React, { useEffect } from "react";
import { Panel, Form } from "react-bulma-components";
import { INPUT_TYPE, EVENTS_TYPE } from "shared";
import { useToast } from "../../contexts/ToastContext";
import {
  useRenderInput,
  useFormSelect,
  dispatchHelpEvent,
  dispatchCheckBoxEvent,
} from "../../services/form";
import { labelStyle, panelStyle } from "../styles/styles";

export default function CheckBox({ type }) {
  const { size } = useToast();
  const formAttr = useFormSelect(type);
  const input = useRenderInput(formAttr.context, false, true);
  useEffect(() => {
    if (input.value) {
      dispatchHelpEvent(INPUT_TYPE.PROPOLSAL, EVENTS_TYPE.CLEAR);
    }
  }, [input.value]);
  return (
    <Panel.Block
      style={
        size.width >= 1024 ? { ...panelStyle, display: "flex" } : panelStyle
      }
    >
      <Form.Label
        style={
          size.width >= 1024 ? { ...labelStyle, whiteSpace: "pre" } : labelStyle
        }
      >
        {formAttr.label}
      </Form.Label>
      <Form.Checkbox
        onChange={input.onChange}
        onClick={() => dispatchCheckBoxEvent(INPUT_TYPE.PROPOLSAL)}
      ></Form.Checkbox>
    </Panel.Block>
  );
}
