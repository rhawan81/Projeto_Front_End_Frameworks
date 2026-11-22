import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import { carregarAtividades } from "../data/storage";
import {
  estaAtrasada,
  normalizarAtividade,
  ordenarPorPrazo,
  prazoProximo,
  textoPrazo,
} from "../utils/atividades";
import { IconeSol, IconeLua, IconeSino, IconeEscudo } from "../icons";

function Topbar() {
  const { tema, alternarTema } = useTheme();
  const { usuario, isAdmin } = useAuth();
  const navigate = useNavigate();
  useLocation();

  const [termoBusca, setTermoBusca] = useState("");
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const notificacoesRef = useRef(null);

  const alertas = carregarAtividades()
    .map(normalizarAtividade)
    .filter(
      (a) => a.status !== "concluida" && (estaAtrasada(a) || prazoProximo(a))
    )
    .sort(ordenarPorPrazo)
    .slice(0, 6);

  useEffect(() => {
    if (!notificacoesAbertas) return;

    function handleClickFora(e) {
      if (
        notificacoesRef.current &&
        !notificacoesRef.current.contains(e.target)
      ) {
        setNotificacoesAbertas(false);
      }
    }

    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, [notificacoesAbertas]);

  function handleBuscar(e) {
    e.preventDefault();
    const termo = termoBusca.trim();
    if (termo) {
      navigate(`/atividades?busca=${encodeURIComponent(termo)}`);
    } else {
      navigate("/atividades");
    }
  }

  return (
    <header className="topbar">
      <form className="topbar-busca" onSubmit={handleBuscar} role="search">
        <input
          type="search"
          placeholder="Buscar atividades..."
          aria-label="Buscar atividades"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
        />
      </form>

      <div className="topbar-acoes">
        {isAdmin && (
          <Link
            to="/admin"
            className="topbar-tag-adm"
            title="Painel de Administração"
          >
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

        <div className="topbar-notificacoes-wrap" ref={notificacoesRef}>
          <button
            type="button"
            className="botao-icone botao-notificacoes"
            onClick={() => setNotificacoesAbertas((v) => !v)}
            aria-label="Notificações"
            aria-expanded={notificacoesAbertas}
            title="Prazos e avisos"
          >
            <IconeSino />
            {alertas.length > 0 && (
              <span className="notificacoes-badge">{alertas.length}</span>
            )}
          </button>

          {notificacoesAbertas && (
            <div className="popover-notificacoes" role="dialog" aria-label="Notificações de prazos">
              <div className="popover-notificacoes-topo">
                <strong>Prazos e alertas</strong>
                <span>{alertas.length}</span>
              </div>

              {alertas.length === 0 ? (
                <p className="popover-notificacoes-vazio">
                  Nenhuma atividade atrasada ou vencendo nos próximos 3 dias.
                </p>
              ) : (
                <ul className="popover-notificacoes-lista">
                  {alertas.map((atividade) => (
                    <li key={atividade.id}>
                      <Link
                        to={`/atividades/${atividade.id}/editar`}
                        onClick={() => setNotificacoesAbertas(false)}
                      >
                        <strong>{atividade.titulo}</strong>
                        <span>
                          {atividade.materia || "Sem matéria"} ·{" "}
                          <em
                            className={
                              estaAtrasada(atividade)
                                ? "alerta-atrasada"
                                : "alerta-proxima"
                            }
                          >
                            {textoPrazo(atividade)}
                          </em>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="popover-notificacoes-rodape">
                <Link
                  to="/prioridades"
                  onClick={() => setNotificacoesAbertas(false)}
                >
                  Ver prioridades →
                </Link>
              </div>
            </div>
          )}
        </div>

        {usuario && (
          <Link
            to="/configuracoes"
            className="topbar-usuario-badge"
            title={`Conectado como ${usuario.nome}`}
          >
            <span className="avatar-mini">
              {usuario.nome.charAt(0).toUpperCase()}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Topbar;
