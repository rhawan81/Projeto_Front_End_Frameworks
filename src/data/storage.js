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

export const CORES_MATERIAS_PADRAO = [
    "#8B5CF6", // Roxo
    "#3B82F6", // Azul
    "#10B981", // Verde
    "#F59E0B", // Âmbar
    "#EC4899", // Rosa
    "#06B6D4", // Ciano
    "#6366F1", // Índigo
    "#14B8A6", // Teal
];

export function carregarMaterias() {
    const salvo = localStorage.getItem(CHAVE_STORAGE_MATERIAS);
    let materias = [];

    if (salvo) {
        try {
            materias = JSON.parse(salvo);
        } catch {
            materias = [];
        }
    }

    // Garante que todas as matérias existentes nas atividades estejam refletidas
    const atividades = carregarAtividades();
    const nomesAtividades = [
        ...new Set(atividades.map((a) => a.materia?.trim()).filter(Boolean))
    ];

    let houveMudanca = false;

    nomesAtividades.forEach((nome) => {
        const jaExiste = materias.some(
            (m) => m.nome?.trim().toLowerCase() === nome.toLowerCase()
        );

        if (!jaExiste) {
            const cor = CORES_MATERIAS_PADRAO[materias.length % CORES_MATERIAS_PADRAO.length];
            materias.push({
                id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                nome,
                cor,
            });
            houveMudanca = true;
        }
    });

    if (houveMudanca || !salvo) {
        salvarMaterias(materias);
    }

    return materias;
}

export function salvarMaterias(materias) {
    localStorage.setItem(
        CHAVE_STORAGE_MATERIAS,
        JSON.stringify(materias)
    );
}

/**
 * Garante que uma matéria com determinado nome esteja cadastrada no sistema.
 * Se não estiver, cria com a cor informada (ou cor padrão) e salva.
 */
export function garantirMateriaCadastrada(nome, cor) {
    if (!nome || !nome.trim()) return null;
    const nomeLimpo = nome.trim();
    const materias = carregarMaterias();

    const existente = materias.find(
        (m) => m.nome?.trim().toLowerCase() === nomeLimpo.toLowerCase()
    );

    if (existente) return existente;

    const novaMateria = {
        id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nome: nomeLimpo,
        cor: cor || CORES_MATERIAS_PADRAO[materias.length % CORES_MATERIAS_PADRAO.length],
    };

    const atualizadas = [...materias, novaMateria];
    salvarMaterias(atualizadas);
    return novaMateria;
}

/**
 * Alterna ou atualiza o status de uma atividade diretamente no storage e retorna a lista atualizada.
 */
export function atualizarStatusAtividade(id, novoStatus) {
    const atividades = carregarAtividades();
    const atualizadas = atividades.map((a) =>
        a.id === id ? { ...a, status: novoStatus } : a
    );
    salvarAtividades(atualizadas);
    return atualizadas;
}