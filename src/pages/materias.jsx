
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    salvarMaterias,
    salvarAtividades,
    CORES_MATERIAS_PADRAO
} from "../data/storage";
import { useToast } from "../toast/ToastContext";
import {
    IconeMais,
    IconeLapis,
    IconeLixeira,
    IconeBusca,
    IconeAlerta
} from "../icons";
import {
    buscarMaterias,
    criarMateria,
    atualizarMateria,
    excluirMateriaApi,
} from "../services/materiasService";
import {
    buscarAtividades,
    atualizarStatusAtividadeApi,
} from "../services/atividadesService";
import EstadoRequisicao from "../components/EstadoRequisicao";

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

function Materias() {
    const { mostrarToast } = useToast();

    // Matérias e atividades
    const [materias, setMaterias] = useState([]);
    const [atividades, setAtividades] = useState([]);

    // Estados da requisição
    const [carregando, setCarregando] = useState(true);
    const [origem, setOrigem] = useState("api");
    const [erro, setErro] = useState(null);

    // Filtros e busca
    const [busca, setBusca] = useState("");
    const [filtroStatusGlobal, setFiltroStatusGlobal] = useState("todas");

    // Controle de expansão de atividades por matéria
    const [materiasExpandidas, setMateriasExpandidas] = useState({});

    // Filtro de atividades por matéria
    const [filtroAtividadePorMateria, setFiltroAtividadePorMateria] = useState({});

    // Formulários de cadastro e edição
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nomeMateria, setNomeMateria] = useState("");
    const [corSelecionada, setCorSelecionada] = useState(CORES_MATERIAS_PADRAO[0]);
    const [materiaEditando, setMateriaEditando] = useState(null);

    // Carrega matérias e atividades pela API
    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro(null);

        try {
            const [resultadoMaterias, resultadoAtividades] =
                await Promise.all([
                    buscarMaterias(),
                    buscarAtividades(),
                ]);

            if (
                !Array.isArray(resultadoMaterias.dados) ||
                !Array.isArray(resultadoAtividades.dados)
            ) {
                throw new Error("A API retornou dados em um formato inválido.");
            }

            const materiasFormatadas = resultadoMaterias.dados.map(
                (materia, index) => ({
                    ...materia,
                    cor:
                        materia.cor ||
                        CORES_MATERIAS_PADRAO[
                            index % CORES_MATERIAS_PADRAO.length
                        ],
                })
            );

            const atividadesFormatadas = resultadoAtividades.dados.map(
                (atividade) => ({
                    ...atividade,
                    status: String(
                        atividade.status || "pendente"
                    ).toLowerCase(),
                    prioridade: String(
                        atividade.prioridade || "baixa"
                    ).toLowerCase(),
                })
            );

            setMaterias(materiasFormatadas);
            setAtividades(atividadesFormatadas);

            const usouContingencia =
                resultadoMaterias.origem === "contingencia" ||
                resultadoAtividades.origem === "contingencia";

            setOrigem(
                usouContingencia ? "contingencia" : "api"
            );

            setErro(
                resultadoMaterias.erro ||
                resultadoAtividades.erro ||
                null
            );
        } catch (erroCarregamento) {
            console.error(
                "Erro ao carregar matérias:",
                erroCarregamento
            );

            setErro(erroCarregamento.message);
            setOrigem("api");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // Alterna a expansão do painel de atividades da matéria
    function alternarExpansao(materiaId) {
        setMateriasExpandidas((prev) => ({
            ...prev,
            [materiaId]: !prev[materiaId],
        }));
    }

    // Define o filtro interno da matéria
    function definirFiltroInterno(materiaId, filtro) {
        setFiltroAtividadePorMateria((prev) => ({
            ...prev,
            [materiaId]: filtro,
        }));
    }

    // Alterna o status de uma atividade via serviço da API (com fallback local)
    async function handleToggleStatus(atividadeId) {
        const atividade = atividades.find(
            (a) => a.id === atividadeId
        );

        if (!atividade) return;

        const novoStatus =
            atividade.status === "concluida"
                ? "pendente"
                : "concluida";

        try {
            await atualizarStatusAtividadeApi(atividadeId, novoStatus);

            const atualizadas = atividades.map((a) =>
                a.id === atividadeId
                    ? { ...a, status: novoStatus }
                    : a
            );

            setAtividades(atualizadas);
            salvarAtividades(atualizadas);

            mostrarToast(
                novoStatus === "concluida"
                    ? `Atividade "${atividade.titulo}" marcada como concluída!`
                    : `Atividade "${atividade.titulo}" reaberta como pendente.`,
                novoStatus === "concluida" ? "sucesso" : "info"
            );
        } catch (erroAcao) {
            mostrarToast(
                erroAcao.message || "Não foi possível atualizar a atividade.",
                "erro"
            );
        }
    }

    // Cadastrar nova matéria via serviço da API (com fallback local)
    async function adicionarMateria(e) {
        if (e && e.preventDefault) e.preventDefault();

        const nomeNormalizado = nomeMateria.trim();

        if (!nomeNormalizado) {
            mostrarToast("Informe o nome da matéria.", "erro");
            return;
        }

        const jaExiste = materias.some(
            (m) =>
                m.nome.toLowerCase() === nomeNormalizado.toLowerCase()
        );

        if (jaExiste) {
            mostrarToast("Essa matéria já está cadastrada.", "aviso");
            return;
        }

        const corFinal =
            corSelecionada ||
            CORES_MATERIAS_PADRAO[
                materias.length % CORES_MATERIAS_PADRAO.length
            ];

        try {
            const novaMateria = await criarMateria({
                nome: nomeNormalizado,
                cor: corFinal,
            });

            const novasMaterias = [...materias, novaMateria];
            setMaterias(novasMaterias);
            salvarMaterias(novasMaterias);

            mostrarToast(
                `Matéria "${nomeNormalizado}" cadastrada com sucesso!`,
                "sucesso"
            );

            setNomeMateria("");
            setCorSelecionada(
                CORES_MATERIAS_PADRAO[
                    novasMaterias.length % CORES_MATERIAS_PADRAO.length
                ]
            );
            setMostrarFormulario(false);
        } catch (erroAcao) {
            mostrarToast(
                erroAcao.message || "Não foi possível cadastrar a matéria.",
                "erro"
            );
        }
    }

    // Iniciar edição de matéria
    function editarMateria(id) {
        const materia = materias.find((m) => m.id === id);

        if (!materia) return;

        setMateriaEditando({ ...materia });
    }

    // Salvar edição da matéria via serviço da API (com fallback local)
    async function salvarEdicaoMateria(e) {
        if (e && e.preventDefault) e.preventDefault();

        if (!materiaEditando || !materiaEditando.nome.trim()) {
            mostrarToast("Informe o nome da matéria.", "erro");
            return;
        }

        const nomeNormalizado = materiaEditando.nome.trim();

        const materiaAntiga = materias.find(
            (m) => m.id === materiaEditando.id
        );

        const jaExiste = materias.some(
            (m) =>
                m.id !== materiaEditando.id &&
                m.nome.toLowerCase() === nomeNormalizado.toLowerCase()
        );

        if (jaExiste) {
            mostrarToast(
                "Já existe outra matéria cadastrada com esse nome.",
                "aviso"
            );
            return;
        }

        try {
            const atualizada = await atualizarMateria(materiaEditando.id, {
                nome: nomeNormalizado,
                cor: materiaEditando.cor,
            });

            const materiasAtualizadas = materias.map((m) =>
                m.id === materiaEditando.id
                    ? atualizada || { ...materiaEditando, nome: nomeNormalizado }
                    : m
            );

            setMaterias(materiasAtualizadas);
            salvarMaterias(materiasAtualizadas);

            // Atualiza também as atividades vinculadas se o nome mudou
            if (
                materiaAntiga &&
                materiaAntiga.nome !== nomeNormalizado
            ) {
                const atividadesAtualizadas = atividades.map((a) =>
                    a.materia?.toLowerCase() ===
                    materiaAntiga.nome.toLowerCase()
                        ? { ...a, materia: nomeNormalizado }
                        : a
                );

                setAtividades(atividadesAtualizadas);
                salvarAtividades(atividadesAtualizadas);
            }

            mostrarToast("Matéria atualizada com sucesso!", "sucesso");
            setMateriaEditando(null);
        } catch (erroAcao) {
            mostrarToast(
                erroAcao.message || "Não foi possível atualizar a matéria.",
                "erro"
            );
        }
    }

    // Excluir matéria com confirmação via serviço da API (com fallback local)
    async function excluirMateria(id) {
        const materia = materias.find((m) => m.id === id);

        if (!materia) return;

        const atividadesVinculadas = atividades.filter(
            (a) =>
                a.materia?.toLowerCase() === materia.nome.toLowerCase()
        );

        let mensagemConfirm =
            `Tem certeza que deseja excluir a matéria "${materia.nome}"?`;

        if (atividadesVinculadas.length > 0) {
            mensagemConfirm =
                `A matéria "${materia.nome}" possui ${atividadesVinculadas.length} atividade(s) vinculada(s). Excluir a matéria manterá as atividades sem a matéria associada. Deseja continuar?`;
        }

        const confirmar = window.confirm(mensagemConfirm);

        if (!confirmar) return;

        try {
            await excluirMateriaApi(id);

            const materiasAtualizadas = materias.filter(
                (m) => m.id !== id
            );

            setMaterias(materiasAtualizadas);
            salvarMaterias(materiasAtualizadas);

            mostrarToast(
                `Matéria "${materia.nome}" removida.`,
                "aviso"
            );
        } catch (erroAcao) {
            mostrarToast(
                erroAcao.message || "Não foi possível excluir a matéria.",
                "erro"
            );
        }
    }

    // Resumo de cada matéria
    function obterResumoMateria(nomeMateria) {
        const nomeNormalizado = (nomeMateria || "")
            .trim()
            .toLowerCase();

        const atividadesDaMateria = atividades.filter(
            (atividade) =>
                atividade.materia?.trim().toLowerCase() ===
                nomeNormalizado
        );

        const total = atividadesDaMateria.length;

        const pendentes = atividadesDaMateria.filter(
            (a) => a.status === "pendente"
        ).length;

        const concluidas = atividadesDaMateria.filter(
            (a) => a.status === "concluida"
        ).length;

        const alta = atividadesDaMateria.filter(
            (a) => a.prioridade === "alta"
        ).length;

        const media = atividadesDaMateria.filter(
            (a) => a.prioridade === "media"
        ).length;

        const baixa = atividadesDaMateria.filter(
            (a) => a.prioridade === "baixa"
        ).length;

        const altaPendentes = atividadesDaMateria.filter(
            (a) =>
                a.prioridade === "alta" &&
                a.status === "pendente"
        ).length;

        const progresso =
            total > 0
                ? Math.round((concluidas / total) * 100)
                : 0;

        return {
            total,
            pendentes,
            concluidas,
            alta,
            media,
            baixa,
            altaPendentes,
            progresso,
            atividades: atividadesDaMateria,
        };
    }

    // Métricas gerais do topo da página
    const metricasGlobais = useMemo(() => {
        const totalMaterias = materias.length;
        const totalAtividades = atividades.length;

        const pendentes = atividades.filter(
            (a) => a.status === "pendente"
        ).length;

        const concluidas = atividades.filter(
            (a) => a.status === "concluida"
        ).length;

        const altaPendentes = atividades.filter(
            (a) =>
                a.prioridade === "alta" &&
                a.status === "pendente"
        ).length;

        return {
            totalMaterias,
            totalAtividades,
            pendentes,
            concluidas,
            altaPendentes,
        };
    }, [materias, atividades]);

    // Filtragem das matérias exibidas
    const materiasFiltradas = useMemo(() => {
        return materias.filter((m) => {
            const bateBusca = m.nome
                .toLowerCase()
                .includes(busca.toLowerCase());

            if (!bateBusca) return false;

            const resumo = obterResumoMateria(m.nome);

            if (filtroStatusGlobal === "pendentes") {
                return resumo.pendentes > 0;
            }

            if (filtroStatusGlobal === "concluidas") {
                return (
                    resumo.total > 0 &&
                    resumo.pendentes === 0
                );
            }

            return true;
        });
    }, [materias, busca, filtroStatusGlobal, atividades]);

    return (
        <EstadoRequisicao
            carregando={carregando}
            erro={erro}
            origem={origem}
            vazio={false}
            onTentarNovamente={carregarDados}
        >
            <section className="pagina-materias">

                {/* Cabeçalho da página */}
                <div className="materias-topo">
                    <div>
                        <h1>Matérias & Disciplinas</h1>

                        <p className="texto-suave">
                            Acompanhe o fluxo de estudos de cada disciplina com suas atividades, prazos, prioridades e situação.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="botao-primario"
                        onClick={() => setMostrarFormulario((v) => !v)}
                    >
                        <IconeMais />
                        {mostrarFormulario
                            ? "Fechar formulário"
                            : "Nova matéria"}
                    </button>
                </div>

                {/* Cartões de Métricas Globais */}
                <div className="cartoes-resumo materias-metricas-grid">
                    <div className="cartao-resumo">
                        <span className="numero">
                            {metricasGlobais.totalMaterias}
                        </span>
                        <span className="rotulo">Matérias Ativas</span>
                    </div>

                    <div className="cartao-resumo">
                        <span className="numero">
                            {metricasGlobais.totalAtividades}
                        </span>
                        <span className="rotulo">Total de Atividades</span>
                    </div>

                    <div className="cartao-resumo">
                        <span
                            className="numero"
                            style={{ color: "var(--media)" }}
                        >
                            {metricasGlobais.pendentes}
                        </span>
                        <span className="rotulo">Pendentes</span>
                    </div>

                    <div className="cartao-resumo">
                        <span
                            className="numero"
                            style={{ color: "var(--baixa)" }}
                        >
                            {metricasGlobais.concluidas}
                        </span>
                        <span className="rotulo">Concluídas</span>
                    </div>

                    {metricasGlobais.altaPendentes > 0 && (
                        <div className="cartao-resumo cartao-destaque-alerta">
                            <span
                                className="numero"
                                style={{ color: "var(--alta)" }}
                            >
                                {metricasGlobais.altaPendentes}
                            </span>
                            <span className="rotulo">
                                Alta Prioridade Pendente!
                            </span>
                        </div>
                    )}
                </div>

                {/* Barra de Filtros e Busca */}
                <div className="materias-barra-controles">
                    <div className="campo-busca">
                        <IconeBusca />

                        <input
                            type="text"
                            placeholder="Buscar matéria pelo nome..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>

                    {/* Abas de Filtro */}
                    <div className="abas materias-abas-filtro">
                        {[
                            {
                                chave: "todas",
                                rotulo: "Todas as Matérias"
                            },
                            {
                                chave: "pendentes",
                                rotulo: "Com Pendências"
                            },
                            {
                                chave: "concluidas",
                                rotulo: "100% Concluídas"
                            },
                        ].map(({ chave, rotulo }) => (
                            <button
                                key={chave}
                                type="button"
                                className={
                                    filtroStatusGlobal === chave
                                        ? "aba aba-ativa"
                                        : "aba"
                                }
                                onClick={() =>
                                    setFiltroStatusGlobal(chave)
                                }
                            >
                                {rotulo}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Formulário de Cadastro */}
                {mostrarFormulario && (
                    <form
                        className="formulario-materia-card"
                        onSubmit={adicionarMateria}
                    >
                        <h3>Cadastrar Nova Matéria</h3>

                        <p className="texto-suave">
                            Adicione a matéria para organizar trabalhos, provas e ciclos de estudo vinculados.
                        </p>

                        <div className="formulario-materia-linha">
                            <input
                                type="text"
                                placeholder="Nome da matéria (ex: Cálculo I, Inteligência Artificial)"
                                value={nomeMateria}
                                onChange={(e) =>
                                    setNomeMateria(e.target.value)
                                }
                                autoFocus
                            />

                            <div className="seletor-cor-materia">
                                <span>Cor da etiqueta:</span>

                                <div className="paleta-cores">
                                    {CORES_MATERIAS_PADRAO.map((cor) => (
                                        <button
                                            type="button"
                                            key={cor}
                                            className={`botao-cor ${
                                                corSelecionada === cor
                                                    ? "cor-ativa"
                                                    : ""
                                            }`}
                                            style={{
                                                backgroundColor: cor
                                            }}
                                            onClick={() =>
                                                setCorSelecionada(cor)
                                            }
                                            aria-label={`Cor ${cor}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="formulario-materia-botoes">
                                <button
                                    type="button"
                                    className="botao-secundario"
                                    onClick={() =>
                                        setMostrarFormulario(false)
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="botao-primario"
                                >
                                    Salvar matéria
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Formulário de Edição */}
                {materiaEditando && (
                    <form
                        className="formulario-materia-card editando"
                        onSubmit={salvarEdicaoMateria}
                    >
                        <h3>Editar Matéria</h3>

                        <div className="formulario-materia-linha">
                            <input
                                type="text"
                                placeholder="Nome da matéria"
                                value={materiaEditando.nome}
                                onChange={(e) =>
                                    setMateriaEditando({
                                        ...materiaEditando,
                                        nome: e.target.value,
                                    })
                                }
                            />

                            <div className="seletor-cor-materia">
                                <span>Cor:</span>

                                <div className="paleta-cores">
                                    {CORES_MATERIAS_PADRAO.map((cor) => (
                                        <button
                                            type="button"
                                            key={cor}
                                            className={`botao-cor ${
                                                materiaEditando.cor === cor
                                                    ? "cor-ativa"
                                                    : ""
                                            }`}
                                            style={{
                                                backgroundColor: cor
                                            }}
                                            onClick={() =>
                                                setMateriaEditando({
                                                    ...materiaEditando,
                                                    cor,
                                                })
                                            }
                                            aria-label={`Cor ${cor}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="formulario-materia-botoes">
                                <button
                                    type="button"
                                    className="botao-secundario"
                                    onClick={() =>
                                        setMateriaEditando(null)
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="botao-primario"
                                >
                                    Salvar alterações
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Listagem de Matérias */}
                {materiasFiltradas.length === 0 ? (
                    <div className="lista-vazia">
                        <p>
                            {busca || filtroStatusGlobal !== "todas"
                                ? "Nenhuma matéria encontrada com os filtros selecionados."
                                : "Nenhuma matéria cadastrada. Cadastre sua primeira matéria ou crie uma atividade para começar!"}
                        </p>

                        <button
                            type="button"
                            className="botao-primario"
                            style={{ marginTop: "12px" }}
                            onClick={() => {
                                setBusca("");
                                setFiltroStatusGlobal("todas");
                                setMostrarFormulario(true);
                            }}
                        >
                            <IconeMais /> Cadastrar matéria
                        </button>
                    </div>
                ) : (
                    <div className="materias-cards-grid">
                        {materiasFiltradas.map((materia) => {
                            const resumo = obterResumoMateria(materia.nome);

                            const expandida = Boolean(
                                materiasExpandidas[materia.id]
                            );

                            const filtroInterno =
                                filtroAtividadePorMateria[materia.id] ||
                                "todas";

                            // Filtra atividades da matéria expandida
                            const atividadesExibidas =
                                resumo.atividades.filter((a) => {
                                    if (filtroInterno === "pendente") {
                                        return a.status === "pendente";
                                    }

                                    if (filtroInterno === "concluida") {
                                        return a.status === "concluida";
                                    }

                                    if (filtroInterno === "alta") {
                                        return a.prioridade === "alta";
                                    }

                                    return true;
                                });

                            return (
                                <article
                                    className="card-materia"
                                    key={materia.id}
                                >
                                    {/* Cabeçalho do Card */}
                                    <div className="card-materia-cabecalho">
                                        <div className="card-materia-identificacao">
                                            <span
                                                className="etiqueta-materia"
                                                style={{
                                                    backgroundColor:
                                                        materia.cor || "#8B5CF6",
                                                }}
                                            >
                                                {materia.nome}
                                            </span>

                                            {resumo.altaPendentes > 0 && (
                                                <span
                                                    className="badge-alerta-prioridade"
                                                    title="Atividade de alta prioridade pendente!"
                                                >
                                                    <IconeAlerta />
                                                    {resumo.altaPendentes} Alta(s) Pendente(s)
                                                </span>
                                            )}
                                        </div>

                                        <div className="card-materia-acoes">
                                            <button
                                                type="button"
                                                className="botao-acao-materia"
                                                onClick={() =>
                                                    editarMateria(materia.id)
                                                }
                                                title="Editar matéria"
                                            >
                                                <IconeLapis /> Editar
                                            </button>

                                            <button
                                                type="button"
                                                className="botao-acao-materia excluir"
                                                onClick={() =>
                                                    excluirMateria(materia.id)
                                                }
                                                title="Excluir matéria"
                                            >
                                                <IconeLixeira /> Excluir
                                            </button>
                                        </div>
                                    </div>

                                    {/* Barra de Progresso */}
                                    <div className="card-materia-progresso-secao">
                                        <div className="progresso-topo">
                                            <span className="progresso-rotulo">
                                                Progresso dos Estudos
                                            </span>

                                            <span className="progresso-porcentagem">
                                                {resumo.progresso}% concluído
                                            </span>
                                        </div>

                                        <div className="progresso-trilha">
                                            <div
                                                className="progresso-preenchimento"
                                                style={{
                                                    width: `${resumo.progresso}%`,
                                                    backgroundColor:
                                                        materia.cor ||
                                                        "var(--primario)",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Resumo de Atividades */}
                                    <div className="card-materia-resumo-estudos">
                                        <div className="resumo-bloco">
                                            <span className="resumo-valor">
                                                {resumo.total}
                                            </span>
                                            <span className="resumo-legenda">
                                                Total
                                            </span>
                                        </div>

                                        <div className="resumo-bloco">
                                            <span className="resumo-valor pendente">
                                                {resumo.pendentes}
                                            </span>
                                            <span className="resumo-legenda">
                                                Pendentes
                                            </span>
                                        </div>

                                        <div className="resumo-bloco">
                                            <span className="resumo-valor concluida">
                                                {resumo.concluidas}
                                            </span>
                                            <span className="resumo-legenda">
                                                Concluídas
                                            </span>
                                        </div>

                                        {/* Indicadores de Prioridade */}
                                        <div className="resumo-prioridades-tags">
                                            <span
                                                className="tag-prioridade selo-alta"
                                                title="Atividades de Alta Prioridade"
                                            >
                                                Alta: <b>{resumo.alta}</b>
                                            </span>

                                            <span
                                                className="tag-prioridade selo-media"
                                                title="Atividades de Média Prioridade"
                                            >
                                                Média: <b>{resumo.media}</b>
                                            </span>

                                            <span
                                                className="tag-prioridade selo-baixa"
                                                title="Atividades de Baixa Prioridade"
                                            >
                                                Baixa: <b>{resumo.baixa}</b>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expandir / Recolher Atividades */}
                                    <div className="card-materia-botoes-expansao">
                                        <button
                                            type="button"
                                            className="botao-alternar-atividades"
                                            onClick={() =>
                                                alternarExpansao(materia.id)
                                            }
                                        >
                                            <span>
                                                {expandida
                                                    ? "▲ Ocultar atividades"
                                                    : `▼ Ver atividades da matéria (${resumo.total})`}
                                            </span>
                                        </button>

                                        <Link
                                            to={`/atividades?materia=${encodeURIComponent(
                                                materia.nome
                                            )}`}
                                            className="link-painel-atividades"
                                        >
                                            Filtrar em Atividades →
                                        </Link>
                                    </div>

                                    {/* Painel de Atividades */}
                                    {expandida && (
                                        <div className="card-materia-atividades-painel">
                                            {/* Filtros Internos */}
                                            <div className="materia-abas-internas">
                                                {[
                                                    {
                                                        chave: "todas",
                                                        rotulo: `Todas (${resumo.total})`,
                                                    },
                                                    {
                                                        chave: "pendente",
                                                        rotulo: `Pendentes (${resumo.pendentes})`,
                                                    },
                                                    {
                                                        chave: "concluida",
                                                        rotulo: `Concluídas (${resumo.concluidas})`,
                                                    },
                                                    {
                                                        chave: "alta",
                                                        rotulo: `Alta Prioridade (${resumo.alta})`,
                                                    },
                                                ].map(({ chave, rotulo }) => (
                                                    <button
                                                        key={chave}
                                                        type="button"
                                                        className={
                                                            filtroInterno === chave
                                                                ? "aba-interna ativa"
                                                                : "aba-interna"
                                                        }
                                                        onClick={() =>
                                                            definirFiltroInterno(
                                                                materia.id,
                                                                chave
                                                            )
                                                        }
                                                    >
                                                        {rotulo}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Lista de Atividades */}
                                            {atividadesExibidas.length === 0 ? (
                                                <div className="materia-atividades-vazia">
                                                    <p>
                                                        Nenhuma atividade encontrada para este filtro na matéria "{materia.nome}".
                                                    </p>

                                                    <Link
                                                        to={`/atividades/nova?materia=${encodeURIComponent(
                                                            materia.nome
                                                        )}`}
                                                        className="botao-secundario-pequeno"
                                                    >
                                                        <IconeMais />
                                                        Criar atividade para {materia.nome}
                                                    </Link>
                                                </div>
                                            ) : (
                                                <ul className="lista-atividades-materia">
                                                    {atividadesExibidas.map((a) => (
                                                        <li
                                                            key={a.id}
                                                            className={`item-atividade-materia ${
                                                                a.status === "concluida"
                                                                    ? "concluida"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {/* Situação */}
                                                            <button
                                                                type="button"
                                                                className={`situacao-toggle ${a.status}`}
                                                                onClick={() =>
                                                                    handleToggleStatus(a.id)
                                                                }
                                                                title={
                                                                    a.status === "concluida"
                                                                        ? "Clique para reabrir atividade"
                                                                        : "Clique para concluir atividade"
                                                                }
                                                            >
                                                                <span className="bolinha" />

                                                                {a.status === "concluida"
                                                                    ? "Concluído"
                                                                    : "Pendente"}
                                                            </button>

                                                            {/* Informações */}
                                                            <div className="atividade-materia-info">
                                                                <strong
                                                                    className={
                                                                        a.status === "concluida"
                                                                            ? "titulo-concluido"
                                                                            : ""
                                                                    }
                                                                >
                                                                    {a.titulo}
                                                                </strong>

                                                                <span className="atividade-materia-prazo">
                                                                    Prazo: {formatarData(a.prazo)}
                                                                </span>
                                                            </div>

                                                            {/* Prioridade */}
                                                            <span
                                                                className={`selo selo-${a.prioridade}`}
                                                            >
                                                                {rotulosPrioridade[a.prioridade] ||
                                                                    a.prioridade}
                                                            </span>

                                                            {/* Editar */}
                                                            <Link
                                                                to={`/atividades/${a.id}/editar`}
                                                                className="botao-editar-atividade-materia"
                                                                title="Editar detalhes desta atividade"
                                                            >
                                                                <IconeLapis />
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {/* Adicionar Atividade */}
                                            <div className="materia-atividades-rodape">
                                                <Link
                                                    to={`/atividades/nova?materia=${encodeURIComponent(
                                                        materia.nome
                                                    )}`}
                                                    className="botao-nova-atividade-materia"
                                                >
                                                    <IconeMais />
                                                    Adicionar atividade em {materia.nome}
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </EstadoRequisicao>
    );
}

export default Materias;