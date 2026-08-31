import dadosIniciais from "./dados.json";

const CHAVE_STORAGE = "organizador-estudos:atividades";

// Lê do localStorage. Se ainda não existir nada salvo, usa o dados.json
// como ponto de partida e ja grava no localStorage.
export function carregarAtividades() {
    const salvo = localStorage.getItem(CHAVE_STORAGE);

    if (salvo) {
        try {
            return JSON.parse(salvo);
        } catch {
            // Se o dado salvo estiver corrompido, volta pro inicial
            return dadosIniciais;
        }
    }

    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dadosIniciais));
    return dadosIniciais;
}

export  function salvarAtividades(atividades) {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(atividades));
}