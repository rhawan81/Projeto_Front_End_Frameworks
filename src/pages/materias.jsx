import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    carregarMaterias,
    salvarMaterias,
    carregarAtividades
} from "../data/storage";

function Materias() {
    // Lista de matérias cadastradas.
    // O useState permite atualizar a lista e refletir a mudança na tela.
    const [materias, setMaterias] = useState([]);
    // Mensagem exibida para informar o resultado de uma ação.
    const [mensagem, setMensagem] = useState("");
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nomeMateria, setNomeMateria] = useState("");
    const [corSelecionada, setCorSelecionada] = useState("#9b5cff");
    const [materiaEditando, setMateriaEditando] = useState(null);

    // MYLENA - Atividades usadas no resumo das matérias.
    const [atividades, setAtividades] = useState([]);

    useEffect(() => {
        setMaterias(carregarMaterias());

        // MYLENA - Carrega as atividades salvas.
        setAtividades(carregarAtividades());
    }, []);

    // Função responsável por cadastrar uma nova matéria.
    function adicionarMateria() {
        alert("Nome digitado: " + nomeMateria);

        // Impede o cadastro quando o nome estiver vazio.
        if (!nomeMateria.trim()) {
            return;
        }
        // Remove espaços desnecessários antes e depois do nome.    
        const nomeNormalizado = nomeMateria.trim();

        // Verifica se já existe uma matéria com o mesmo nome.       
        const jaExiste = materias.some(
            (materia) =>
                materia.nome.toLowerCase() === nomeNormalizado.toLowerCase()
        );
        // Impede o cadastro de matérias duplicadas.
        if (jaExiste) {
            alert("Essa matéria já está cadastrada.");
            return;
        }
        // Cria o objeto da nova matéria.
        const novaMateria = {
            id: Date.now(),
            nome: nomeNormalizado,
            cor: corSelecionada || null,
        };
        // Cria uma nova lista contendo as matérias antigas e a nova.
        const novasMaterias = [...materias, novaMateria];
        // Atualiza o estado do React.
        setMaterias(novasMaterias);
        // Salva a nova lista no localStorage para manter os dados após atualizar a página.        
        salvarMaterias(novasMaterias);
        // Exibe uma mensagem de sucesso.        
        setMensagem("Matéria cadastrada com sucesso!");
        // Limpa os campos do formulário.
        setNomeMateria("");
        setCorSelecionada("#9b5cff");
        // Fecha o formulário depois do cadastro.        
        setMostrarFormulario(false);
    }

    // Localiza a matéria que será editada pelo ID.
    function editarMateria(id) {
        // Procura na lista a matéria que possui o ID informado.    
        const materia = materias.find(
            (materia) => materia.id === id
        );
        // Se a matéria não for encontrada, encerra a função.
        if (!materia) {
            return;
        }
        // Coloca a matéria encontrada no estado de edição.
        setMateriaEditando(materia);
    }

    // Salva as alterações feitas em uma matéria.
    function salvarEdicaoMateria() {
        // Impede o salvamento se o nome estiver vazio.    
        if (!materiaEditando.nome.trim()) {
            return;
        }
        // Remove espaços desnecessários do início e do final do nome.
        const nomeNormalizado = materiaEditando.nome.trim();
        // Verifica se já existe outra matéria com o mesmo nome.
        const jaExiste = materias.some(
            (materia) =>
                materia.id !== materiaEditando.id &&
                materia.nome.toLowerCase() === nomeNormalizado.toLowerCase()
        );
        // Impede que uma matéria seja editada para um nome já cadastrado.
        if (jaExiste) {
            alert("Essa matéria já está cadastrada.");
            return;
        }
        // Cria uma nova lista atualizando somente a matéria editada.
        const materiasAtualizadas = materias.map(
            (materia) =>
                materia.id === materiaEditando.id
                    ? {
                        ...materiaEditando,
                        nome: nomeNormalizado,
                    }
                    : materia
        );
        // Atualiza a lista de matérias no estado do React.
        setMaterias(materiasAtualizadas);
        // Salva a lista atualizada no localStorage.    
        salvarMaterias(materiasAtualizadas);
        // Encerra o modo de edição.
        setMateriaEditando(null);
    }

    //vai excluir a materia selecionada
    function excluirMateria(id) {
        // Pergunta ao usuário se ele realmente deseja excluir a matéria.        
        const confirmar = window.confirm(
            "Tem certeza que deseja excluir esta matéria?"
        );
        // Cancela a exclusão caso o usuário escolha "Cancelar".
        if (!confirmar) {
            return;
        }
        // Cria uma nova lista sem a matéria selecionada.
        const materiasAtualizadas = materias.filter(
            (materia) => materia.id !== id
        );
        // Atualiza o estado com a lista sem a matéria excluída.
        setMaterias(materiasAtualizadas);
        // Salva a nova lista no localStorage.    
        salvarMaterias(materiasAtualizadas);
    }


    // MYLENA - Calcula o resumo de cada matéria.
    function obterResumoMateria(nomeMateria) {
        const nomeNormalizado = nomeMateria.trim().toLowerCase();

        // MYLENA - Filtra atividades da matéria.
        const atividadesDaMateria = atividades.filter(
            (atividade) =>
                atividade.materia?.trim().toLowerCase() === nomeNormalizado
        );

        // MYLENA - Calcula os totais.
        const total = atividadesDaMateria.length;

        const pendentes = atividadesDaMateria.filter(
            (atividade) => atividade.status === "pendente"
        ).length;

        const concluidas = atividadesDaMateria.filter(
            (atividade) => atividade.status === "concluida"
        ).length;

        return {
            total,
            pendentes,
            concluidas,
        };
    }


    return (
        <main className="pagina-materias">
            <h1>Matérias</h1>

            <button
                className="botao-nova-materia"
                onClick={() => setMostrarFormulario(true)}
            >
                + Nova matéria
            </button>

            {mensagem && (
                <p className="mensagem-sucesso">
                    {mensagem}
                </p>
            )}

            {mostrarFormulario && (
                <div className="formulario-materia">
                    <input
                        type="text"
                        placeholder="Nome da matéria"
                        value={nomeMateria}
                        onChange={(e) => setNomeMateria(e.target.value)}
                    />

                    <label>
                        Escolha uma cor para a matéria:
                        <input
                            type="color"
                            value={corSelecionada}
                            onChange={(e) => setCorSelecionada(e.target.value)}
                        />
                    </label>

                    <button onClick={adicionarMateria}>
                        Salvar matéria
                    </button>
                </div>
            )}

            {materiaEditando && (
                <div className="formulario-materia">
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

                    <label>
                        Escolha uma cor para a matéria:
                        <input
                            type="color"
                            value={materiaEditando.cor || "#9b5cff"}
                            onChange={(e) =>
                                setMateriaEditando({
                                    ...materiaEditando,
                                    cor: e.target.value,
                                })
                            }
                        />
                    </label>

                    <button onClick={salvarEdicaoMateria}>
                        Salvar alterações
                    </button>
                </div>
            )}

            {materias.length === 0 ? (
                <p className="lista-vazia">
                    Nenhuma matéria cadastrada. Cadastre sua primeira matéria para começar.
                </p>
            ) : (
                <ul className="lista-materias">

                    {materias.map((materia) => {

                        // MYLENA - Obtém o resumo da matéria.
                        const resumo = obterResumoMateria(materia.nome);

                        return (
                            <li
                                className="item-materia"
                                key={materia.id}
                            >

                                {/* MYLENA - Abre as atividades filtradas pela matéria. */}
                                <Link
                                    to={`/atividades?materia=${encodeURIComponent(
                                        materia.nome
                                    )}`}
                                    className="conteudo-materia"
                                >

                                    <span
                                        className="nome-materia"
                                        style={{
                                            backgroundColor: materia.cor || "transparent",
                                            padding: "4px 10px",
                                            borderRadius: "8px",
                                            opacity: 0.60,
                                        }}
                                    >
                                        {materia.nome}
                                    </span>

                                    {/* MYLENA - Resumo das atividades. */}
                                    <div className="resumo-materia">

                                        <div className="resumo-item">
                                            <strong>
                                                {resumo.total}
                                            </strong>

                                            <span>
                                                Total
                                            </span>
                                        </div>

                                        <div className="resumo-item">
                                            <strong>
                                                {resumo.pendentes}
                                            </strong>

                                            <span>
                                                Pendentes
                                            </span>
                                        </div>

                                        <div className="resumo-item">
                                            <strong>
                                                {resumo.concluidas}
                                            </strong>

                                            <span>
                                                Concluídas
                                            </span>
                                        </div>

                                    </div>

                                    <span className="ver-atividades-materia">
                                        Ver atividades →
                                    </span>

                                </Link>

                                <div className="acoes-materia">
                                    <button
                                        className="botao-editar"
                                        onClick={() => editarMateria(materia.id)}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className="botao-excluir"
                                        onClick={() => excluirMateria(materia.id)}
                                    >
                                        Excluir
                                    </button>
                                </div>

                            </li>
                        );
                    })}

                </ul>
            )}
        </main>
    );
}

export default Materias;