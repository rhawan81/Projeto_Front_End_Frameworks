import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { carregarAtividades, salvarAtividades, carregarMaterias } from "../data/storage";
import { useToast } from "../toast/ToastContext";
import { IconeBusca, IconeMais, IconeLapis, IconeLixeira } from "../icons";

/**
 * Converte datas do formato ISO/Banco (AAAA-MM-DD) para o formato brasileiro (DD/MM/AAAA).
 * Retorna um valor padrão se a data não estiver preenchida.
 */
function formatarData(dataStr) {
  if (!dataStr) return "--/--/----";
  const partes = dataStr.split("-");
  if (partes.length < 3) return dataStr;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Mapeamento dos códigos internos de prioridade para exibição amigável na tela
const rotulosPrioridade = { alta: "Alta", media: "Média", baixa: "Baixa" };

function Atividades() {
  // --- ESTADOS NATIVOS DA APLICAÇÃO ---
  const [atividades, setAtividades] = useState([]);
  const [materiasCadastradas, setMateriasCadastradas] = useState([]);
  const [aba, setAba] = useState("todas"); // Controla o filtro por situação ('todas', 'pendente', 'concluida')
  const [busca, setBusca] = useState(""); // Filtro de busca textual no título da atividade
  const [mostrarFiltro, setMostrarFiltro] = useState(false); // Alterna a exibição do painel retrátil de filtros

  // --- HOOKS DE BIBLIOTECAS E CONTEXTO ---
  // Gerencia a leitura e escrita de parâmetros na URL (query string: ?materia=Nome)
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroMateria = searchParams.get("materia") || "todas";

  // Dispara notificações visuais (mensagens de confirmação/aviso)
  const { mostrarToast } = useToast();

  // Carrega os dados persistidos no armazenamento local assim que o componente é montado
  useEffect(() => {
    setAtividades(carregarAtividades());
    setMateriasCadastradas(carregarMaterias());
  }, []);

  /**
   * Helper que mantém o estado local em sincronia com o localStorage.
   */
  function atualizarESalvar(novaLista) {
    setAtividades(novaLista);
    salvarAtividades(novaLista);
  }

  /**
   * Alterna a situação da atividade entre 'concluida' e 'pendente'.
   */
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

  /**
   * Remove uma atividade da lista pelo ID.
   */
  function handleExcluir(id) {
    const novaLista = atividades.filter((a) => a.id !== id);
    atualizarESalvar(novaLista);
    mostrarToast("Atividade excluída.", "aviso");
  }

  // --- CÁLCULOS MEMORIZADOS (useMemo para otimização de performance) ---

  // Gera uma lista única e alfabética de matérias unindo as cadastradas com as usadas nas atividades
  const materias = useMemo(() => {
    const setMat = new Set();
    materiasCadastradas.forEach((m) => m.nome && setMat.add(m.nome));
    atividades.forEach((a) => a.materia && setMat.add(a.materia));
    return Array.from(setMat).sort();
  }, [materiasCadastradas, atividades]);

  // Cria um mapa de consulta rápida [nome_da_materia]: "cor_hex"
  const mapaCores = useMemo(() => {
    const mapa = {};
    materiasCadastradas.forEach((m) => {
      if (m.nome && m.cor) mapa[m.nome.toLowerCase()] = m.cor;
    });
    return mapa;
  }, [materiasCadastradas]);

  // Mapeia a contagem total de atividades registradas para cada matéria
  const contagemPorMateria = useMemo(() => {
    const cont = {};
    atividades.forEach((a) => {
      if (a.materia) {
        cont[a.materia] = (cont[a.materia] || 0) + 1;
      }
    });
    return cont;
  }, [atividades]);

  // Aplica o encadeamento de filtros (Aba de Situação, Busca por Texto e Filtro por Matéria)
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
      {/* Cabeçalho da página com busca, botão de filtros adicionais e ação de criação */}
      <div className="atividades-topo">
        <h1>Atividades</h1>

        <div className="atividades-topo-acoes">
          {/* Campo de pesquisa por texto */}
          <div className="campo-busca">
            <IconeBusca />
            <input
              type="text"
              placeholder="Buscar atividades..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* Botão para abrir/fechar o painel de filtros adicionais */}
          <button
            type="button"
            className="botao-secundario"
            onClick={() => setMostrarFiltro((v) => !v)}
          >
            Filtros
          </button>

          {/* Botão de nova atividade, que preserva o contexto da matéria ativa na URL se houver */}
          <Link
            to={filtroMateria !== "todas" ? `/atividades/nova?materia=${encodeURIComponent(filtroMateria)}` : "/atividades/nova"}
            className="botao-primario"
          >
            <IconeMais /> Nova atividade
          </Link>
        </div>
      </div>

      {/* Painel retrátil contendo o menu suspenso (select) de matérias */}
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

      {/* Abas superiores no formato de "Chips" para navegação rápida entre matérias */}
      <div className="seletor-materias-abas">
        <span className="seletor-materias-titulo">Matéria:</span>
        <div className="seletor-materias-lista">
          {/* Chip para limpar o filtro de matérias */}
          <button
            type="button"
            className={`aba-materia-chip ${filtroMateria === "todas" ? "chip-ativo" : ""}`}
            onClick={() => setSearchParams({})}
          >
            Todas ({atividades.length})
          </button>

          {/* Renderização dinâmica de cada chip com a cor da matéria e contador */}
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

      {/* Abas secundárias para filtrar pelo status/situação da atividade */}
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

      {/* Renderização condicional: exibe o estado vazio se nenhuma atividade for encontrada */}
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
        /* Tabela com a listagem principal das atividades */
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
                  {/* Título com estilização condicional para tarefas concluídas */}
                  <td
                    className={
                      a.status === "concluida"
                        ? "titulo-concluido"
                        : ""
                    }
                  >
                    {a.titulo}
                  </td>

                  {/* Tag com a cor dinâmica referente à matéria */}
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

                  {/* Data formatada para DD/MM/AAAA */}
                  <td>
                    {formatarData(a.prazo)}
                  </td>

                  {/* Badge visual referente à prioridade */}
                  <td>
                    <span
                      className={`selo selo-${a.prioridade}`}
                    >
                      {rotulosPrioridade[a.prioridade]}
                    </span>
                  </td>

                  {/* Botão de alternância (Toggle) do status da atividade */}
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

                  {/* Coluna de ações rápidas: Editar e Excluir */}
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
