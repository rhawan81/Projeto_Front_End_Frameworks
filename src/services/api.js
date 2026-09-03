// Base da API REST configurada no arquivo .env (com fallback seguro)
const API_URL = (
  import.meta.env.VITE_API_URL || "https://jsonplaceholder.typicode.com"
).replace(/\/$/, "");

/**
 * Função utilitária centralizada para chamadas HTTP Fetch.
 * Trata erros de rede, parse de JSON e cabeçalhos padrão.
 */
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Operações CRUD do recurso /todos da API REST
export function buscarTodos() {
  return request("/todos?userId=1");
}

export function criarTodo(todo) {
  return request("/todos", {
    method: "POST",
    body: JSON.stringify(todo),
  });
}

export function atualizarTodo(id, dados) {
  return request(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export function excluirTodo(id) {
  return request(`/todos/${id}`, {
    method: "DELETE",
  });
}

/**
 * Testa a conectividade com a API REST configurada.
 * Retorna tempo de resposta e status.
 */
export async function testarConexaoApi() {
  const inicio = performance.now();
  try {
    const dados = await request("/todos/1");
    const fim = performance.now();
    return {
      sucesso: true,
      tempoMs: Math.round(fim - inicio),
      url: API_URL,
      status: "Online",
      exemplo: dados,
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
 * Busca dados da API e converte para o formato de atividades do Organizador de Estudos.
 */
export async function buscarAtividadesDaApi() {
  const todos = await request("/todos?_limit=6");
  const materiasExemplo = [
    "Algoritmos e Programação",
    "Banco de Dados",
    "Sistemas Operacionais",
    "Engenharia de Software",
  ];
  const prioridades = ["alta", "media", "baixa"];

  return todos.map((item, index) => ({
    id: `api-${item.id}-${Date.now()}`,
    titulo: item.title.charAt(0).toUpperCase() + item.title.slice(1),
    materia: materiasExemplo[index % materiasExemplo.length],
    descricao: "Atividade sincronizada da API REST (JSONPlaceholder)",
    prazo: new Date(Date.now() + (index + 2) * 86400000)
      .toISOString()
      .split("T")[0],
    prioridade: prioridades[index % prioridades.length],
    status: item.completed ? "concluida" : "pendente",
    origem: "API Externa",
  }));
}

export { API_URL };