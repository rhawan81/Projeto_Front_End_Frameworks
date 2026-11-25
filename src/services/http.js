const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

const CHAVE_SESSAO = "organizador-estudos:auth";

function obterTokenSessao() {
  try {
    const salvo = localStorage.getItem(CHAVE_SESSAO);
    if (!salvo) return null;
    const sessao = JSON.parse(salvo);
    return sessao?.token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = obterTokenSessao();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let mensagem = `Erro na API: ${response.status} - ${response.statusText}`;

    if (response.status === 401) {
      mensagem = "Sessão expirada ou não autenticada (401). Faça login novamente.";
    } else if (response.status === 403) {
      mensagem = "Acesso negado (403): você não possui permissão para esta operação.";
    }

    try {
      const corpoErro = await response.json();
      if (corpoErro?.message || corpoErro?.erro) {
        mensagem = corpoErro.message || corpoErro.erro;
      }
    } catch {
      // Mantém mensagem padrão caso o corpo não seja JSON
    }

    if (typeof window !== "undefined") {
      if (response.status === 401) {
        window.dispatchEvent(
          new CustomEvent("auth:nao-autorizado", {
            detail: { status: 401, mensagem },
          })
        );
      } else if (response.status === 403) {
        window.dispatchEvent(
          new CustomEvent("auth:acesso-negado", {
            detail: { status: 403, mensagem },
          })
        );
      }
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
