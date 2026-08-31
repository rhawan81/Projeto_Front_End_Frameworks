import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { carregarAtividades } from "../data/storage";
import { IconeMais } from "../icons";

function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}`;
}

const CORES_PRIORIDADE = { alta: "#EF4444", media: "#F59E0B", baixa: "#10B981" };

function Home() {
  const [atividades, setAtividades] = useState([]);

  useEffect(() => {
    setAtividades(carregarAtividades());
  }, []);

  const pendentes = atividades.filter((a) => a.status === "pendente");
  const concluidas = atividades.filter((a) => a.status === "concluida");
  const materias = new Set(atividades.map((a) => a.materia));

  const proximas = [...pendentes]
    .sort((a, b) => new Date(a.prazo) - new Date(b.prazo))
    .slice(0, 3);

  const contagemPrioridade = useMemo(() => {
    return {
      alta: atividades.filter((a) => a.prioridade === "alta").length,
      media: atividades.filter((a) => a.prioridade === "media").length,
      baixa: atividades.filter((a) => a.prioridade === "baixa").length,
    };
  }, [atividades]);

  const total = atividades.length || 1;
  let acumulado = 0;
  const fatias = ["alta", "media", "baixa"].map((chave) => {
    const inicio = (acumulado / total) * 360;
    acumulado += contagemPrioridade[chave];
    const fim = (acumulado / total) * 360;
    return `${CORES_PRIORIDADE[chave]} ${inicio}deg ${fim}deg`;
  });

  return (
    <section className="dashboard">
      <div className="dashboard-topo">
        <h1>Dashboard</h1>
        <p className="dashboard-proposito">
          Acompanhe suas atividades acadêmicas, prazos e prioridades em um só lugar.
        </p>
      </div>

      <div className="cartoes-resumo">
        <div className="cartao-resumo">
          <span className="numero">{pendentes.length}</span>
          <span className="rotulo">Pendentes</span>
        </div>
        <div className="cartao-resumo">
          <span className="numero">{concluidas.length}</span>
          <span className="rotulo">Concluídas</span>
        </div>
        <div className="cartao-resumo">
          <span className="numero">{materias.size}</span>
          <span className="rotulo">Matérias</span>
        </div>
        <div className="cartao-resumo">
          <span className="numero">{atividades.length}</span>
          <span className="rotulo">Atividades</span>
        </div>
      </div>

      <div className="dashboard-grade">
        <div className="painel">
          <div className="painel-topo">
            <h2>Próximas atividades</h2>
            <Link to="/atividades">Ver todas</Link>
          </div>

          {proximas.length === 0 ? (
            <p className="mensagem-vazia">Nenhuma atividade pendente.</p>
          ) : (
            <ul className="lista-proximas">
              {proximas.map((a) => (
                <li key={a.id}>
                  <div>
                    <strong>{a.titulo}</strong>
                    <span>{a.materia}</span>
                    <span>{formatarData(a.prazo)}</span>
                  </div>
                  <span className={`selo selo-${a.prioridade}`}>
                    {a.prioridade === "alta"
                      ? "Alta"
                      : a.prioridade === "media"
                      ? "Média"
                      : "Baixa"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="painel">
          <h2>Atividades por prioridade</h2>
          <div className="doughnut-area">
            <div
              className="doughnut"
              style={{ background: `conic-gradient(${fatias.join(",")})` }}
            >
              <div className="doughnut-centro">
                <span className="numero">{atividades.length}</span>
                <span className="rotulo">Total</span>
              </div>
            </div>
            <ul className="legenda-doughnut">
              <li>
                <span className="ponto" style={{ background: CORES_PRIORIDADE.alta }} />
                Alta <b>{contagemPrioridade.alta}</b>
              </li>
              <li>
                <span className="ponto" style={{ background: CORES_PRIORIDADE.media }} />
                Média <b>{contagemPrioridade.media}</b>
              </li>
              <li>
                <span className="ponto" style={{ background: CORES_PRIORIDADE.baixa }} />
                Baixa <b>{contagemPrioridade.baixa}</b>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="chamada-final">
        <div>
          <h3>Mantenha o foco 📚</h3>
          <p>
            {pendentes.length > 0
              ? `Você tem ${pendentes.length} atividade(s) pendente(s). Organize seu tempo e aproveite os estudos.`
              : "Nenhuma pendência no momento. Bom trabalho!"}
          </p>
        </div>
        <Link to="/atividades/nova" className="botao-primario">
          <IconeMais /> Adicionar atividade
        </Link>
      </div>
    </section>
  );
}

export default Home;