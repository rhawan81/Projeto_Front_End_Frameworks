
import { apiFetch } from "./http";
import { executarComFallback } from "./fallbackServices";
import { materiasContingencia } from "../data/dadosContingencia";

export function buscarMaterias() {
  return executarComFallback(
    () => apiFetch("/materias"),
    materiasContingencia
  );
}