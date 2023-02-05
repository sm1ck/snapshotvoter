import { useState } from "react";
import { INPUT_TYPE, RADIO_BUTTON_TYPE, CHECKBOX_TYPE, EVENTS_TYPE } from "shared";
import { useInputContext } from "../contexts/InputContext";

// Валидация инпутов

const fastCheck = (hook) => {
    if (!hook.value.current) {
        hook.danger('Поле не должно быть пустым');
        return false;
    }
    hook.clear();
    return true;
};

export const deepCheck = (type, customCheck = true, customResponse = '') => {
    if (!customCheck) {
        dispatchHelpEvent(type, customResponse);
        return false;
    } else {
        dispatchHelpEvent(type, EVENTS_TYPE.CLEAR);
        return true;
    }
};

// Отправка события для использования полей помощников

export const dispatchHelpEvent = (type, message) => {
    const helpEvent = new CustomEvent(
        EVENTS_TYPE.HELP.toString(), 
        { 
            detail: {
                type,
                message
            }
        }
    );
    window.dispatchEvent(helpEvent);
};

// Отправка события для использования полей помощников

export const dispatchCheckBoxEvent = () => {
    const checkBoxEvent = new CustomEvent(
        EVENTS_TYPE.CHECKBOX.toString(), 
        { 
            detail: {}
        }
    );
    window.dispatchEvent(checkBoxEvent);
};

// Проверка на число

const isInteger = (int) => !isNaN(String(int)) && Number.isInteger(+(int));

// Проверка на окончание с .eth

export const validateEth = (s) => String(s).toLowerCase().endsWith('.eth');

// Проверка на формат пропозала

export const validateProposal = (s) => String(s).toLowerCase().startsWith('0x') && String(s).toLowerCase().length === 66;

// Проверка на число с дефисом

export const validateIntegerWithHyphen = (s) => isInteger(s) || String(s).includes('-') ? String(s).split('-').every((e) => isInteger(e)): false;

// Хук для использования текстового инпута

export const useInput = (value, needCheck = true) => {
    const [color, setColor] = useState('');
    const [help, setHelp] = useState('');
    const [disabled, setDisabled] = useState(false);
    
    const onChange = event => {
        value.current = event.target.value;
        needCheck && fastCheck({
            value,
            setColor,
            setHelp,
            clear,
            danger
        });
    };

    const clear = () => {
        setColor('');
        setHelp('');
    };

    const danger = (message) => {
        setColor('danger');
        setHelp(message);
    };

    return {
        onChange,
        value,
        color,
        help,
        setColor,
        setHelp,
        clear,
        danger,
        disabled,
        setDisabled
    };
};

// Хук для использования чекбоксов / радио-баттонов

export const useRenderInput = (rvalue, needCheck = true, isCheckbox = false) => {
    const [value, setValue] = useState(rvalue.current);
    const [color, setColor] = useState('');
    const [help, setHelp] = useState('');
    
    const onChange = event => {
        setValue(!isCheckbox ? event.target.value : event.target.checked);
        rvalue.current = !isCheckbox ? event.target.value : event.target.checked;
        needCheck && fastCheck({
            rvalue,
            setColor,
            setHelp,
            clear,
            danger
        });
    };

    const clear = () => {
        setColor('');
        setHelp('');
    };

    const danger = (message) => {
        setColor('danger');
        setHelp(message);
    };

    return {
        onChange,
        value,
        rvalue,
        color,
        help,
        setColor,
        setHelp,
        clear,
        danger
    };
};

export const useFormSelect = (type) => {
    const { projectRef, propolsalRef, selectorInputRef, sleepRef, typeVotingRef, parsePropsRef } = useInputContext();
    switch(type) {
        case INPUT_TYPE.PROJECT:
            return {
                label: "Название проекта:",
                placeholder: "например stgdao.eth",
                context: projectRef
            };
        case INPUT_TYPE.PROPOLSAL:
            return {
                label: "ID проползала:",
                placeholder: "например 0x4218ee725798f5450583c29e20fa231c782b9f6880ef9170229235e9eb0442ef",
                context: propolsalRef
            };
        case INPUT_TYPE.SELECTOR:
            return {
                label: "Введите номер варианта:",
                placeholder: "например 1 или 1-4 для случайного варианта",
                context: selectorInputRef
            };
        case INPUT_TYPE.SLEEP:
            return {
                label: "Введите значение задержки:",
                placeholder: "например 0 или 5-10",
                context: sleepRef
            };
        case RADIO_BUTTON_TYPE.VOTE:
            return {
                label: "Тип голосования:  ",
                radio: ['Обычный', 'Approval'],
                context: typeVotingRef
            };
        case CHECKBOX_TYPE.PARSEPROPS:
            return {
                label: "Голосовать во всех активных проползалах проекта:  ",
                context: parsePropsRef
            };
        default:
            throw new Error('Undefined type of input form');
    }
}