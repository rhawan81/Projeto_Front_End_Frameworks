import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buscarAtividades } from "../services/atividadesService";
import EstadoRequisicao from "../components/EstadoRequisicao.jsx";
import {
  chaveData,
  chaveDoPrazo,
  estaAtrasada,
  formatarDataBR,
  normalizarAtividade,
  ordenarPorUrgencia,
  rotulosPrioridade,
  rotulosStatus,
} from "../utils/atividades";
import "./Calendario.css";

const nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const MAX_MARCADORES = 3;

export default function Calendario() {
  const hoje = useMemo(() => new Date(), []);
  const chaveHoje = chaveData(hoje);

  const [mesAtual, setMesAtual] = useState(
    () => new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );

  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [origem, setOrigem] = useState("api");
  const [erro, setErro] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(chaveHoje);
  const [atividadeAbertaId, setAtividadeAbertaId] = useState(null);

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
      console.error("Erro ao carregar calendário:", error);
      setErro(error.message);
      setOrigem("api");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const porDia = useMemo(() => {
    const mapa = {};

    atividades.forEach((atividade) => {
      const chave = chaveDoPrazo(atividade.prazo);
      if (!chave) return;
      if (!mapa[chave]) mapa[chave] = [];
      mapa[chave].push(atividade);
    });

    Object.values(mapa).forEach((lista) => lista.sort(ordenarPorUrgencia));

    return mapa;
  }, [atividades]);

  const diasCalendario = useMemo(() => {
    const primeiroDia = new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth(),
      1
    );

    const inicio = new Date(primeiroDia);
    const deslocamento = (primeiroDia.getDay() + 6) % 7;
    inicio.setDate(primeiroDia.getDate() - deslocamento);

    return Array.from({ length: 42 }, (_, indice) => {
      const data = new Date(inicio);
      data.setDate(inicio.getDate() + indice);
      const chave = chaveData(data);

      return {
        data,
        chave,
        pertenceMes: data.getMonth() === mesAtual.getMonth(),
        ehHoje: chave === chaveHoje,
      };
    });
  }, [mesAtual, chaveHoje]);

  const atividadesDoDia = porDia[diaSelecionado] || [];

  function mudarMes(direcao) {
    setMesAtual(
      (atual) => new Date(atual.getFullYear(), atual.getMonth() + direcao, 1)
    );
  }

  function irParaHoje() {
    setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    setDiaSelecionado(chaveHoje);
    setAtividadeAbertaId(null);
  }

  function selecionarDia(chave) {
    setDiaSelecionado(chave);
    setAtividadeAbertaId(null);
  }

  return (
    <section className="calendario-page">
      <header className="calendario-header">
        <div>
          <h1>Calendário</h1>
          <p>Visualize seus prazos e organize suas atividades.</p>
        </div>

        <Link to="/atividades/nova" className="calendario-botao">
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
        <section className="calendario-painel">
          <div className="calendario-controles">
            <div className="calendario-navegacao">
              <button
                type="button"
                onClick={() => mudarMes(-1)}
                aria-label="Mês anterior"
              >
                ‹
              </button>

              <h2>
                {nomesMeses[mesAtual.getMonth()]} de {mesAtual.getFullYear()}
              </h2>

              <button
                type="button"
                onClick={() => mudarMes(1)}
                aria-label="Próximo mês"
              >
                ›
              </button>
            </div>

            <button
              type="button"
              className="calendario-hoje"
              onClick={irParaHoje}
            >
              Hoje
            </button>
          </div>

          <div className="calendario-grade">
            {diasSemana.map((dia) => (
              <div className="calendario-dia-semana" key={dia}>
                {dia}
              </div>
            ))}

            {diasCalendario.map((dia) => {
              const lista = porDia[dia.chave] || [];

              return (
                <button
                  type="button"
                  key={dia.chave}
                  className={[
                    "calendario-dia",
                    !dia.pertenceMes ? "outro-mes" : "",
                    dia.ehHoje ? "dia-hoje" : "",
                    diaSelecionado === dia.chave ? "dia-selecionado" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => selecionarDia(dia.chave)}
                  aria-label={`${formatarDataBR(dia.chave)}${
                    lista.length ? `, ${lista.length} atividade(s)` : ""
                  }`}
                >
                  <span className="calendario-numero">
                    {dia.data.getDate()}
                  </span>

                  <span className="calendario-marcadores">
                    {lista.slice(0, MAX_MARCADORES).map((atividade) => (
                      <span
                        key={atividade.id}
                        className={[
                          "marcador",
                          `prio-${atividade.prioridade}`,
                          atividade.status === "concluida"
                            ? "concluido"
                            : "pendente",
                          estaAtrasada(atividade) ? "atrasada" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                    ))}
                  </span>

                  {lista.length > 0 && (
                    <span className="calendario-contagem">{lista.length}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="calendario-legenda">
            <span><i className="legenda-prio-alta" /> Alta</span>
            <span><i className="legenda-prio-media" /> Média</span>
            <span><i className="legenda-prio-baixa" /> Baixa</span>
            <span><i className="legenda-feita" /> Concluída</span>
            <span><i className="legenda-atrasada" /> Atrasada</span>
          </div>
        </section>

        <section className="calendario-detalhes">
          <div className="calendario-detalhes-header">
            <div>
              <h2>Atividades do dia</h2>
              <p>{formatarDataBR(diaSelecionado)}</p>
            </div>

            <span>{atividadesDoDia.length} atividade(s)</span>
          </div>

          {atividadesDoDia.length > 0 ? (
            <div className="calendario-lista">
              {atividadesDoDia.map((atividade) => {
                const aberta = atividadeAbertaId === atividade.id;

                return (
                  <article
                    className={[
                      "calendario-atividade",
                      `prio-${atividade.prioridade}`,
                      atividade.status === "concluida" ? "concluida" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={atividade.id}
                  >
                    <div>
                      <strong>{atividade.titulo}</strong>
                      <span>{atividade.materia || "Sem matéria"}</span>
                      <span>
                        Prioridade:{" "}
                        <b className={`selo-prio prio-${atividade.prioridade}`}>
                          {rotulosPrioridade[atividade.prioridade] ||
                            "Não definida"}
                        </b>
                        {estaAtrasada(atividade) && (
                          <b className="selo-prio atrasada"> Atrasada</b>
                        )}
                      </span>
                    </div>

                    <div className="calendario-atividade-acoes">
                      <span
                        className={
                          atividade.status === "concluida"
                            ? "status-concluida"
                            : "status-pendente"
                        }
                      >
                        {rotulosStatus[atividade.status] || "Pendente"}
                      </span>

                      <button
                        type="button"
                        className="calendario-btn-detalhes"
                        onClick={() =>
                          setAtividadeAbertaId(aberta ? null : atividade.id)
                        }
                        aria-expanded={aberta}
                      >
                        {aberta ? "Ocultar" : "Detalhes"}
                      </button>

                      <Link to={`/atividades/${atividade.id}/editar`}>
                        Editar
                      </Link>
                    </div>

                    {aberta && (
                      <dl className="calendario-atividade-detalhes">
                        <dt>Prazo</dt>
                        <dd>{formatarDataBR(chaveDoPrazo(atividade.prazo))}</dd>

                        <dt>Descrição</dt>
                        <dd>{atividade.descricao || "Sem descrição."}</dd>
                      </dl>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="calendario-vazio">
              Nenhuma atividade com prazo neste dia.
            </p>
          )}
        </section>
      </EstadoRequisicao>
    </section>
  );
}