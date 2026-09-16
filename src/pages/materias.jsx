import { useEffect, useState } from "react";

import { carregarMaterias, salvarMaterias } from "../data/storage";

function Materias() {
    const [materias, setMaterias] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nomeMateria, setNomeMateria] = useState("");
    const [corSelecionada, setCorSelecionada] = useState("#9b5cff");
    const [materiaEditando, setMateriaEditando] = useState(null);

    useEffect(() => {
        setMaterias(carregarMaterias());
    }, []);

    function adicionarMateria() {
        alert("Nome digitado: " + nomeMateria);

        if (!nomeMateria.trim()) {
        return;
    }
        const nomeNormalizado = nomeMateria.trim();
       
        const jaExiste = materias.some(
            (materia) =>
                materia.nome.toLowerCase() === nomeNormalizado.toLowerCase()
        );

        if (jaExiste) {
            alert("Essa matéria já está cadastrada.");
            return;
        }

        const novaMateria = {
            id: Date.now(),
            nome: nomeNormalizado,
            cor: corSelecionada || null,
        };

        const novasMaterias = [...materias, novaMateria];

        setMaterias(novasMaterias);
        salvarMaterias(novasMaterias);

        setNomeMateria("");
        setCorSelecionada("#9b5cff");
        setMostrarFormulario(false);
    }

//vai salvar a materia editada
    function editarMateria(id) {
    const materia = materias.find(
        (materia) => materia.id === id
    );

    if (!materia) {
        return;
    }

    setMateriaEditando(materia);
}

function salvarEdicaoMateria() {
    if (!materiaEditando.nome.trim()) {
        return;
    }

    const nomeNormalizado = materiaEditando.nome.trim();

    const jaExiste = materias.some(
        (materia) =>
            materia.id !== materiaEditando.id &&
            materia.nome.toLowerCase() === nomeNormalizado.toLowerCase()
    );

    if (jaExiste) {
        alert("Essa matéria já está cadastrada.");
        return;
    }

    const materiasAtualizadas = materias.map(
        (materia) =>
            materia.id === materiaEditando.id
                ? {
                    ...materiaEditando,
                    nome: nomeNormalizado,
                }
                : materia
    );

    setMaterias(materiasAtualizadas);
    salvarMaterias(materiasAtualizadas);

    setMateriaEditando(null);
}

//vai excluir a materia selecionada
    function excluirMateria(id) { 
    const confirmar = window.confirm(
        "Tem certeza que deseja excluir esta matéria?"
    );

    if (!confirmar) {
        return;
    }

    const materiasAtualizadas = materias.filter(
        (materia) => materia.id !== id
    );

    setMaterias(materiasAtualizadas);
    salvarMaterias(materiasAtualizadas);
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
                <p>Nenhuma matéria cadastrada.</p>
            ) : (
                <ul className="lista-materias">
                    {materias.map((materia) => (
                        <li
                            className="item-materia"
                            key={materia.id}
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
                    ))}
                </ul>
            )}
        </main>
    );
}

export default Materias;