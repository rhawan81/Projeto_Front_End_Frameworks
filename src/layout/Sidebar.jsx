import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../toast/ToastContext";
import {
  IconeGrade,
  IconeLista,
  IconeEngrenagem,
  IconeEscudo,
  IconeSair,
} from "../icons";

const itensPrincipais = [
  { to: "/", label: "Dashboard", icone: IconeGrade, fim: true },
  { to: "/atividades", label: "Atividades", icone: IconeLista },
];

const itensExtras = [
  { to: "/materias", label: "Matérias" },
  { to: "/calendario", label: "Calendário" },
  { to: "/prioridades", label: "Prioridades" },
  { to: "/estatisticas", label: "Estatísticas" },
];

function Sidebar() {
  const { usuario, isAdmin, logout } = useAuth();
  const { mostrarToast } = useToast();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    mostrarToast("Você saiu da sua conta.", "aviso");
    navigate("/login");
  }

  const inicialNome = usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : "U";

  return (
    <aside className="barra-lateral">
      <div className="marca-sidebar">
        <span className="marca-icone">📘</span>
        <div>
          <strong>Organizador</strong>
          <span>de Estudos</span>
        </div>
      </div>

      <nav>
        {itensPrincipais.map(({ to, label, icone: Icone, fim }) => (
          <NavLink key={to} to={to} end={fim} className="item-nav">
            <Icone />
            {label}
          </NavLink>
        ))}

        {/* Link exclusivo para administradores */}
        {isAdmin && (
          <NavLink to="/admin" className="item-nav item-nav-adm">
            <IconeEscudo />
            <span>Painel ADM</span>
            <span className="badge-nav-adm">ADM</span>
          </NavLink>
        )}

        <div className="separador-nav">Em Breve</div>

        {itensExtras.map(({ to, label }) => (
          <NavLink key={to} to={to} className="item-nav item-nav-extra">
            <span className="ponto-extra" />
            {label}
          </NavLink>
        ))}

        <NavLink to="/configuracoes" className="item-nav">
          <IconeEngrenagem />
          Configurações
        </NavLink>
      </nav>

      {/* Rodapé dinâmico do usuário logado */}
      <div className="rodape-sidebar">
        <div className="usuario-info-bloco">
          <span className="avatar">{inicialNome}</span>
          <div className="usuario-texto">
            <strong title={usuario?.nome}>{usuario?.nome || "Estudante"}</strong>
            <span className="usuario-papel-texto">
              {isAdmin ? "Administrador" : "Estudante"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="botao-sair-sidebar"
          onClick={handleLogout}
          title="Encerrar sessão"
          aria-label="Sair da conta"
        >
          <IconeSair />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;