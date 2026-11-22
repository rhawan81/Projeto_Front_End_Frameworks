import { apiFetch } from "./http";
import { executarComFallback } from "./fallbackServices";
import {
  carregarMaterias,
  salvarMaterias,
  CORES_MATERIAS_PADRAO,
} from "../data/storage";

function normalizarMateria(materia, index = 0) {
  return {
    ...materia,
    cor:
      materia.cor ||
      CORES_MATERIAS_PADRAO[index % CORES_MATERIAS_PADRAO.length],
  };
}

export async function buscarMaterias() {
  const resultado = await executarComFallback(
    () => apiFetch("/materias"),
    () => carregarMaterias()
  );

  const dadosNormalizados = Array.isArray(resultado.dados)
    ? resultado.dados.map(normalizarMateria)
    : [];

  if (resultado.origem === "api") {
    salvarMaterias(dadosNormalizados);
  }

  return {
    ...resultado,
    dados: dadosNormalizados,
  };
}

export async function criarMateria({ nome, cor }) {
  const nomeLimpo = String(nome || "").trim();

  try {
    const criada = await apiFetch("/materias", {
      method: "POST",
      body: JSON.stringify({ nome: nomeLimpo, cor }),
    });
    const normalizada = normalizarMateria(criada);
    const atuais = carregarMaterias().filter(
      (m) => String(m.id) !== String(normalizada.id)
    );
    salvarMaterias([...atuais, normalizada]);
    return normalizada;
  } catch (erro) {
    if (erro.isHttpError) throw erro;

    const atuais = carregarMaterias();
    const novaLocal = normalizarMateria(
      {
        id: `mat-${Date.now()}`,
        nome: nomeLimpo,
        cor,
      },
      atuais.length
    );
    salvarMaterias([...atuais, novaLocal]);
    return novaLocal;
  }
}

export async function atualizarMateria(id, { nome, cor }) {
  const nomeLimpo = String(nome || "").trim();

  try {
    const atualizada = await apiFetch(`/materias/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nome: nomeLimpo, cor }),
    });
    const normalizada = normalizarMateria(atualizada);
    const novaLista = carregarMaterias().map((m) =>
      String(m.id) === String(id) ? normalizada : m
    );
    salvarMaterias(novaLista);
    return normalizada;
  } catch (erro) {
    if (erro.isHttpError) throw erro;

    const novaLista = carregarMaterias().map((m) =>
      String(m.id) === String(id) ? { ...m, nome: nomeLimpo, cor } : m
    );
    salvarMaterias(novaLista);
    return novaLista.find((m) => String(m.id) === String(id)) || null;
  }
}

export async function excluirMateriaApi(id) {
  try {
    await apiFetch(`/materias/${id}`, {
      method: "DELETE",
    });
  } catch (erro) {
    if (erro.isHttpError) throw erro;
  }

  const novaLista = carregarMaterias().filter(
    (m) => String(m.id) !== String(id)
  );
  salvarMaterias(novaLista);
}
