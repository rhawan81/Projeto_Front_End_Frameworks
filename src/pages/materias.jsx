import { useEffect, useState } from "react";
import { carregarMaterias, salvarMaterias } from "../data/storage";

function Materias() {
    const [materias, setMaterias] = useState([]);

    useEffect(() => {
        setMaterias(carregarMaterias());
    }, []);

    function adicionarMateria() {
        const nome = prompt("Digite o nome da matéria:");

        if (!nome || !nome.trim()) {
            return;
        }

        const nomeNormalizado = nome.trim();

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
        };

        const novasMaterias = [...materias, novaMateria];

        setMaterias(novasMaterias);
        salvarMaterias(novasMaterias);
    }

    return (
        <main>
            <h1>Matérias</h1>

            <button onClick={adicionarMateria}>
                + Nova matéria
            </button>

            {materias.length === 0 ? (
                <p>Nenhuma matéria cadastrada.</p>
            ) : (
                <ul>
                    {materias.map((materia) => (
                        <li key={materia.id}>
                            {materia.nome}
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

export default Materias;