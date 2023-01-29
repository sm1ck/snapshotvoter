import {useRef, useState} from "react";

// Валидация инпутов

export const fastCheck = (hook, customCheck = true, customResponse = '') => {
    if (!hook.value.current) {
        hook.setColor('danger');
        hook.setHelp('Поле не должно быть пустым');
        return false;
    } else if (!customCheck) {
        hook.setColor('danger');
        hook.setHelp(customResponse);
        return false;
    } else {
        hook.setColor('');
        hook.setHelp('');
        return true;
    }
};

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
            setHelp
        });
    };

    return {
        bind: {onChange},
        value,
        color,
        help,
        setColor,
        setHelp
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
            setHelp
        });
    };

    return {
        bind: {onChange},
        value,
        rvalue,
        color,
        help,
        setColor,
        setHelp
    };
};