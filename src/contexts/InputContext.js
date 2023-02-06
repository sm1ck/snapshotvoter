import React, { useContext } from "react";

export const InputContext = React.createContext();

export const useInputContext = () => useContext(InputContext);
