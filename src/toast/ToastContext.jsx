import { createContext, use, useContext, useEffect, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);

    function mostrarToast(mensagem, tipo = "sucesso") {
        setToast({mensagem, tipo, id: Date.now() });
    }

    useEffect(() => {
        if (!toast) return;
        const tempo = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(tempo);
    }, [toast]);

    return (
        <ToastContext.Provider value={{ mostrarToast }}>
            {children}
            {toast && (
                <div className={`toast toast-${toast.tipo}`} role="status">
                    {toast.mensagem}
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}