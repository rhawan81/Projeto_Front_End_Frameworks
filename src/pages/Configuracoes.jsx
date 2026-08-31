import { useTheme } from "../theme/ThemeContext";

function Configuracoes() {
    const { tema, setTema } = useTheme();

    return (
        <section className="configuracoes">
            <h1>Configurações</h1>

            <div className="painel">
                <h2>Aparência</h2>
                <p className="texto-suave">Escolha como o Organizador de Estudos aparece para você.</p>

                <div className="opcoes-tema">
                    <label className={`opcao-tema ${tema === "claro" ? "selecionada" : ""}`}>
                        <input
                        type="radio"
                        name="tema"
                        value="claro"
                        checked={tema === "claro"}
                        onChange={() => setTema("claro")}
                        />
                        <span className="prevista prevista-claro" />
                        Modo Claro
                    </label>

                    <label className={`opcao-tema ${tema === "escuro" ? "selecionada" : ""}`}>
                        <input
                            type="radio"
                            name="tema"
                            value="escuro"
                            checked={tema === "escuro"}
                            onChange={() => setTema("escuro")}
                        />
                        <span className="prevista prevista-escuro" />
                        Modo Escuro
                    </label>
                </div>
            </div>
        </section>
    );
}

export default Configuracoes;