import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { carregarAtividades, salvarAtividades } from "../data/storage";
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
  const [aba, setAba] = useState("todas");
  const [busca, setBusca] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("todas");
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const { mostrarToast } = useToast();

  useEffect(() => {
    setAtividades(carregarAtividades());
  }, []);

  function atualizarESalvar(novaLista) {
    setAtividades(novaLista);
    salvarAtividades(novaLista);
  }

  function handleConcluir(id) {
    const atividade = atividades.find((a) => a.id === id);
    const novaLista = atividades.map((a) =>
      a.id === id
        ? { ...a, status: a.status === "concluida" ? "pendente" : "concluida" }
        : a
    );
    atualizarESalvar(novaLista);
    mostrarToast(
      atividade.status === "concluida"
        ? "Atividade reaberta."
        : "Atividade marcada como concluída."
    );
  }

  function handleExcluir(id) {
    const novaLista = atividades.filter((a) => a.id !== id);
    atualizarESalvar(novaLista);
    mostrarToast("Atividade excluída.", "aviso");
  }

  const materias = useMemo(
    () => [...new Set(atividades.map((a) => a.materia))].sort(),
    [atividades]
  );

  const atividadesFiltradas = useMemo(() => {
    return atividades
      .filter((a) => (aba === "todas" ? true : a.status === aba))
      .filter((a) => a.titulo.toLowerCase().includes(busca.toLowerCase()))
      .filter((a) =>
        filtroMateria === "todas" ? true : a.materia === filtroMateria
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
            Filtro
          </button>
          <Link to="/atividades/nova" className="botao-primario">
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
              onChange={(e) => setFiltroMateria(e.target.value)}
            >
              <option value="todas">Todas</option>
              {materias.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="abas">
        {[
          { chave: "todas", rotulo: "Todas" },
          { chave: "pendente", rotulo: "Pendentes" },
          { chave: "concluida", rotulo: "Concluídas" },
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
        <p className="mensagem-vazia">
          Nenhuma atividade encontrada com esses filtros.
        </p>
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
                  <td className={a.status === "concluida" ? "titulo-concluido" : ""}>
                    {a.titulo}
                  </td>
                  <td>{a.materia}</td>
                  <td>{formatarData(a.prazo)}</td>
                  <td>
                    <span className={`selo selo-${a.prioridade}`}>
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
                      {a.status === "concluida" ? "Concluído" : "Pendente"}
                    </button>
                  </td>
                  <td className="coluna-acoes">
                    <Link to={`/atividades/${a.id}/editar`} aria-label="Editar">
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