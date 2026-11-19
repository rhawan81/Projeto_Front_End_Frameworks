
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { IconeMais } from "../icons";
import { buscarAtividades } from "../services/atividadesService";
import { buscarMaterias } from "../services/materiasService";
import EstadoRequisicao from "../components/EstadoRequisicao.jsx";

function formatarData(dataStr) {
  if (!dataStr) return "--/--";

  const partes = dataStr.split("-");
  if (partes.length < 3) return dataStr;

  return `${partes[2]}/${partes[1]}`;
}

const CORES_PRIORIDADE = {
  alta: "#EF4444",
  media: "#F59E0B",
  baixa: "#10B981",
};

function Home() {
  const { usuario } = useAuth();

  const [atividades, setAtividades] = useState([]);
  const [materiasCadastradas, setMateriasCadastradas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [origem, setOrigem] = useState("api");

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const [resultadoAtividades, resultadoMaterias] =
        await Promise.all([
          buscarAtividades(),
          buscarMaterias(),
        ]);

      if (
        !Array.isArray(resultadoAtividades.dados) ||
        !Array.isArray(resultadoMaterias.dados)
      ) {
        throw new Error("Os dados recebidos estão em um formato inválido.");
      }

      const atividadesFormatadas = resultadoAtividades.dados.map(
        (atividade) => ({
          ...atividade,
          status: String(atividade.status || "pendente").toLowerCase(),
          prioridade: String(
            atividade.prioridade || "baixa"
          ).toLowerCase(),
        })
      );

      setAtividades(atividadesFormatadas);
      setMateriasCadastradas(resultadoMaterias.dados);

      const usouContingencia =
        resultadoAtividades.origem === "contingencia" ||
        resultadoMaterias.origem === "contingencia";

      setOrigem(usouContingencia ? "contingencia" : "api");
      setErro(null);
    } catch (erroCarregamento) {
      console.error("Erro ao carregar página inicial:", erroCarregamento);

      setErro(erroCarregamento.message);
      setOrigem("api");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const pendentes = atividades.filter(
    (atividade) => atividade.status === "pendente"
  );

  const concluidas = atividades.filter(
    (atividade) => atividade.status === "concluida"
  );

  const totalMaterias = useMemo(() => {
    const conjuntoMaterias = new Set();

    materiasCadastradas.forEach((materia) => {
      if (materia.nome) {
        conjuntoMaterias.add(materia.nome.toLowerCase());
      }
    });

    atividades.forEach((atividade) => {
      if (atividade.materia) {
        conjuntoMaterias.add(atividade.materia.toLowerCase());
      }
    });

    return conjuntoMaterias.size;
  }, [materiasCadastradas, atividades]);

  const proximas = [...pendentes]
    .sort((a, b) => {
      return new Date(a.prazo) - new Date(b.prazo);
    })
    .slice(0, 3);

  const contagemPrioridade = useMemo(() => {
    return {
      alta: atividades.filter(
        (atividade) => atividade.prioridade === "alta"
      ).length,

      media: atividades.filter(
        (atividade) => atividade.prioridade === "media"
      ).length,

      baixa: atividades.filter(
        (atividade) => atividade.prioridade === "baixa"
      ).length,
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

  const primeiroNome = usuario?.nome
    ? usuario.nome.split(" ")[0]
    : "Estudante";

  return (
    <EstadoRequisicao
      carregando={carregando}
      erro={erro}
      origem={origem}
      vazio={false}
      onTentarNovamente={carregarDados}
    >
      <section className="dashboard">
        <div className="dashboard-cabecalho">
          <h1>Olá, {primeiroNome}! </h1>

          <p className="dashboard-proposito">
            Acompanhe suas atividades acadêmicas, prazos e prioridades
            em um só lugar.
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
            <span className="numero">{totalMaterias}</span>
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
              <p className="mensagem-vazia">
                Nenhuma atividade pendente.
              </p>
            ) : (
              <ul className="lista-proximas">
                {proximas.map((atividade) => (
                  <li key={atividade.id}>
                    <div>
                      <strong>{atividade.titulo}</strong>
                      <span>{atividade.materia}</span>
                      <span>{formatarData(atividade.prazo)}</span>
                    </div>

                    <span
                      className={`selo selo-${atividade.prioridade}`}
                    >
                      {atividade.prioridade === "alta"
                        ? "Alta"
                        : atividade.prioridade === "media"
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
                style={{
                  background: `conic-gradient(${fatias.join(",")})`,
                }}
              >
                <div className="doughnut-centro">
                  <span className="numero">{atividades.length}</span>
                  <span className="rotulo">Total</span>
                </div>
              </div>

              <ul className="legenda-doughnut">
                <li>
                  <span
                    className="ponto"
                    style={{ background: CORES_PRIORIDADE.alta }}
                  />
                  Alta <b>{contagemPrioridade.alta}</b>
                </li>

                <li>
                  <span
                    className="ponto"
                    style={{ background: CORES_PRIORIDADE.media }}
                  />
                  Média <b>{contagemPrioridade.media}</b>
                </li>

                <li>
                  <span
                    className="ponto"
                    style={{ background: CORES_PRIORIDADE.baixa }}
                  />
                  Baixa <b>{contagemPrioridade.baixa}</b>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="chamada-final">
          <div>
            <h3>Mantenha o foco</h3>

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
    </EstadoRequisicao>
  );
}

export default Home;