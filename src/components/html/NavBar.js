import React from "react";
import { Panel, Navbar } from "react-bulma-components";
import { useToast } from "../../contexts/ToastContext";
import { navbarStyle } from "../styles/styles";

export default function NavBar() {
    const { setPage } = useToast();
    const onTogglePage = (num) => setPage(num);
    return (
        <Panel.Header>
            <Navbar style={navbarStyle}>
                <Navbar.Item onClick={() => onTogglePage(0)}>Голосование</Navbar.Item> <Navbar.Item onClick={() => onTogglePage(1)}>Логи</Navbar.Item>
            </Navbar>
        </Panel.Header>
    )
};