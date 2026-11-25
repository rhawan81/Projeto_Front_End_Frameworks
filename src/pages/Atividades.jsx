import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { salvarAtividades } from "../data/storage";
import { useToast } from "../toast/ToastContext";
import {
  IconeBusca,
  IconeMais,
  IconeLapis,
  IconeLixeira,
} from "../icons";
import {
  buscarAtividades,
  atualizarStatusAtividadeApi,
  excluirAtividade,
} from "../services/atividadesService";
import { buscarMaterias } from "../services/materiasService";
import EstadoRequisicao from "../components/EstadoRequisicao.jsx";

function formatarData(dataStr) {
  if (!dataStr) return "--/--/----";

  const partes = dataStr.split("-");

  if (partes.length < 3) return dataStr;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

const rotulosPrioridade = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

function Atividades() {
  const [atividades, setAtividades] = useState([]);
  const [materiasCadastradas, setMateriasCadastradas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [origem, setOrigem] = useState("api");
  const [erro, setErro] = useState(null);

  const [aba, setAba] = useState("todas");
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const filtroMateria = searchParams.get("materia") || "todas";
  const busca = searchParams.get("busca") || "";

  function atualizarFiltrosUrl({ materia = filtroMateria, termo = busca }) {
    const params = {};
    if (materia && materia !== "todas") params.materia = materia;
    if (termo) params.busca = termo;
    setSearchParams(params, { replace: true });
  }

  const { mostrarToast } = useToast();

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const [resultadoAtividades, resultadoMaterias] =
        await Promise.all([buscarAtividades(), buscarMaterias()]);

      if (
        !Array.isArray(resultadoAtividades.dados) ||
        !Array.isArray(resultadoMaterias.dados)
      ) {
        throw new Error("A API retornou dados em um formato inesperado.");
      }

      const atividadesFormatadas = resultadoAtividades.dados.map(
        (atividade) => ({
          ...atividade,
          status: String(atividade.status || "pendente").toLowerCase(),
          prioridade: String(atividade.prioridade || "baixa").toLowerCase(),
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
      console.error("Erro ao carregar atividades:", erroCarregamento);

      setErro(erroCarregamento.message);
      setOrigem("api");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function atualizarESalvar(novaLista) {
    setAtividades(novaLista);
    salvarAtividades(novaLista);
  }

  async function handleConcluir(id) {
    const atividade = atividades.find((a) => a.id === id);

    if (!atividade) return;

    const novoStatus =
      atividade.status === "concluida" ? "pendente" : "concluida";

    try {
      await atualizarStatusAtividadeApi(id, novoStatus);
      const novaLista = atividades.map((a) =>
        a.id === id ? { ...a, status: novoStatus } : a
      );
      atualizarESalvar(novaLista);

      mostrarToast(
        novoStatus === "concluida"
          ? "Atividade marcada como concluída."
          : "Atividade reaberta como pendente."
      );
    } catch (erroAcao) {
      mostrarToast(
        erroAcao.message || "Não foi possível atualizar a situação.",
        "erro"
      );
    }
  }

  async function handleExcluir(id) {
    try {
      await excluirAtividade(id);
      const novaLista = atividades.filter((a) => a.id !== id);
      atualizarESalvar(novaLista);
      mostrarToast("Atividade excluída.", "aviso");
    } catch (erroAcao) {
      mostrarToast(
        erroAcao.message || "Não foi possível excluir a atividade.",
        "erro"
      );
    }
  }

  const materias = useMemo(() => {
    const setMat = new Set();

    materiasCadastradas.forEach((m) => {
      if (m.nome) setMat.add(m.nome);
    });

    atividades.forEach((a) => {
      if (a.materia) setMat.add(a.materia);
    });

    return Array.from(setMat).sort();
  }, [materiasCadastradas, atividades]);

  const mapaCores = useMemo(() => {
    const mapa = {};

    materiasCadastradas.forEach((m) => {
      if (m.nome && m.cor) {
        mapa[m.nome.toLowerCase()] = m.cor;
      }
    });

    return mapa;
  }, [materiasCadastradas]);

  const contagemPorMateria = useMemo(() => {
    const cont = {};

    atividades.forEach((a) => {
      if (a.materia) {
        cont[a.materia] = (cont[a.materia] || 0) + 1;
      }
    });

    return cont;
  }, [atividades]);

  const atividadesFiltradas = useMemo(() => {
    return atividades
      .filter((a) => (aba === "todas" ? true : a.status === aba))
      .filter((a) =>
        (a.titulo || "").toLowerCase().includes(busca.toLowerCase())
      )
      .filter((a) =>
        filtroMateria === "todas"
          ? true
          : a.materia?.toLowerCase() === filtroMateria.toLowerCase()
      );
  }, [atividades, aba, busca, filtroMateria]);

  const linkNova =
    filtroMateria !== "todas"
      ? `/atividades/nova?materia=${encodeURIComponent(filtroMateria)}`
      : "/atividades/nova";

  const daMateria = (a) =>
    filtroMateria === "todas"
      ? true
      : a.materia?.toLowerCase() === filtroMateria.toLowerCase();

  const abas = [
    {
      chave: "todas",
      rotulo: `Todas (${atividades.filter(daMateria).length})`,
    },
    {
      chave: "pendente",
      rotulo: `Pendentes (${
        atividades.filter((a) => a.status === "pendente" && daMateria(a))
          .length
      })`,
    },
    {
      chave: "concluida",
      rotulo: `Concluídas (${
        atividades.filter((a) => a.status === "concluida" && daMateria(a))
          .length
      })`,
    },
  ];

  return (
    <section className="atividades">
      <EstadoRequisicao
        carregando={carregando}
        erro={erro}
        origem={origem}
        vazio={false}
        onTentarNovamente={carregarDados}
      >
        <div className="atividades-topo">
          <h1>Atividades</h1>

          <div className="atividades-topo-acoes">
            <div className="campo-busca">
              <IconeBusca />

              <input
                type="text"
                placeholder="Buscar atividades..."
                value={busca}
                onChange={(e) => atualizarFiltrosUrl({ termo: e.target.value })}
              />
            </div>

            <button
              type="button"
              className="botao-secundario"
              onClick={() => setMostrarFiltro((v) => !v)}
            >
              Filtros
            </button>

            <Link to={linkNova} className="botao-primario">
              <IconeMais /> Nova atividade
            </Link>
          </div>
        </div>

        {mostrarFiltro && (
          <div className="painel-filtro">
            <label>
              Matéria

              <select
                value={filtroMateria}
                onChange={(e) => {
                  atualizarFiltrosUrl({ materia: e.target.value });
                }}
              >
                <option value="todas">Todas as matérias</option>

                {materias.map((m) => (
                  <option key={m} value={m}>
                    {m} ({contagemPorMateria[m] || 0})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="seletor-materias-abas">
          <span className="seletor-materias-titulo">Matéria:</span>

          <div className="seletor-materias-lista">
            <button
              type="button"
              className={`aba-materia-chip ${
                filtroMateria === "todas" ? "chip-ativo" : ""
              }`}
              onClick={() => atualizarFiltrosUrl({ materia: "todas" })}
            >
              Todas ({atividades.length})
            </button>

            {materias.map((m) => {
              const cor = mapaCores[m.toLowerCase()] || "#8B5CF6";
              const total = contagemPorMateria[m] || 0;
              const ativa =
                filtroMateria.toLowerCase() === m.toLowerCase();

              return (
                <button
                  key={m}
                  type="button"
                  className={`aba-materia-chip ${ativa ? "chip-ativo" : ""}`}
                  onClick={() => atualizarFiltrosUrl({ materia: m })}
                >
                  <span
                    className="chip-ponto-cor"
                    style={{ backgroundColor: cor }}
                  />

                  <span>{m}</span>

                  <span className="chip-contador">{total}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="abas">
          {abas.map(({ chave, rotulo }) => (
            <button
              key={chave}
              type="button"
              className={aba === chave ? "aba aba-ativa" : "aba"}
              onClick={() => setAba(chave)}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {atividadesFiltradas.length === 0 ? (
          <div className="mensagem-vazia">
            <p>Nenhuma atividade encontrada com esses filtros.</p>

            <Link
              to={linkNova}
              className="botao-primario"
              style={{ marginTop: "12px", display: "inline-flex" }}
            >
              <IconeMais />
              Cadastrar atividade{" "}
              {filtroMateria !== "todas" ? `em ${filtroMateria}` : ""}
            </Link>
          </div>
        ) : (
          <div className="tabela-wrap">
            <table className="tabela-atividades">
              <thead>
                <tr>
                  <th>Atividade</th>
                  <th>Matéria</th>
                  <th>Prazo</th>
                  <th>Prioridade</th>
                  <th>Situação</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>

              <tbody>
                {atividadesFiltradas.map((a) => (
                  <tr key={a.id}>
                    <td
                      className={
                        a.status === "concluida" ? "titulo-concluido" : ""
                      }
                    >
                      {a.titulo}
                    </td>

                    <td>
                      <span
                        className="selo-materia-tabela"
                        style={{
                          borderColor:
                            mapaCores[a.materia?.toLowerCase()] ||
                            "var(--borda)",
                        }}
                      >
                        <span
                          className="bolinha-materia-tabela"
                          style={{
                            backgroundColor:
                              mapaCores[a.materia?.toLowerCase()] ||
                              "var(--primario)",
                          }}
                        />

                        {a.materia}
                      </span>
                    </td>

                    <td>{formatarData(a.prazo)}</td>

                    <td>
                      <span className={`selo selo-${a.prioridade}`}>
                        {rotulosPrioridade[a.prioridade] || "Baixa"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`situacao-toggle ${a.status}`}
                        onClick={() => handleConcluir(a.id)}
                      >
                        <span className="bolinha" />

                        {a.status === "concluida" ? "Concluído" : "Pendente"}
                      </button>
                    </td>

                    <td className="coluna-acoes">
                      <Link
                        to={`/atividades/${a.id}/editar`}
                        aria-label="Editar"
                      >
                        <IconeLapis />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleExcluir(a.id)}
                        aria-label="Excluir"
                      >
                        <IconeLixeira />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </EstadoRequisicao>
    </section>
  );
}

export default Atividades;