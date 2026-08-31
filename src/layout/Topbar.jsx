import { useTheme } from "../theme/ThemeContext";
import { IconeSol, IconeLua, IconeSino } from "../icons";

function Topbar() {
    const { tema, alternarTema } = useTheme();

    return (
        <header className="topbar">
            <div className="topbar-busca">
                <input type="search" placeholder="Buscar em todo o app..." />
            </div>

            <div className="topbar-acoes">
                <button
                type="button"
                className="botao-icone"
                onClick={alternarTema}
                aria-label="Alternar tema claro/escuro"
                title={tema === "claro" ? "Ativar modo escuro" : "Ativar modo claro"}
                >
                    {tema === "claro" ? <IconeLua /> : <IconeSol />}
                </button>
                <button type="button" className="botao-icone" aria-label="Notificações">
                    <IconeSino />
                </button>
            </div>
        </header>
    );
} 

export default Topbar;