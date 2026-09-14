import dadosIniciais from "./dados.json";

const CHAVE_STORAGE = "organizador-estudos:atividades";
const CHAVE_STORAGE_MATERIAS = "organizador-estudos:materias";

// Lê do localStorage. Se ainda não existir nada salvo, usa o dados.json

// como ponto de partida e ja grava no localStorage.

export function carregarAtividades() {
    const salvo = localStorage.getItem(CHAVE_STORAGE);

    if (salvo) {
        try {
            return JSON.parse(salvo);
        } catch {
            return dadosIniciais;
        }
    }

    localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(dadosIniciais)
    );

    return dadosIniciais;
}

export function salvarAtividades(atividades) {
    localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(atividades)
    );
}

export function carregarMaterias() {
    const salvo = localStorage.getItem(CHAVE_STORAGE_MATERIAS);

    if (salvo) {
        try {
            return JSON.parse(salvo);
        } catch {
            return [];
        }
    }

    localStorage.setItem(
        CHAVE_STORAGE_MATERIAS,
        JSON.stringify([])
    );

    return [];
}

export function salvarMaterias(materias) {
    localStorage.setItem(
        CHAVE_STORAGE_MATERIAS,
        JSON.stringify(materias)
    );
}