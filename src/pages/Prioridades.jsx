import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buscarAtividades } from "../services/atividadesService";
import EstadoRequisicao from "../components/EstadoRequisicao.jsx";
import {
  chaveDoPrazo,
  diasAteOPrazo,
  estaAtrasada,
  formatarDataBR,
  normalizarAtividade,
  ordenarPorPrazo,
  prazoProximo,
  rotulosPrioridade,
  rotulosStatus,
  textoPrazo,
} from "../utils/atividades";
import "./Prioridades.css";

const NIVEIS = ["alta", "media", "baixa"];

const FILTROS = [
  { chave: "todas", rotulo: "Todas" },
  { chave: "pendente", rotulo: "Pendentes" },
  { chave: "concluida", rotulo: "Concluídas" },
];

const MAX_URGENTES = 5;

function nivelDe(atividade) {
  return NIVEIS.includes(atividade.prioridade) ? atividade.prioridade : "baixa";
}

function CartaoAtividade({ atividade, aberta, onAlternar }) {
  const concluida = atividade.status === "concluida";
  const atrasada = estaAtrasada(atividade);
  const proxima = prazoProximo(atividade);
  const semPrazo = diasAteOPrazo(atividade) === null;

  return (
    <article
      className={[
        "prioridades-cartao",
        concluida ? "concluida" : "",
        atrasada ? "atrasada" : "",
        proxima ? "proxima" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="prioridades-cartao-topo">
        <strong>{atividade.titulo}</strong>

        <span className={concluida ? "status-concluida" : "status-pendente"}>
          {rotulosStatus[atividade.status] || "Pendente"}
        </span>
      </div>

      <span className="prioridades-materia">
        {atividade.materia || "Sem matéria"}
      </span>

      <span
        className={[
          "prioridades-prazo",
          atrasada ? "atrasada" : "",
          proxima ? "proxima" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {semPrazo
          ? "Sem prazo"
          : `${formatarDataBR(chaveDoPrazo(atividade.prazo))}${
              concluida ? "" : ` · ${textoPrazo(atividade)}`
            }`}
      </span>

      <div className="prioridades-acoes">
        <button
          type="button"
          className="prioridades-btn"
          onClick={onAlternar}
          aria-expanded={aberta}
        >
          {aberta ? "Ocultar" : "Detalhes"}
        </button>

        <Link to={`/atividades/${atividade.id}/editar`}>Editar</Link>
      </div>

      {aberta && (
        <dl className="prioridades-detalhes">
          <dt>Prazo</dt>
          <dd>{formatarDataBR(chaveDoPrazo(atividade.prazo))}</dd>

          <dt>Descrição</dt>
          <dd>{atividade.descricao || "Sem descrição."}</dd>
        </dl>
      )}
    </article>
  );
}

export default function Prioridades() {
  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [origem, setOrigem] = useState("api");
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const [abertaId, setAbertaId] = useState(null);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await buscarAtividades();

      if (!Array.isArray(resultado.dados)) {
        throw new Error("Formato de atividades inválido.");
      }

      setAtividades(resultado.dados.map(normalizarAtividade));
      setOrigem(resultado.origem === "contingencia" ? "contingencia" : "api");
    } catch (error) {
      console.error("Erro ao carregar prioridades:", error);
      setErro(error.message);
      setOrigem("api");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const urgentes = useMemo(
    () =>
      atividades
        .filter(
          (a) =>
            a.status !== "concluida" && (estaAtrasada(a) || prazoProximo(a))
        )
        .sort(ordenarPorPrazo)
        .slice(0, MAX_URGENTES),
    [atividades]
  );

  const colunas = useMemo(() => {
    return NIVEIS.map((nivel) => {
      const doNivel = atividades.filter((a) => nivelDe(a) === nivel);

      const visiveis = doNivel
        .filter((a) => (filtro === "todas" ? true : a.status === filtro))
        .sort(ordenarPorPrazo);

      return {
        nivel,
        total: doNivel.length,
        pendentes: doNivel.filter((a) => a.status !== "concluida").length,
        visiveis,
      };
    });
  }, [atividades, filtro]);

  function alternar(id) {
    setAbertaId((atual) => (atual === id ? null : id));
  }

  return (
    <main className="prioridades-page">
      <header className="prioridades-header">
        <div>
          <span className="prioridades-subtitle">ORGANIZAÇÃO</span>
          <h1>Prioridades</h1>
          <p>Veja o que é mais importante e o que vence primeiro.</p>
        </div>

        <Link to="/atividades/nova" className="prioridades-botao">
          + Nova atividade
        </Link>
      </header>

      <EstadoRequisicao
        carregando={carregando}
        erro={erro}
        origem={origem}
        vazio={false}
        onTentarNovamente={carregarDados}
      >
        <section className="prioridades-urgentes">
          <div className="prioridades-urgentes-topo">
            <h2>Mais urgentes</h2>
            <span>Atrasadas e com prazo em até 3 dias</span>
          </div>

          {urgentes.length > 0 ? (
            <ul className="prioridades-urgentes-lista">
              {urgentes.map((atividade) => (
                <li
                  key={atividade.id}
                  className={`prio-${nivelDe(atividade)}`}
                >
                  <div>
                    <strong>{atividade.titulo}</strong>
                    <span>{atividade.materia || "Sem matéria"}</span>
                  </div>

                  <div className="prioridades-urgentes-info">
                    <b className={`selo-prio prio-${nivelDe(atividade)}`}>
                      {rotulosPrioridade[nivelDe(atividade)]}
                    </b>

                    <span
                      className={
                        estaAtrasada(atividade)
                          ? "prioridades-prazo atrasada"
                          : "prioridades-prazo proxima"
                      }
                    >
                      {textoPrazo(atividade)}
                    </span>

                    <Link to={`/atividades/${atividade.id}/editar`}>
                      Editar
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="prioridades-vazio">
              Nenhuma atividade urgente no momento.
            </p>
          )}
        </section>

        <div className="prioridades-filtros" role="group" aria-label="Situação">
          {FILTROS.map(({ chave, rotulo }) => (
            <button
              key={chave}
              type="button"
              className={filtro === chave ? "ativo" : ""}
              onClick={() => setFiltro(chave)}
              aria-pressed={filtro === chave}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <section className="prioridades-colunas">
          {colunas.map(({ nivel, total, pendentes, visiveis }) => (
            <div className={`prioridades-coluna prio-${nivel}`} key={nivel}>
              <header className="prioridades-coluna-topo">
                <h2>{rotulosPrioridade[nivel]}</h2>

                <div>
                  <strong>{total}</strong>
                  <span>
                    {total === 1 ? "atividade" : "atividades"} · {pendentes}{" "}
                    {pendentes === 1 ? "pendente" : "pendentes"}
                  </span>
                </div>
              </header>

              {visiveis.length > 0 ? (
                <div className="prioridades-lista">
                  {visiveis.map((atividade) => (
                    <CartaoAtividade
                      key={atividade.id}
                      atividade={atividade}
                      aberta={abertaId === atividade.id}
                      onAlternar={() => alternar(atividade.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="prioridades-vazio">
                  Nenhuma atividade nesta categoria.
                </p>
              )}
            </div>
          ))}
        </section>
      </EstadoRequisicao>
    </main>
  );
}