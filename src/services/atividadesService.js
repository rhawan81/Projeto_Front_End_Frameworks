import { apiFetch } from "./http";
import { executarComFallback } from "./fallbackServices";
import {
  carregarAtividades,
  salvarAtividades,
  garantirMateriaCadastrada,
} from "../data/storage";

function normalizarParaFront(atividade) {
  return {
    ...atividade,
    materia:
      typeof atividade.materia === "object" && atividade.materia !== null
        ? atividade.materia.nome || ""
        : atividade.materia || "",
    status: String(atividade.status || "pendente").toLowerCase(),
    prioridade: String(atividade.prioridade || "baixa").toLowerCase(),
  };
}

function normalizarParaApi(dados) {
  return {
    titulo: String(dados.titulo || "").trim(),
    materia: String(dados.materia || "").trim(),
    materiaId: dados.materiaId ?? null,
    descricao: String(dados.descricao || "").trim(),
    prazo: dados.prazo,
    prioridade: String(dados.prioridade || "media").toUpperCase(),
    status: String(dados.status || "pendente").toUpperCase(),
  };
}

export async function buscarAtividades(filtros = {}) {
  const params = new URLSearchParams();

  if (filtros.materia) {
    params.append("materia", filtros.materia);
  }

  if (filtros.situacao) {
    params.append("situacao", filtros.situacao);
  }

  const query = params.toString();
  const endpoint = `/atividades${query ? `?${query}` : ""}`;

  const obterFallback = () =>
    carregarAtividades().filter((atividade) => {
      const materiaOk =
        !filtros.materia ||
        atividade.materia?.toLowerCase() === filtros.materia.toLowerCase();

      const situacaoOk =
        !filtros.situacao ||
        String(atividade.status || "").toLowerCase() ===
          String(filtros.situacao).toLowerCase();

      return materiaOk && situacaoOk;
    });

  const resultado = await executarComFallback(
    () => apiFetch(endpoint),
    obterFallback
  );

  const dadosNormalizados = Array.isArray(resultado.dados)
    ? resultado.dados.map(normalizarParaFront)
    : [];

  if (resultado.origem === "api" && !filtros.materia && !filtros.situacao) {
    salvarAtividades(dadosNormalizados);
  }

  return {
    ...resultado,
    dados: dadosNormalizados,
  };
}

export async function buscarAtividadePorId(id) {
  try {
    const dados = await apiFetch(`/atividades/${id}`);
    return normalizarParaFront(dados);
  } catch (erro) {
    if (erro.isHttpError) throw erro;
    const encontrada = carregarAtividades().find(
      (a) => String(a.id) === String(id)
    );
    return encontrada ? normalizarParaFront(encontrada) : null;
  }
}

export async function criarAtividade(dados) {
  const payload = normalizarParaApi(dados);

  try {
    const criada = await apiFetch("/atividades", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const normalizada = normalizarParaFront(criada);
    const atuais = carregarAtividades().filter(
      (a) => String(a.id) !== String(normalizada.id)
    );
    salvarAtividades([...atuais, normalizada]);
    return normalizada;
  } catch (erro) {
    if (erro.isHttpError) throw erro;

    garantirMateriaCadastrada(payload.materia);
    const novaLocal = normalizarParaFront({
      ...dados,
      materia: payload.materia,
      id: Date.now().toString(),
    });
    salvarAtividades([...carregarAtividades(), novaLocal]);
    return novaLocal;
  }
}

export async function atualizarAtividade(id, dados) {
  const payload = normalizarParaApi(dados);

  try {
    const atualizada = await apiFetch(`/atividades/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const normalizada = normalizarParaFront(atualizada);
    const novaLista = carregarAtividades().map((a) =>
      String(a.id) === String(id) ? normalizada : a
    );
    salvarAtividades(novaLista);
    return normalizada;
  } catch (erro) {
    if (erro.isHttpError) throw erro;

    garantirMateriaCadastrada(payload.materia);
    const novaLista = carregarAtividades().map((a) =>
      String(a.id) === String(id)
        ? normalizarParaFront({ ...dados, materia: payload.materia, id: a.id })
        : a
    );
    salvarAtividades(novaLista);
    return novaLista.find((a) => String(a.id) === String(id)) || null;
  }
}

export async function atualizarStatusAtividadeApi(id, novoStatus) {
  const statusUpper = String(novoStatus || "pendente").toUpperCase();
  const statusLower = statusUpper.toLowerCase();

  try {
    const atualizada = await apiFetch(`/atividades/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: statusUpper }),
    });
    const normalizada = normalizarParaFront(atualizada);
    const novaLista = carregarAtividades().map((a) =>
      String(a.id) === String(id) ? normalizada : a
    );
    salvarAtividades(novaLista);
    return normalizada;
  } catch (erro) {
    if (erro.isHttpError) throw erro;

    const novaLista = carregarAtividades().map((a) =>
      String(a.id) === String(id) ? { ...a, status: statusLower } : a
    );
    salvarAtividades(novaLista);
    return novaLista.find((a) => String(a.id) === String(id)) || null;
  }
}

export async function excluirAtividade(id) {
  try {
    await apiFetch(`/atividades/${id}`, {
      method: "DELETE",
    });
  } catch (erro) {
    if (erro.isHttpError) throw erro;
  }

  const novaLista = carregarAtividades().filter(
    (a) => String(a.id) !== String(id)
  );
  salvarAtividades(novaLista);
}
