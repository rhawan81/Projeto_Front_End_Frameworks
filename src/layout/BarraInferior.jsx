import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../toast/ToastContext";
import {
  IconeGrade,
  IconeLista,
  IconeEngrenagem,
  IconeEscudo,
  IconeRelogio,
  IconeSair,
} from "../icons";

// Navegação usada em telas pequenas (celular), no lugar da sidebar
function BarraInferior() {
  const { isAdmin, logout } = useAuth();
  const { mostrarToast } = useToast();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  function handleLogout() {
    setMenuAberto(false);
    logout();
    mostrarToast("Você saiu da sua conta.", "aviso");
    navigate("/login");
  }

  return (
    <>
      {menuAberto && (
        <div
          className="menu-mobile-backdrop"
          onClick={() => setMenuAberto(false)}
        >
          <div
            className="menu-mobile-painel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="menu-mobile-topo">
              <strong>Menu rápido</strong>
              <button
                type="button"
                className="menu-mobile-fechar"
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>

            <div className="menu-mobile-links">
              <Link to="/materias" onClick={() => setMenuAberto(false)}>
                Matérias
              </Link>
              <Link to="/pomodoro" onClick={() => setMenuAberto(false)}>
                Pomodoro
              </Link>
              <Link to="/calendario" onClick={() => setMenuAberto(false)}>
                Calendário
              </Link>
              <Link to="/prioridades" onClick={() => setMenuAberto(false)}>
                Prioridades
              </Link>
              <Link to="/estatisticas" onClick={() => setMenuAberto(false)}>
                Estatísticas
              </Link>
              <Link to="/configuracoes" onClick={() => setMenuAberto(false)}>
                Configurações
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuAberto(false)}>
                  Painel ADM
                </Link>
              )}
              <button
                type="button"
                className="menu-mobile-sair"
                onClick={handleLogout}
              >
                <IconeSair /> Sair da conta
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="barra-inferior" aria-label="Navegação principal mobile">
        <NavLink
          to="/"
          end
          className="item-inferior"
          onClick={() => setMenuAberto(false)}
        >
          <IconeGrade />
          Início
        </NavLink>

        <NavLink
          to="/atividades"
          className="item-inferior"
          onClick={() => setMenuAberto(false)}
        >
          <IconeLista />
          Atividades
        </NavLink>

        <NavLink
          to="/pomodoro"
          className="item-inferior"
          onClick={() => setMenuAberto(false)}
        >
          <IconeRelogio />
          Pomodoro
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin"
            className="item-inferior"
            onClick={() => setMenuAberto(false)}
          >
            <IconeEscudo />
            ADM
          </NavLink>
        )}

        <button
          type="button"
          className={`item-inferior item-inferior-botao ${
            menuAberto ? "active" : ""
          }`}
          onClick={() => setMenuAberto((v) => !v)}
          aria-expanded={menuAberto}
        >
          <IconeEngrenagem />
          Mais
        </button>
      </nav>
    </>
  );
}

export default BarraInferior;
