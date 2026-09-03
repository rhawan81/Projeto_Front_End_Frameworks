import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import { IconeEscudo, IconeUsuario } from "../icons";

function Configuracoes() {
  const { tema, setTema } = useTheme();
  const { usuario, isAdmin } = useAuth();

  return (
    <section className="configuracoes">
      <h1>Configurações</h1>

      {/* Cartão de Informações do Perfil */}
      {usuario && (
        <div className="painel" style={{ marginBottom: "1.5rem" }}>
          <h2>Perfil do Usuário</h2>
          <p className="texto-suave">Dados da sua conta conectada atualmente.</p>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
            <span className="avatar-adm" style={{ width: "48px", height: "48px", fontSize: "1.2rem" }}>
              {usuario.nome.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong style={{ fontSize: "1.05rem", display: "block" }}>{usuario.nome}</strong>
              <span style={{ fontSize: "0.86rem", color: "var(--texto-suave)" }}>{usuario.email}</span>
              <div style={{ marginTop: "0.3rem" }}>
                <span
                  className={`badge-papel ${
                    isAdmin ? "badge-admin" : "badge-estudante"
                  }`}
                >
                  {isAdmin ? <><IconeEscudo /> Administrador</> : <><IconeUsuario /> Estudante</>}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuração de Aparência / Tema */}
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