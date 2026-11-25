import { apiFetch, API_URL } from "./http";
import { atividadesContingencia } from "../data/dadosContingencia";

// URL do backend Spring Boot (unificada com VITE_API_URL / VITE_AUTH_API_URL)
const AUTH_API_URL = (
  import.meta.env.VITE_AUTH_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

// Requisições para o backend de autenticação (/auth/login e /auth/register)
async function authRequest(endpoint, dados) {
  let response;

  try {
    response = await fetch(`${AUTH_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });
  } catch {
    const erroOffline = new Error(
      "Não foi possível conectar ao backend. Verifique se o Spring Boot está iniciado."
    );
    erroOffline.isOffline = true;
    throw erroOffline;
  }

  const texto = await response.text();
  let resultado = null;

  try {
    resultado = texto ? JSON.parse(texto) : null;
  } catch {
    resultado = null;
  }

  if (!response.ok) {
    const erroHttp = new Error(
      resultado?.message ||
        resultado?.mensagem ||
        resultado?.erro ||
        (response.status === 401
          ? "E-mail ou senha incorretos."
          : `Erro na autenticação (${response.status}).`)
    );
    erroHttp.status = response.status;
    erroHttp.isHttpError = true;
    throw erroHttp;
  }

  return resultado;
}

// Login pelo backend Spring Boot
export function autenticarUsuario(email, senha) {
  return authRequest("/auth/login", {
    email,
    senha,
  });
}

// Cadastro pelo backend Spring Boot
export function registrarUsuario({ nome, email, senha }) {
  return authRequest("/auth/register", {
    nome,
    email,
    senha,
  });
}

/**
 * Testa a conectividade com a API REST configurada em VITE_API_URL.
 * Retorna tempo de resposta, status e amostra do payload.
 */
export async function testarConexaoApi() {
  const inicio = performance.now();

  try {
    const dados = await apiFetch("/atividades");
    const amostra = Array.isArray(dados) ? dados[0] || { total: 0 } : dados;

    return {
      sucesso: true,
      tempoMs: Math.round(performance.now() - inicio),
      url: API_URL,
      status: "Online",
      exemplo: amostra,
    };
  } catch (erro) {
    return {
      sucesso: false,
      tempoMs: Math.round(performance.now() - inicio),
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
      item.descricao ||
      "Atividade sincronizada a partir da API REST configurada.",
    prazo:
      item.prazo ||
      new Date(Date.now() + (index + 2) * 86400000).toISOString().split("T")[0],
    prioridade: String(item.prioridade || "media").toLowerCase(),
    status: String(item.status || "pendente").toLowerCase(),
    origem: "API REST",
  }));
}

export { API_URL, AUTH_API_URL };
