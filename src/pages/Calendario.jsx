
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buscarAtividades } from "../services/atividadesService";
import EstadoRequisicao from "../components/EstadoRequisicao.jsx";
import "./Calendario.css";

const nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

const diasSemana = [
  "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom",
];

function chaveData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
  if (!data) return "Sem prazo";

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

export default function Calendario() {
  const hoje = new Date();

  const [mesAtual, setMesAtual] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );

  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [origem, setOrigem] = useState("api");
  const [erro, setErro] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(
    chaveData(hoje)
  );

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await buscarAtividades();

      if (!Array.isArray(resultado.dados)) {
        throw new Error("Formato de atividades inválido.");
      }

      setAtividades(resultado.dados);
      setOrigem(resultado.origem || "api");

      // O fallback já fornece dados utilizáveis.
      setErro(null);
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

      return {
        data,
        chave: chaveData(data),
        pertenceMes: data.getMonth() === mesAtual.getMonth(),
        ehHoje: chaveData(data) === chaveData(hoje),
      };
    });
  }, [mesAtual]);

  const atividadesDoDia = useMemo(() => {
    return atividades.filter(
      (atividade) => atividade.prazo === diaSelecionado
    );
  }, [atividades, diaSelecionado]);

  function mudarMes(direcao) {
    setMesAtual((atual) => {
      return new Date(
        atual.getFullYear(),
        atual.getMonth() + direcao,
        1
      );
    });
  }

  function irParaHoje() {
    setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    setDiaSelecionado(chaveData(hoje));
  }

  function nomeStatus(status) {
    return String(status || "PENDENTE").toUpperCase() === "CONCLUIDA"
      ? "Concluída"
      : "Pendente";
  }

  return (
    <main className="calendario-page">
      <header className="calendario-header">
        <div>
          <span className="calendario-subtitle">ORGANIZAÇÃO</span>
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
              <button onClick={() => mudarMes(-1)} aria-label="Mês anterior">
                ‹
              </button>

              <h2>
                {nomesMeses[mesAtual.getMonth()]} de{" "}
                {mesAtual.getFullYear()}
              </h2>

              <button onClick={() => mudarMes(1)} aria-label="Próximo mês">
                ›
              </button>
            </div>

            <button className="calendario-hoje" onClick={irParaHoje}>
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
              const atividadesDoDia = atividades.filter(
                (atividade) => atividade.prazo === dia.chave
              );

              return (
                <button
                  key={dia.chave}
                  className={[
                    "calendario-dia",
                    !dia.pertenceMes ? "outro-mes" : "",
                    dia.ehHoje ? "dia-hoje" : "",
                    diaSelecionado === dia.chave ? "dia-selecionado" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => setDiaSelecionado(dia.chave)}
                >
                  <span className="calendario-numero">
                    {dia.data.getDate()}
                  </span>

                  <span className="calendario-marcadores">
                    {atividadesDoDia.slice(0, 3).map((atividade) => (
                      <span
                        key={atividade.id}
                        className={
                          String(atividade.status).toUpperCase() === "CONCLUIDA"
                            ? "marcador concluido"
                            : "marcador pendente"
                        }
                      />
                    ))}
                  </span>

                  {atividadesDoDia.length > 0 && (
                    <span className="calendario-contagem">
                      {atividadesDoDia.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="calendario-legenda">
            <span><i className="legenda-pendente" /> Pendente</span>
            <span><i className="legenda-concluida" /> Concluída</span>
          </div>
        </section>

        <section className="calendario-detalhes">
          <div className="calendario-detalhes-header">
            <div>
              <h2>Atividades do dia</h2>
              <p>{formatarData(diaSelecionado)}</p>
            </div>

            <span>{atividadesDoDia.length} atividade(s)</span>
          </div>

          {atividadesDoDia.length > 0 ? (
            <div className="calendario-lista">
              {atividadesDoDia.map((atividade) => (
                <article className="calendario-atividade" key={atividade.id}>
                  <div>
                    <strong>{atividade.titulo}</strong>
                    <span>{atividade.materia || "Sem matéria"}</span>
                    <span>
                      Prioridade: {atividade.prioridade || "Não definida"}
                    </span>
                  </div>

                  <div className="calendario-atividade-acoes">
                    <span className={
                      String(atividade.status).toUpperCase() === "CONCLUIDA"
                        ? "status-concluida"
                        : "status-pendente"
                    }>
                      {nomeStatus(atividade.status)}
                    </span>

                    <Link to={`/atividades/${atividade.id}/editar`}>
                      Ver atividade
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="calendario-vazio">
              Nenhuma atividade com prazo neste dia.
            </p>
          )}
        </section>
      </EstadoRequisicao>
    </main>
  );
}