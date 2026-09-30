import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { carregarAtividades, salvarAtividades, carregarMaterias } from "../data/storage";
import { useToast } from "../toast/ToastContext";
import { IconeBusca, IconeMais, IconeLapis, IconeLixeira } from "../icons";

function formatarData(dataStr) {
  if (!dataStr) return "--/--/----";
  const partes = dataStr.split("-");
  if (partes.length < 3) return dataStr;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

const rotulosPrioridade = { alta: "Alta", media: "Média", baixa: "Baixa" };

function Atividades() {
  const [atividades, setAtividades] = useState([]);
  const [materiasCadastradas, setMateriasCadastradas] = useState([]);
  const [aba, setAba] = useState("todas");
  const [busca, setBusca] = useState("");

  // Lê a matéria enviada pela URL
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroMateria = searchParams.get("materia") || "todas";

  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const { mostrarToast } = useToast();

  useEffect(() => {
    setAtividades(carregarAtividades());
    setMateriasCadastradas(carregarMaterias());
  }, []);

  function atualizarESalvar(novaLista) {
    setAtividades(novaLista);
    salvarAtividades(novaLista);
  }

  function handleConcluir(id) {
    const atividade = atividades.find((a) => a.id === id);
    const novoStatus = atividade.status === "concluida" ? "pendente" : "concluida";
    const novaLista = atividades.map((a) =>
      a.id === id ? { ...a, status: novoStatus } : a
    );
    atualizarESalvar(novaLista);
    mostrarToast(
      novoStatus === "concluida"
        ? "Atividade marcada como concluída."
        : "Atividade reaberta como pendente."
    );
  }

  function handleExcluir(id) {
    const novaLista = atividades.filter((a) => a.id !== id);
    atualizarESalvar(novaLista);
    mostrarToast("Atividade excluída.", "aviso");
  }

  // Lista unificada de matérias
  const materias = useMemo(() => {
    const setMat = new Set();
    materiasCadastradas.forEach((m) => m.nome && setMat.add(m.nome));
    atividades.forEach((a) => a.materia && setMat.add(a.materia));
    return Array.from(setMat).sort();
  }, [materiasCadastradas, atividades]);

  // Mapa de cores para as matérias
  const mapaCores = useMemo(() => {
    const mapa = {};
    materiasCadastradas.forEach((m) => {
      if (m.nome && m.cor) mapa[m.nome.toLowerCase()] = m.cor;
    });
    return mapa;
  }, [materiasCadastradas]);

  // Contagem de atividades por matéria
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
      .filter((a) => a.titulo.toLowerCase().includes(busca.toLowerCase()))
      .filter((a) =>
        filtroMateria === "todas" ? true : a.materia?.toLowerCase() === filtroMateria.toLowerCase()
      );
  }, [atividades, aba, busca, filtroMateria]);

  return (
    <section className="atividades">
      <div className="atividades-topo">
        <h1>Atividades</h1>

        <div className="atividades-topo-acoes">
          <div className="campo-busca">
            <IconeBusca />
            <input
              type="text"
              placeholder="Buscar atividades..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="botao-secundario"
            onClick={() => setMostrarFiltro((v) => !v)}
          >
            Filtros
          </button>

          <Link
            to={filtroMateria !== "todas" ? `/atividades/nova?materia=${encodeURIComponent(filtroMateria)}` : "/atividades/nova"}
            className="botao-primario"
          >
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
                const materiaSelecionada = e.target.value;
                if (materiaSelecionada === "todas") {
                  setSearchParams({});
                } else {
                  setSearchParams({ materia: materiaSelecionada });
                }
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

      {/* Abas de Matérias: Navegação rápida por disciplina */}
      <div className="seletor-materias-abas">
        <span className="seletor-materias-titulo">Matéria:</span>
        <div className="seletor-materias-lista">
          <button
            type="button"
            className={`aba-materia-chip ${filtroMateria === "todas" ? "chip-ativo" : ""}`}
            onClick={() => setSearchParams({})}
          >
            Todas ({atividades.length})
          </button>

          {materias.map((m) => {
            const cor = mapaCores[m.toLowerCase()] || "#8B5CF6";
            const total = contagemPorMateria[m] || 0;
            const ativa = filtroMateria.toLowerCase() === m.toLowerCase();

            return (
              <button
                key={m}
                type="button"
                className={`aba-materia-chip ${ativa ? "chip-ativo" : ""}`}
                onClick={() => setSearchParams({ materia: m })}
              >
                <span className="chip-ponto-cor" style={{ backgroundColor: cor }} />
                <span>{m}</span>
                <span className="chip-contador">{total}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Abas de Situação: Todas / Pendentes / Concluídas */}
      <div className="abas">
        {[
          { chave: "todas", rotulo: `Todas (${atividades.filter(a => filtroMateria === "todas" ? true : a.materia?.toLowerCase() === filtroMateria.toLowerCase()).length})` },
          { chave: "pendente", rotulo: `Pendentes (${atividades.filter(a => a.status === "pendente" && (filtroMateria === "todas" ? true : a.materia?.toLowerCase() === filtroMateria.toLowerCase())).length})` },
          { chave: "concluida", rotulo: `Concluídas (${atividades.filter(a => a.status === "concluida" && (filtroMateria === "todas" ? true : a.materia?.toLowerCase() === filtroMateria.toLowerCase())).length})` },
        ].map(({ chave, rotulo }) => (
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
            to={filtroMateria !== "todas" ? `/atividades/nova?materia=${encodeURIComponent(filtroMateria)}` : "/atividades/nova"}
            className="botao-primario"
            style={{ marginTop: "12px", display: "inline-flex" }}
          >
            <IconeMais /> Cadastrar atividade {filtroMateria !== "todas" ? `em ${filtroMateria}` : ""}
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
                      a.status === "concluida"
                        ? "titulo-concluido"
                        : ""
                    }
                  >
                    {a.titulo}
                  </td>

                  <td>
                    <span
                      className="selo-materia-tabela"
                      style={{
                        borderColor: mapaCores[a.materia?.toLowerCase()] || "var(--borda)",
                      }}
                    >
                      <span
                        className="bolinha-materia-tabela"
                        style={{ backgroundColor: mapaCores[a.materia?.toLowerCase()] || "var(--primario)" }}
                      />
                      {a.materia}
                    </span>
                  </td>

                  <td>
                    {formatarData(a.prazo)}
                  </td>

                  <td>
                    <span
                      className={`selo selo-${a.prioridade}`}
                    >
                      {rotulosPrioridade[a.prioridade]}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className={`situacao-toggle ${a.status}`}
                      onClick={() => handleConcluir(a.id)}
                    >
                      <span className="bolinha" />
                      {a.status === "concluida"
                        ? "Concluído"
                        : "Pendente"}
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
    </section>
  );
}

export default Atividades;