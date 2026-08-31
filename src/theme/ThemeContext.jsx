import { createContex, createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const CHAVE_TEMA = "organizador-estudos:tema";

export function ThemeProvider({ children }) {
    const [ tema, setTema] = useState(() => {
        const salvo = localStorage.getItem(CHAVE_TEMA);
        if (salvo) return salvo;
        return window.matchMedia("(prefers-color-scheme:dark)").matches 
        ? "escuro" 
        : "claro";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-tema", tema);
        localStorage.setItem(CHAVE_TEMA, tema);
    }, [tema]);

    function alternarTema() {
        setTema((atual) => (atual === "claro" ? "escuro" : "claro"));
    }

    return (
        <ThemeContext.Provider value={{ tema, setTema, alternarTema }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}