import React from "react";
import { Container, Panel} from "react-bulma-components";
import MainPanel from "./MainPanel";

// Главный компонент

export default function Main() {

    return (
        <>
        <Container>
            <Panel>
                <MainPanel />
            </Panel>
        </Container>
        </>
    );
};