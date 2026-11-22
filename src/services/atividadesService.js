
import { apiFetch } from "./http";
import { executarComFallback } from "./fallbackServices";
import { carregarAtividades } from "../data/storage";

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

  return executarComFallback(() => apiFetch(endpoint), obterFallback);
}