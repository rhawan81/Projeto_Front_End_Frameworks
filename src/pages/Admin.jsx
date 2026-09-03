import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../toast/ToastContext";
import { carregarAtividades, salvarAtividades } from "../data/storage";
import { testarConexaoApi, buscarAtividadesDaApi, API_URL } from "../services/api";
import {
  IconeEscudo,
  IconeUsuarios,
  IconeNuvem,
  IconeCheck,
  IconeLixeira,
  IconeMais,
  IconeGrade,
  IconeLista,
} from "../icons";

export default function Admin() {
  const {
    usuario: adminLogado,
    usuarios,
    alternarPapelUsuario,
    alternarStatusUsuario,
    excluirUsuario,
    cadastrarUsuario,
  } = useAuth();

  const { mostrarToast } = useToast();

  // Estados principais do painel
  const [abaAtiva, setAbaAtiva] = useState("metricas"); // 'metricas' | 'usuarios' | 'materias' | 'api'
  const [atividades, setAtividades] = useState([]);
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [filtroPapel, setFiltroPapel] = useState("todos");

  // Modal para criar novo usuário
  const [modalNovoUsuario, setModalNovoUsuario] = useState(false);
  const [formNovoUsuario, setFormNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    papel: "estudante",
  });

  // Estado da nova matéria
  const [novaMateria, setNovaMateria] = useState("");

  // Estado do teste de API
  const [testandoApi, setTestandoApi] = useState(false);
  const [resultadoApi, setResultadoApi] = useState(null);
  const [importandoApi, setImportandoApi] = useState(false);

  // Log de auditoria administrativo
  const [logs, setLogs] = useState([
    {
      id: 1,
      hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      acao: "Painel de Administração inicializado com sucesso.",
      tipo: "info",
    },
  ]);

  function registrarLog(acao, tipo = "info") {
    const novoLog = {
      id: Date.now(),
      hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      acao,
      tipo,
    };
    setLogs((antigos) => [novoLog, ...antigos.slice(0, 19)]);
  }

  // Carrega atividades existentes
  useEffect(() => {
    setAtividades(carregarAtividades());
  }, []);

  // Cálculos de métricas do sistema
  const metricas = useMemo(() => {
    const totalUsuarios = usuarios.length;
    const totalAdmins = usuarios.filter((u) => u.papel === "admin").length;
    const totalEstudantes = usuarios.filter((u) => u.papel === "estudante").length;
    const totalBloqueados = usuarios.filter((u) => u.status === "bloqueado").length;

    const totalAtividades = atividades.length;
    const pendentes = atividades.filter((a) => a.status === "pendente").length;
    const concluidas = atividades.filter((a) => a.status === "concluida").length;
    const taxaConclusao =
      totalAtividades > 0 ? Math.round((concluidas / totalAtividades) * 100) : 0;

    const materiasSet = new Set(atividades.map((a) => a.materia).filter(Boolean));

    return {
      totalUsuarios,
      totalAdmins,
      totalEstudantes,
      totalBloqueados,
      totalAtividades,
      pendentes,
      concluidas,
      taxaConclusao,
      totalMaterias: materiasSet.size,
    };
  }, [usuarios, atividades]);

  // Lista de matérias com contagem de atividades
  const listaMaterias = useMemo(() => {
    const contagem = {};
    atividades.forEach((a) => {
      if (a.materia) {
        contagem[a.materia] = (contagem[a.materia] || 0) + 1;
      }
    });

    return Object.entries(contagem).map(([nome, total]) => ({
      nome,
      totalAtividades: total,
    }));
  }, [atividades]);

  // Filtro de usuários
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const bateBusca =
        u.nome.toLowerCase().includes(buscaUsuario.toLowerCase()) ||
        u.email.toLowerCase().includes(buscaUsuario.toLowerCase());
      const batePapel = filtroPapel === "todos" ? true : u.papel === filtroPapel;
      return bateBusca && batePapel;
    });
  }, [usuarios, buscaUsuario, filtroPapel]);

  // Manipuladores de Usuário
  function handleAlternarPapel(u) {
    if (u.id === adminLogado.id) {
      mostrarToast("Você não pode rebaixar seu próprio papel de administrador.", "aviso");
      return;
    }
    alternarPapelUsuario(u.id);
    const novoPapel = u.papel === "admin" ? "Estudante" : "Administrador";
    mostrarToast(`Papel de ${u.nome} alterado para ${novoPapel}.`, "sucesso");
    registrarLog(`Papel de "${u.nome}" alterado para ${novoPapel}.`, "aviso");
  }

  function handleAlternarStatus(u) {
    if (u.id === adminLogado.id) {
      mostrarToast("Você não pode bloquear sua própria conta.", "aviso");
      return;
    }
    alternarStatusUsuario(u.id);
    const novoStatus = u.status === "ativo" ? "Bloqueado" : "Ativo";
    mostrarToast(`Status de ${u.nome} alterado para ${novoStatus}.`);
    registrarLog(`Usuário "${u.nome}" foi ${novoStatus.toLowerCase()}.`, "aviso");
  }

  function handleExcluirUsuario(u) {
    const confirmou = window.confirm(`Deseja realmente excluir o usuário "${u.nome}"?`);
    if (!confirmou) return;

    const res = excluirUsuario(u.id);
    if (res.sucesso) {
      mostrarToast(`Usuário ${u.nome} excluído.`, "aviso");
      registrarLog(`Usuário "${u.nome}" foi removido do sistema.`, "erro");
    } else {
      mostrarToast(res.erro, "erro");
    }
  }

  function handleCriarUsuarioSubmit(e) {
    e.preventDefault();
    if (!formNovoUsuario.nome.trim() || !formNovoUsuario.email.trim() || !formNovoUsuario.senha) {
      mostrarToast("Preencha todos os campos do usuário.", "erro");
      return;
    }

    const res = cadastrarUsuario(formNovoUsuario);
    if (res.sucesso) {
      mostrarToast(`Usuário ${formNovoUsuario.nome} criado com sucesso!`, "sucesso");
      registrarLog(`Novo usuário "${formNovoUsuario.nome}" cadastrado com perfil ${formNovoUsuario.papel}.`, "sucesso");
      setModalNovoUsuario(false);
      setFormNovoUsuario({ nome: "", email: "", senha: "", papel: "estudante" });
    } else {
      mostrarToast(res.erro, "erro");
    }
  }

  // Manipulador de Matérias
  function handleAdicionarMateria(e) {
    e.preventDefault();
    const nomeLimpo = novaMateria.trim();
    if (!nomeLimpo) {
      mostrarToast("Informe o nome da matéria.", "erro");
      return;
    }

    const jaExiste = atividades.some(
      (a) => a.materia.toLowerCase() === nomeLimpo.toLowerCase()
    );

    if (jaExiste) {
      mostrarToast("Esta matéria já existe no sistema.", "aviso");
      return;
    }

    // Cria uma atividade modelo para inicializar a matéria no registro
    const novaAtividadeModelo = {
      id: `mat-${Date.now()}`,
      titulo: `Apresentação da disciplina: ${nomeLimpo}`,
      materia: nomeLimpo,
      descricao: "Matéria cadastrada pelo painel administrativo.",
      prazo: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      prioridade: "media",
      status: "pendente",
    };

    const atualizadas = [...atividades, novaAtividadeModelo];
    setAtividades(atualizadas);
    salvarAtividades(atualizadas);
    setNovaMateria("");
    mostrarToast(`Matéria "${nomeLimpo}" cadastrada com sucesso!`, "sucesso");
    registrarLog(`Nova matéria "${nomeLimpo}" adicionada às disciplinas.`, "sucesso");
  }

  // Manipuladores de Integração da API
  async function handleTestarApi() {
    setTestandoApi(true);
    try {
      const res = await testarConexaoApi();
      setResultadoApi(res);
      if (res.sucesso) {
        mostrarToast(`API Online! Resposta em ${res.tempoMs}ms`, "sucesso");
        registrarLog(`Teste da API REST bem-sucedido (${res.tempoMs}ms).`, "sucesso");
      } else {
        mostrarToast("Falha na conexão com a API.", "erro");
        registrarLog(`Falha no teste da API REST: ${res.erro}`, "erro");
      }
    } catch (err) {
      mostrarToast("Erro ao contatar API.", "erro");
    } finally {
      setTestandoApi(false);
    }
  }

  async function handleImportarTarefasApi() {
    setImportandoApi(true);
    try {
      const tarefasImportadas = await buscarAtividadesDaApi();
      const listaCombinada = [...atividades, ...tarefasImportadas];
      setAtividades(listaCombinada);
      salvarAtividades(listaCombinada);
      mostrarToast(`${tarefasImportadas.length} tarefas importadas da API com sucesso!`, "sucesso");
      registrarLog(`Importadas ${tarefasImportadas.length} tarefas da API REST JSONPlaceholder.`, "sucesso");
    } catch (err) {
      mostrarToast("Não foi possível importar tarefas da API.", "erro");
      registrarLog(`Erro ao importar dados da API: ${err.message}`, "erro");
    } finally {
      setImportandoApi(false);
    }
  }

  return (
    <section className="painel-adm">
      {/* Cabeçalho do ADM */}
      <div className="adm-topo">
        <div>
          <div className="badge-adm">
            <IconeEscudo /> Área Restrita
          </div>
          <h1>Painel Administrativo</h1>
          <p className="adm-subtitulo">
            Gerenciamento global de usuários, disciplinas, métricas e integração com a API REST.
          </p>
        </div>

        <div className="adm-topo-status">
          <div className="status-item">
            <span className="ponto-status ponto-verde" />
            <span>Sistema Operacional</span>
          </div>
          <small>Logado como: <strong>{adminLogado?.nome}</strong></small>
        </div>
      </div>

      {/* Abas de Navegação do ADM */}
      <div className="adm-abas">
        <button
          type="button"
          className={`adm-aba ${abaAtiva === "metricas" ? "adm-aba-ativa" : ""}`}
          onClick={() => setAbaAtiva("metricas")}
        >
          <IconeGrade /> Visão Geral
        </button>
        <button
          type="button"
          className={`adm-aba ${abaAtiva === "usuarios" ? "adm-aba-ativa" : ""}`}
          onClick={() => setAbaAtiva("usuarios")}
        >
          <IconeUsuarios /> Gestão de Usuários ({usuarios.length})
        </button>
        <button
          type="button"
          className={`adm-aba ${abaAtiva === "materias" ? "adm-aba-ativa" : ""}`}
          onClick={() => setAbaAtiva("materias")}
        >
          <IconeLista /> Matérias ({listaMaterias.length})
        </button>
        <button
          type="button"
          className={`adm-aba ${abaAtiva === "api" ? "adm-aba-ativa" : ""}`}
          onClick={() => setAbaAtiva("api")}
        >
          <IconeNuvem /> Integração API REST
        </button>
      </div>

      {/* ABA 1: MÉTRICAS & VISÃO GERAL */}
      {abaAtiva === "metricas" && (
        <div className="adm-conteudo">
          <div className="grid-cards-metricas">
            <div className="card-metrica">
              <div className="card-metrica-icone">
                <IconeUsuarios />
              </div>
              <div className="card-metrica-info">
                <span className="metrica-numero">{metricas.totalUsuarios}</span>
                <span className="metrica-titulo">Usuários Cadastrados</span>
                <span className="metrica-detalhe">
                  {metricas.totalEstudantes} estudantes · {metricas.totalAdmins} admins
                </span>
              </div>
            </div>

            <div className="card-metrica">
              <div className="card-metrica-icone">
                <IconeLista />
              </div>
              <div className="card-metrica-info">
                <span className="metrica-numero">{metricas.totalAtividades}</span>
                <span className="metrica-titulo">Atividades Totais</span>
                <span className="metrica-detalhe">
                  {metricas.pendentes} pendentes · {metricas.concluidas} concluídas
                </span>
              </div>
            </div>

            <div className="card-metrica">
              <div className="card-metrica-icone">
                <IconeGrade />
              </div>
              <div className="card-metrica-info">
                <span className="metrica-numero">{metricas.totalMaterias}</span>
                <span className="metrica-titulo">Matérias Ativas</span>
                <span className="metrica-detalhe">Disciplinas registradas</span>
              </div>
            </div>

            <div className="card-metrica">
              <div className="card-metrica-icone">
                <IconeCheck />
              </div>
              <div className="card-metrica-info">
                <span className="metrica-numero">{metricas.taxaConclusao}%</span>
                <span className="metrica-titulo">Taxa de Conclusão</span>
                <div className="barra-progresso">
                  <div
                    className="progresso-preenchido"
                    style={{ width: `${metricas.taxaConclusao}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="adm-grid-dois-paineis">
            <div className="painel">
              <h2>Atalhos Rápidos de Gestão</h2>
              <p className="texto-suave">Acesse os módulos administrativos com um clique:</p>
              <div className="atalhos-adm-grid">
                <button
                  type="button"
                  className="botao-atalho-adm"
                  onClick={() => setAbaAtiva("usuarios")}
                >
                  <IconeUsuarios />
                  <div>
                    <strong>Gerenciar Usuários</strong>
                    <span>Controlar acessos e permissões</span>
                  </div>
                </button>
                <button
                  type="button"
                  className="botao-atalho-adm"
                  onClick={() => setAbaAtiva("materias")}
                >
                  <IconeLista />
                  <div>
                    <strong>Cadastrar Matéria</strong>
                    <span>Adicionar novas disciplinas</span>
                  </div>
                </button>
                <button
                  type="button"
                  className="botao-atalho-adm"
                  onClick={() => setAbaAtiva("api")}
                >
                  <IconeNuvem />
                  <div>
                    <strong>Monitorar API</strong>
                    <span>Testar JSONPlaceholder e sincronizar</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="painel">
              <h2>Auditoria de Atividades do ADM</h2>
              <div className="lista-logs">
                {logs.map((log) => (
                  <div key={log.id} className={`log-item log-${log.tipo}`}>
                    <span className="log-hora">{log.hora}</span>
                    <span className="log-acao">{log.acao}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: GESTÃO DE USUÁRIOS */}
      {abaAtiva === "usuarios" && (
        <div className="adm-conteudo">
          <div className="tabela-topo-acoes">
            <div className="acoes-esquerda">
              <input
                type="text"
                className="input-busca-tabela"
                placeholder="Buscar por nome ou e-mail..."
                value={buscaUsuario}
                onChange={(e) => setBuscaUsuario(e.target.value)}
              />
              <select
                className="select-filtro-tabela"
                value={filtroPapel}
                onChange={(e) => setFiltroPapel(e.target.value)}
              >
                <option value="todos">Todos os Papéis</option>
                <option value="admin">Apenas Administradores</option>
                <option value="estudante">Apenas Estudantes</option>
              </select>
            </div>

            <button
              type="button"
              className="botao-primario"
              onClick={() => setModalNovoUsuario(true)}
            >
              <IconeMais /> Novo Usuário
            </button>
          </div>

          <div className="tabela-wrap">
            <table className="tabela-atividades tabela-adm">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Papel</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th style={{ textAlign: "right" }}>Ações do ADM</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => {
                  const ehLogado = u.id === adminLogado.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="usuario-celula">
                          <span className="avatar-adm">{u.nome.charAt(0).toUpperCase()}</span>
                          <div>
                            <strong>{u.nome}</strong>
                            {ehLogado && <span className="voce-tag"> (Você)</span>}
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`badge-papel ${
                            u.papel === "admin" ? "badge-admin" : "badge-estudante"
                          }`}
                        >
                          {u.papel === "admin" ? "Administrador" : "Estudante"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge-status ${
                            u.status === "ativo" ? "status-ativo" : "status-bloqueado"
                          }`}
                        >
                          {u.status === "ativo" ? "Ativo" : "Bloqueado"}
                        </span>
                      </td>
                      <td>{u.criadoEm || "2026-08-01"}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="acoes-botoes-grupo">
                          <button
                            type="button"
                            className="botao-tabela-acao"
                            onClick={() => handleAlternarPapel(u)}
                            disabled={ehLogado}
                            title="Alternar Papel (Admin/Estudante)"
                          >
                            {u.papel === "admin" ? "Rebaixar" : "Tornar ADM"}
                          </button>
                          <button
                            type="button"
                            className={`botao-tabela-acao ${
                              u.status === "ativo" ? "botao-aviso" : "botao-sucesso"
                            }`}
                            onClick={() => handleAlternarStatus(u)}
                            disabled={ehLogado}
                            title="Bloquear ou desbloquear acesso"
                          >
                            {u.status === "ativo" ? "Bloquear" : "Desbloquear"}
                          </button>
                          <button
                            type="button"
                            className="botao-tabela-acao botao-perigo"
                            onClick={() => handleExcluirUsuario(u)}
                            disabled={ehLogado}
                            title="Excluir do sistema"
                          >
                            <IconeLixeira />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: GESTÃO DE MATÉRIAS */}
      {abaAtiva === "materias" && (
        <div className="adm-conteudo">
          <div className="adm-grid-dois-paineis">
            <div className="painel">
              <h2>Cadastrar Nova Disciplina</h2>
              <p className="texto-suave">
                Cadastre novas matérias para que fiquem disponíveis nos formulários de atividades dos alunos.
              </p>
              <form onSubmit={handleAdicionarMateria} className="form-materia-adm">
                <label>
                  Nome da Disciplina
                  <input
                    type="text"
                    placeholder="Ex: Inteligência Artificial, Cálculo I..."
                    value={novaMateria}
                    onChange={(e) => setNovaMateria(e.target.value)}
                  />
                </label>
                <button type="submit" className="botao-primario">
                  <IconeMais /> Adicionar Disciplina
                </button>
              </form>
            </div>

            <div className="painel">
              <h2>Disciplinas Registradas ({listaMaterias.length})</h2>
              {listaMaterias.length === 0 ? (
                <p className="mensagem-vazia">Nenhuma matéria registrada no momento.</p>
              ) : (
                <ul className="lista-disciplinas-adm">
                  {listaMaterias.map((m) => (
                    <li key={m.nome} className="item-disciplina-adm">
                      <div className="disciplina-info">
                        <span className="icone-caderno">📖</span>
                        <strong>{m.nome}</strong>
                      </div>
                      <span className="badge-contagem">
                        {m.totalAtividades} atividade(s)
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: INTEGRAÇÃO API REST */}
      {abaAtiva === "api" && (
        <div className="adm-conteudo">
          <div className="painel">
            <div className="api-card-topo">
              <div className="api-card-icone">
                <IconeNuvem />
              </div>
              <div>
                <h2>Integração com a API REST Externa</h2>
                <p className="texto-suave">
                  Esta aplicação integra-se com a API <code>JSONPlaceholder</code> através da Fetch API
                  para sincronização de tarefas remotas e testes de conectividade.
                </p>
              </div>
            </div>

            <div className="api-detalhes-bloco">
              <div className="api-campo-info">
                <strong>Endpoint Base Configurado:</strong>
                <code>{API_URL}</code>
              </div>
              <div className="api-campo-info">
                <strong>Recurso Consumido:</strong>
                <code>/todos (tarefas acadêmicas simuladas)</code>
              </div>
            </div>

            <div className="api-botoes-acoes">
              <button
                type="button"
                className="botao-primario"
                onClick={handleTestarApi}
                disabled={testandoApi}
              >
                {testandoApi ? "Testando Conexão..." : "Testar Conexão com a API"}
              </button>

              <button
                type="button"
                className="botao-secundario"
                onClick={handleImportarTarefasApi}
                disabled={importandoApi}
              >
                {importandoApi ? "Importando..." : "Importar Atividades de Exemplo da API"}
              </button>
            </div>

            {resultadoApi && (
              <div
                className={`resultado-api-box ${
                  resultadoApi.sucesso ? "resultado-sucesso" : "resultado-erro"
                }`}
              >
                <div className="resultado-status-linha">
                  <span
                    className={`ponto-status ${
                      resultadoApi.sucesso ? "ponto-verde" : "ponto-vermelho"
                    }`}
                  />
                  <strong>Status da Conexão: {resultadoApi.status}</strong>
                  <span className="latencia-badge">{resultadoApi.tempoMs} ms</span>
                </div>

                {resultadoApi.sucesso ? (
                  <div>
                    <p style={{ marginTop: "0.5rem", fontSize: "14px" }}>
                      A API externa respondeu com sucesso! Abaixo está a amostra do payload recebido:
                    </p>
                    <pre className="codigo-json">
                      {JSON.stringify(resultadoApi.exemplo, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="texto-erro">Erro reportado: {resultadoApi.erro}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PARA CRIAR NOVO USUÁRIO */}
      {modalNovoUsuario && (
        <div className="modal-backdrop">
          <div className="modal-caixa">
            <h2>Cadastrar Novo Usuário</h2>
            <p className="texto-suave">
              Adicione um novo estudante ou administrador diretamente pelo painel.
            </p>

            <form onSubmit={handleCriarUsuarioSubmit} className="modal-form">
              <label>
                Nome Completo
                <input
                  type="text"
                  placeholder="Ex: Beatriz Lima"
                  value={formNovoUsuario.nome}
                  onChange={(e) =>
                    setFormNovoUsuario((f) => ({ ...f, nome: e.target.value }))
                  }
                  required
                />
              </label>

              <label>
                E-mail
                <input
                  type="email"
                  placeholder="beatriz@estudos.com"
                  value={formNovoUsuario.email}
                  onChange={(e) =>
                    setFormNovoUsuario((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Senha Provisória
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formNovoUsuario.senha}
                  onChange={(e) =>
                    setFormNovoUsuario((f) => ({ ...f, senha: e.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Papel / Nível de Acesso
                <select
                  value={formNovoUsuario.papel}
                  onChange={(e) =>
                    setFormNovoUsuario((f) => ({ ...f, papel: e.target.value }))
                  }
                >
                  <option value="estudante">Estudante (Acesso Comum)</option>
                  <option value="admin">Administrador (Acesso Total)</option>
                </select>
              </label>

              <div className="modal-acoes">
                <button
                  type="button"
                  className="botao-secundario"
                  onClick={() => setModalNovoUsuario(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="botao-primario">
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
