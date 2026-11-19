export const rotulosPrioridade = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const rotulosStatus = {
  pendente: "Pendente",
  concluida: "Concluída",
};

export const ordemPrioridade = { alta: 0, media: 1, baixa: 2 };

export const DIAS_PRAZO_PROXIMO = 3;

export function normalizarAtividade(atividade) {
  return {
    ...atividade,
    status: String(atividade.status || "pendente").toLowerCase(),
    prioridade: String(atividade.prioridade || "baixa").toLowerCase(),
  };
}

export function chaveDoPrazo(prazo) {
  return prazo ? String(prazo).slice(0, 10) : "";
}

export function chaveData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Usa T00:00:00 para evitar o deslocamento de fuso (UTC-3).
export function dataDaChave(chave) {
  if (!chave) return null;
  const data = new Date(`${chave}T00:00:00`);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function formatarDataBR(chave) {
  const data = dataDaChave(chave);
  return data ? data.toLocaleDateString("pt-BR") : "Sem prazo";
}

export function estaAtrasada(atividade) {
  if (atividade.status === "concluida") return false;

  const prazo = dataDaChave(chaveDoPrazo(atividade.prazo));
  if (!prazo) return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return prazo < hoje;
}

// Pendentes primeiro; dentro delas, da prioridade mais alta para a mais baixa.
export function ordenarPorUrgencia(a, b) {
  const concluidaA = a.status === "concluida" ? 1 : 0;
  const concluidaB = b.status === "concluida" ? 1 : 0;

  if (concluidaA !== concluidaB) return concluidaA - concluidaB;

  return (
    (ordemPrioridade[a.prioridade] ?? 3) -
    (ordemPrioridade[b.prioridade] ?? 3)
  );
}

// Dias entre hoje e o prazo (negativo = atrasada). null se não houver prazo.
export function diasAteOPrazo(atividade) {
  const prazo = dataDaChave(chaveDoPrazo(atividade.prazo));
  if (!prazo) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return Math.round((prazo - hoje) / 86400000);
}

export function prazoProximo(atividade) {
  if (atividade.status === "concluida") return false;

  const dias = diasAteOPrazo(atividade);
  return dias !== null && dias >= 0 && dias <= DIAS_PRAZO_PROXIMO;
}

export function textoPrazo(atividade) {
  const dias = diasAteOPrazo(atividade);

  if (dias === null) return "Sem prazo";
  if (dias < 0) {
    const n = Math.abs(dias);
    return `Atrasada há ${n} dia${n > 1 ? "s" : ""}`;
  }
  if (dias === 0) return "Vence hoje";
  if (dias === 1) return "Vence amanhã";
  return `Em ${dias} dias`;
}

// Pendentes primeiro; depois por prazo mais próximo (sem prazo por último).
export function ordenarPorPrazo(a, b) {
  const concluidaA = a.status === "concluida" ? 1 : 0;
  const concluidaB = b.status === "concluida" ? 1 : 0;
  if (concluidaA !== concluidaB) return concluidaA - concluidaB;

  const diasA = diasAteOPrazo(a);
  const diasB = diasAteOPrazo(b);
  if (diasA === null && diasB === null) return 0;
  if (diasA === null) return 1;
  if (diasB === null) return -1;

  return diasA - diasB;
}