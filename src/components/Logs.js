import React from "react";
import { Box} from "react-bulma-components";
import { useToast } from "../contexts/ToastContext";
import { logStyle } from "./styles/styles";
// Компонент вывода логов

export default function Logs() {
    const {page, messageHistory} = useToast();
    
    return (
        <Box style={page === 1 ? {...logStyle, display: 'block'} : {...logStyle, display: 'none'}}>
            {messageHistory}
        </Box>
    );
}