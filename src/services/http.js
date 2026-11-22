const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let mensagem = `Erro na API: ${response.status} - ${response.statusText}`;

    try {
      const corpoErro = await response.json();
      if (corpoErro?.message) {
        mensagem = corpoErro.message;
      }
    } catch {
      // Mantém mensagem padrão caso o corpo não seja JSON
    }

    const erro = new Error(mensagem);
    erro.status = response.status;
    erro.isHttpError = true;
    throw erro;
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export { API_URL };
