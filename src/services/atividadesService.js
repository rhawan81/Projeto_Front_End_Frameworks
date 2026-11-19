
import { apiFetch } from "./http";
import { executarComFallback } from "./fallbackServices";
import { atividadesContingencia } from "../data/dadosContingencia";

export function buscarAtividades(filtros = {}) {
  const params = new URLSearchParams();

  if (filtros.materia) {
    params.append("materia", filtros.materia);
  }

  if (filtros.situacao) {
    params.append("situacao", filtros.situacao);
  }

  const query = params.toString();
  const endpoint = `/atividades${query ? `?${query}` : ""}`;

  const dadosFallback = atividadesContingencia.filter((atividade) => {
    const materiaOk =
      !filtros.materia || atividade.materia === filtros.materia;

    const situacaoOk =
      !filtros.situacao || atividade.status === filtros.situacao;

    return materiaOk && situacaoOk;
  });

  return executarComFallback(
    () => apiFetch(endpoint),
    dadosFallback
  );
}