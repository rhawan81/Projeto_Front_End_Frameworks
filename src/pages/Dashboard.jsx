
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buscarAtividades } from "../services/atividadesService";
import { buscarMaterias } from "../services/materiasService";
import EstadoRequisicao from "../components/EstadoRequisicao";
import "./Dashboard.css";

export default function Dashboard() {
  const [atividades, setAtividades] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [origem, setOrigem] = useState("api");
  const [erro, setErro] = useState(null);

  const carregarDados = useCallback(async () => {
    setCarregando(true);

    try {
      const [resultadoAtividades, resultadoMaterias] =
        await Promise.all([
          buscarAtividades(),
          buscarMaterias(),
        ]);

      const listaAtividades = Array.isArray(resultadoAtividades.dados)
        ? resultadoAtividades.dados
        : [];

      const listaMaterias = Array.isArray(resultadoMaterias.dados)
        ? resultadoMateriais(resultadoMaterias.dados)
        : [];

      setAtividades(listaAtividades);
      setMaterias(listaMaterias);

      const resultados = [
        resultadoAtividades,
        resultadoMaterias,
      ];

      const resultadoContingencia = resultados.find(
        (resultado) => resultado.origem === "contingencia"
      );

      setOrigem(resultadoContingencia ? "contingencia" : "api");
      setErro(
        resultadoContingencia?.erro || null
      );
    } catch (error) {
      setErro(error.message);
      setOrigem("api");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const normalizar = (valor) =>
    String(valor || "").toUpperCase();

  const totalAtividades = atividades.length;

  const concluidas = atividades.filter(
    (atividade) => normalizar(atividade.status) === "CONCLUIDA"
  ).length;

  const pendentes = atividades.filter(
    (atividade) => normalizar(atividade.status) === "PENDENTE"
  ).length;

  const atrasadas = atividades.filter((atividade) => {
    if (normalizar(atividade.status) === "CONCLUIDA") {
      return false;
    }

    if (!atividade.prazo) return false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const prazo = new Date(`${atividade.prazo}T00:00:00`);

    return prazo < hoje;
  });

  const proximasAtividades = [...atividades]
    .filter(
      (atividade) =>
        normalizar(atividade.status) !== "CONCLUIDA"
    )
    .sort((a, b) => {
      if (!a.prazo) return 1;
      if (!b.prazo) return -1;

      return new Date(a.prazo) - new Date(b.prazo);
    })
    .slice(0, 5);

  const formatarData = (data) => {
    if (!data) return "Sem prazo";

    const dataFormatada = new Date(`${data}T00:00:00`);

    if (Number.isNaN(dataFormatada.getTime())) {
      return "Sem prazo";
    }

    return dataFormatada.toLocaleDateString("pt-BR");
  };

  const percentualConclusao =
    totalAtividades > 0
      ? Math.round((concluidas / totalAtividades) * 100)
      : 0;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-subtitle">
            VISÃO GERAL
          </span>

          <h1>Dashboard</h1>

          <p>
            Acompanhe suas atividades e seu desempenho acadêmico.
          </p>
        </div>

        <Link to="/atividades" className="dashboard-add-button">
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
        <section className="dashboard-metrics">
          <article className="dashboard-card">
            <span className="dashboard-card-label">
              Total de atividades
            </span>
            <strong>{totalAtividades}</strong>
            <span className="dashboard-card-description">
              Atividades cadastradas
            </span>
          </article>

          <article className="dashboard-card">
            <span className="dashboard-card-label">
              Pendentes
            </span>
            <strong>{pendentes}</strong>
            <span className="dashboard-card-description">
              Aguardando conclusão
            </span>
          </article>

          <article className="dashboard-card">
            <span className="dashboard-card-label">
              Concluídas
            </span>
            <strong>{concluidas}</strong>
            <span className="dashboard-card-description">
              Atividades finalizadas
            </span>
          </article>

          <article className="dashboard-card">
            <span className="dashboard-card-label">
              Em atraso
            </span>
            <strong>{atrasadas.length}</strong>
            <span className="dashboard-card-description">
              Precisam de atenção
            </span>
          </article>
        </section>

        <section className="dashboard-content">
          <article className="dashboard-panel dashboard-progress">
            <div className="dashboard-panel-header">
              <div>
                <h2>Seu progresso</h2>
                <p>Acompanhe sua evolução</p>
              </div>

              <strong>{percentualConclusao}%</strong>
            </div>

            <div className="dashboard-progress-track">
              <div
                className="dashboard-progress-fill"
                style={{ width: `${percentualConclusao}%` }}
              />
            </div>

            <p>
              {concluidas} de {totalAtividades} atividades concluídas.
            </p>
          </article>

          <article className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h2>Matérias</h2>
                <p>Suas matérias cadastradas</p>
              </div>

              <strong>{materias.length}</strong>
            </div>

            {materias.length > 0 ? (
              <ul className="dashboard-subject-list">
                {materias.slice(0, 5).map((materia) => (
                  <li key={materia.id}>
                    <span>{materia.nome || materia.titulo}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhuma matéria cadastrada.</p>
            )}

            <Link to="/materias" className="dashboard-link">
              Ver matérias
            </Link>
          </article>
        </section>

        <section className="dashboard-panel dashboard-activities">
          <div className="dashboard-panel-header">
            <div>
              <h2>Próximas atividades</h2>
              <p>Suas atividades pendentes mais próximas</p>
            </div>

            <Link to="/atividades" className="dashboard-link">
              Ver todas
            </Link>
          </div>

          {proximasAtividades.length > 0 ? (
            <div className="dashboard-activity-list">
              {proximasAtividades.map((atividade) => (
                <div
                  className="dashboard-activity-item"
                  key={atividade.id}
                >
                  <div>
                    <strong>{atividade.titulo}</strong>
                    <span>{atividade.materia || "Sem matéria"}</span>
                  </div>

                  <div className="dashboard-activity-info">
                    <span className="dashboard-deadline">
                      {formatarData(atividade.prazo)}
                    </span>

                    <span
                      className={`dashboard-priority priority-${normalizar(
                        atividade.prioridade
                      ).toLowerCase()}`}
                    >
                      {atividade.prioridade || "Sem prioridade"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="dashboard-empty">
              Nenhuma atividade pendente no momento.
            </p>
          )}
        </section>
      </EstadoRequisicao>
    </main>
  );
}

function resultadoMateriais(dados) {
  return dados;
}