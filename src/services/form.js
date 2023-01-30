import {useRef, useState} from "react";

// Валидация инпутов

export const fastCheck = (hook, customCheck = true, customResponse = '') => {
    if (!hook.value.current) {
        hook.danger('Поле не должно быть пустым');
        return false;
    } else if (!customCheck) {
        hook.danger(customResponse);
        return false;
    } else {
        hook.clear();
        return true;
    }
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

export const useInput = (initialVal, needCheck = true) => {
    const value = useRef(initialVal);
    const [color, setColor] = useState('');
    const [help, setHelp] = useState('');
    
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
        bind: {onChange},
        value,
        color,
        help,
        setColor,
        setHelp,
        clear,
        danger
    };
};

// Хук для использования чекбоксов / радио-баттонов

export const useRenderInput = (initialVal, needCheck = true, isCheckbox = false) => {
    const [value, setValue] = useState(initialVal);
    const rvalue = useRef(initialVal);
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
        bind: {onChange},
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