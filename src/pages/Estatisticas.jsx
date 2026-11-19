import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buscarAtividades } from "../services/atividadesService";
import { buscarMaterias } from "../services/materiasService";
import EstadoRequisicao from "../components/EstadoRequisicao.jsx";
import {
  normalizarAtividade,
  rotulosPrioridade,
  rotulosStatus,
} from "../utils/atividades";
import "./Estatisticas.css";

const PALETA = ["#8b5cf6", "#4d5fff", "#10b981", "#f59e0b", "#06b6d4", "#ec4899"];

const COR_PRIORIDADE = { alta: "#ef4444", media: "#f59e0b", baixa: "#10b981" };
const COR_STATUS = { pendente: "#ffbd59", concluida: "#36c995" };

const RAIO = 42;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function porcentagem(valor, total) {
  return total > 0 ? Math.round((valor / total) * 100) : 0;
}

function Rosca({ titulo, fatias, total }) {
  let acumulado = 0;

  const segmentos = fatias
    .filter((fatia) => fatia.valor > 0)
    .map((fatia) => {
      const comprimento = (fatia.valor / total) * CIRCUNFERENCIA;
      const segmento = { ...fatia, comprimento, deslocamento: -acumulado };
      acumulado += comprimento;
      return segmento;
    });

  return (
    <div className="est-rosca">
      <svg viewBox="0 0 120 120" role="img" aria-label={titulo}>
        <circle cx="60" cy="60" r={RAIO} className="est-rosca-fundo" />

        {total > 0 &&
          segmentos.map((segmento) => (
            <circle
              key={segmento.chave}
              cx="60"
              cy="60"
              r={RAIO}
              className="est-rosca-fatia"
              stroke={segmento.cor}
              strokeDasharray={`${segmento.comprimento} ${
                CIRCUNFERENCIA - segmento.comprimento
              }`}
              strokeDashoffset={segmento.deslocamento}
              transform="rotate(-90 60 60)"
            />
          ))}

        <text x="60" y="60" textAnchor="middle" className="est-rosca-total">
          {total}
        </text>
        <text x="60" y="76" textAnchor="middle" className="est-rosca-rotulo">
          {total === 1 ? "atividade" : "atividades"}
        </text>
      </svg>

      <ul className="est-legenda">
        {fatias.map((fatia) => (
          <li key={fatia.chave}>
            <i style={{ backgroundColor: fatia.cor }} />
            <span className="est-legenda-nome">{fatia.rotulo}</span>
            <strong>{fatia.valor}</strong>
            <span className="est-legenda-pct">
              {porcentagem(fatia.valor, total)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Estatisticas() {
  const [atividades, setAtividades] = useState([]);
  const [materiasCadastradas, setMateriasCadastradas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [origem, setOrigem] = useState("api");
  const [erro, setErro] = useState(null);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const [resultadoAtividades, resultadoMaterias] = await Promise.all([
        buscarAtividades(),
        buscarMaterias(),
      ]);

      if (
        !Array.isArray(resultadoAtividades.dados) ||
        !Array.isArray(resultadoMaterias.dados)
      ) {
        throw new Error("A API retornou dados em um formato inesperado.");
      }

      setAtividades(resultadoAtividades.dados.map(normalizarAtividade));
      setMateriasCadastradas(resultadoMaterias.dados);

      const usouContingencia =
        resultadoAtividades.origem === "contingencia" ||
        resultadoMaterias.origem === "contingencia";

      setOrigem(usouContingencia ? "contingencia" : "api");
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      setErro(error.message);
      setOrigem("api");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const estatisticas = useMemo(() => {
    const total = atividades.length;
    const concluidas = atividades.filter((a) => a.status === "concluida").length;
    const pendentes = total - concluidas;

    // Matérias cadastradas + matérias que só aparecem nas atividades.
    const nomes = new Map();
    const cores = {};

    materiasCadastradas.forEach((materia) => {
      if (!materia.nome) return;
      const chave = materia.nome.toLowerCase();
      nomes.set(chave, materia.nome);
      if (materia.cor) cores[chave] = materia.cor;
    });

    atividades.forEach((atividade) => {
      if (!atividade.materia) return;
      const chave = atividade.materia.toLowerCase();
      if (!nomes.has(chave)) nomes.set(chave, atividade.materia);
    });

    const contagem = {};
    let semMateria = 0;

    atividades.forEach((atividade) => {
      if (!atividade.materia) {
        semMateria += 1;
        return;
      }
      const chave = atividade.materia.toLowerCase();
      contagem[chave] = (contagem[chave] || 0) + 1;
    });

    const porMateria = Array.from(nomes.entries())
      .map(([chave, nome], indice) => ({
        chave,
        nome,
        valor: contagem[chave] || 0,
        cor: cores[chave] || PALETA[indice % PALETA.length],
      }))
      .sort((a, b) => b.valor - a.valor || a.nome.localeCompare(b.nome));

    if (semMateria > 0) {
      porMateria.push({
        chave: "sem-materia",
        nome: "Sem matéria",
        valor: semMateria,
        cor: "#94a3b8",
      });
    }

    const porPrioridade = ["alta", "media", "baixa"].map((chave) => ({
      chave,
      rotulo: rotulosPrioridade[chave],
      cor: COR_PRIORIDADE[chave],
      valor: atividades.filter((a) => (a.prioridade || "baixa") === chave).length,
    }));

    const porStatus = [
      { chave: "pendente", valor: pendentes },
      { chave: "concluida", valor: concluidas },
    ].map((item) => ({
      ...item,
      rotulo: rotulosStatus[item.chave],
      cor: COR_STATUS[item.chave],
    }));

    return {
      total,
      pendentes,
      concluidas,
      totalMaterias: nomes.size,
      porMateria,
      porPrioridade,
      porStatus,
      maiorMateria: Math.max(0, ...porMateria.map((m) => m.valor)),
    };
  }, [atividades, materiasCadastradas]);

  const {
    total,
    pendentes,
    concluidas,
    totalMaterias,
    porMateria,
    porPrioridade,
    porStatus,
    maiorMateria,
  } = estatisticas;

  return (
    <main className="estatisticas-page">
      <header className="estatisticas-header">
        <div>
          <span className="estatisticas-subtitle">ACOMPANHAMENTO</span>
          <h1>Estatísticas</h1>
          <p>Veja como está a sua organização acadêmica.</p>
        </div>

        <Link to="/atividades/nova" className="estatisticas-botao">
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
        <section className="estatisticas-cards">
          <article className="estatisticas-card">
            <span>Total de atividades</span>
            <strong>{total}</strong>
            <small>Atividades cadastradas</small>
          </article>

          <article className="estatisticas-card">
            <span>Pendentes</span>
            <strong className="cor-pendente">{pendentes}</strong>
            <small>{porcentagem(pendentes, total)}% do total</small>
          </article>

          <article className="estatisticas-card">
            <span>Concluídas</span>
            <strong className="cor-concluida">{concluidas}</strong>
            <small>{porcentagem(concluidas, total)}% do total</small>
          </article>

          <article className="estatisticas-card">
            <span>Matérias</span>
            <strong>{totalMaterias}</strong>
            <small>Disciplinas ativas</small>
          </article>
        </section>

        {total === 0 ? (
          <section className="estatisticas-painel">
            <p className="estatisticas-vazio">
              Nenhuma atividade cadastrada ainda. Cadastre atividades para ver
              os gráficos.
            </p>
          </section>
        ) : (
          <>
            <section className="estatisticas-painel">
              <div className="estatisticas-painel-topo">
                <h2>Atividades por matéria</h2>
                <span>{porMateria.length} matéria(s)</span>
              </div>

              <ul className="est-barras">
                {porMateria.map((materia) => (
                  <li key={materia.chave}>
                    <span className="est-barra-nome" title={materia.nome}>
                      <i style={{ backgroundColor: materia.cor }} />
                      {materia.nome}
                    </span>

                    <div
                      className="est-barra-trilho"
                      role="img"
                      aria-label={`${materia.nome}: ${materia.valor} atividade(s)`}
                    >
                      <div
                        className="est-barra-preenchimento"
                        style={{
                          width: `${porcentagem(materia.valor, maiorMateria)}%`,
                          backgroundColor: materia.cor,
                        }}
                      />
                    </div>

                    <strong>{materia.valor}</strong>
                  </li>
                ))}
              </ul>
            </section>

            <section className="estatisticas-graficos">
              <article className="estatisticas-painel">
                <div className="estatisticas-painel-topo">
                  <h2>Por prioridade</h2>
                </div>

                <Rosca
                  titulo="Distribuição por prioridade"
                  fatias={porPrioridade}
                  total={total}
                />
              </article>

              <article className="estatisticas-painel">
                <div className="estatisticas-painel-topo">
                  <h2>Por situação</h2>
                </div>

                <Rosca
                  titulo="Distribuição por situação"
                  fatias={porStatus}
                  total={total}
                />
              </article>
            </section>
          </>
        )}
      </EstadoRequisicao>
    </main>
  );
}