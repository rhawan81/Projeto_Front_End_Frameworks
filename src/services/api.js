import { apiFetch, API_URL } from "./http";
import { atividadesContingencia } from "../data/dadosContingencia";

/**
 * Testa a conectividade com a API REST configurada em VITE_API_URL.
 * Retorna tempo de resposta, status e amostra do payload.
 */
export async function testarConexaoApi() {
  const inicio = performance.now();
  try {
    const dados = await apiFetch("/atividades");
    const fim = performance.now();
    const amostra = Array.isArray(dados) ? dados[0] || { total: 0 } : dados;
    return {
      sucesso: true,
      tempoMs: Math.round(fim - inicio),
      url: API_URL,
      status: "Online",
      exemplo: amostra,
    };
  } catch (erro) {
    const fim = performance.now();
    return {
      sucesso: false,
      tempoMs: Math.round(fim - inicio),
      url: API_URL,
      status: "Offline",
      erro: erro.message,
    };
  }
}

/**
 * Busca atividades da API REST configurada (ou contingência compatível)
 * e converte para o formato de atividades do Organizador de Estudos.
 */
export async function buscarAtividadesDaApi() {
  let lista = [];
  try {
    const resposta = await apiFetch("/atividades");
    if (Array.isArray(resposta) && resposta.length > 0) {
      lista = resposta;
    } else {
      lista = atividadesContingencia;
    }
  } catch {
    lista = atividadesContingencia;
  }

  return lista.slice(0, 6).map((item, index) => ({
    id: `api-${item.id || index + 1}-${Date.now()}`,
    titulo: item.titulo || `Atividade sincronizada #${index + 1}`,
    materia:
      typeof item.materia === "object" && item.materia !== null
        ? item.materia.nome || "Geral"
        : item.materia || "Geral",
    descricao:
      item.descricao || "Atividade sincronizada a partir da API REST configurada.",
    prazo:
      item.prazo ||
      new Date(Date.now() + (index + 2) * 86400000).toISOString().split("T")[0],
    prioridade: String(item.prioridade || "media").toLowerCase(),
    status: String(item.status || "pendente").toLowerCase(),
    origem: "API REST",
  }));
}

export { API_URL };
