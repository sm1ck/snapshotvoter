import React, { useContext } from "react";

export const ToastContext = React.createContext();

export const useToast = () => useContext(ToastContext);
