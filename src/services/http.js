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
       throw new Error(
        `Erro na API: ${response.status} - ${response.statusText}`
       ); 
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}