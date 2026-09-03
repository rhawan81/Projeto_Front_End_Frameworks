const API_URL = import.meta.env.VITE_API_URL;

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  return text ? JSON.parse(text) : null;
}

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