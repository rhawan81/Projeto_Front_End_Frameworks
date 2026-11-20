
// API externa utilizada nas funcionalidades de demonstração
const API_URL = (
  import.meta.env.VITE_API_URL || "https://jsonplaceholder.typicode.com"
).replace(/\/$/, "");

// API do backend Spring Boot, responsável pela autenticação
const AUTH_API_URL = (
  import.meta.env.VITE_AUTH_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

// Requisições para a API externa
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

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Requisições para o backend de autenticação
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
    throw new Error(
      "Não foi possível conectar ao backend. Verifique se o Spring Boot está iniciado."
    );
  }

  const texto = await response.text();
  let resultado = null;

  try {
    resultado = texto ? JSON.parse(texto) : null;
  } catch {
    resultado = null;
  }

  if (!response.ok) {
    throw new Error(
      resultado?.message ||
      resultado?.mensagem ||
      resultado?.erro ||
      (response.status === 401
        ? "E-mail ou senha incorretos."
        : `Erro na autenticação (${response.status}).`)
    );
  }

  return resultado;
}

// Login pelo backend
export function autenticarUsuario(email, senha) {
  return authRequest("/auth/login", {
    email,
    senha,
  });
}

// Cadastro pelo backend
export function registrarUsuario({ nome, email, senha }) {
  return authRequest("/auth/register", {
    nome,
    email,
    senha,
  });
}

// Operações CRUD da API externa /todos
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

// Testa a conexão com a API externa
export async function testarConexaoApi() {
  const inicio = performance.now();

  try {
    const dados = await request("/todos/1");

    return {
      sucesso: true,
      tempoMs: Math.round(performance.now() - inicio),
      url: API_URL,
      status: "Online",
      exemplo: dados,
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

// Busca atividades de demonstração da API externa
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

export { API_URL, AUTH_API_URL };
