import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import { IconeSol, IconeLua, IconeSino, IconeEscudo } from "../icons";

function Topbar() {
  const { tema, alternarTema } = useTheme();
  const { usuario, isAdmin } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-busca">
        <input type="search" placeholder="Buscar em todo o app..." />
      </div>

      <div className="topbar-acoes">
        {isAdmin && (
          <Link to="/admin" className="topbar-tag-adm" title="Painel de Administração">
            <IconeEscudo />
            <span>ADM</span>
          </Link>
        )}

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

        {usuario && (
          <div className="topbar-usuario-badge" title={`Conectado como ${usuario.nome}`}>
            <span className="avatar-mini">{usuario.nome.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;