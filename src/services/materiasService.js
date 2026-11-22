
import { apiFetch } from "./http";
import { executarComFallback } from "./fallbackServices";
import { carregarMaterias } from "../data/storage";

export function buscarMaterias() {
  return executarComFallback(
    () => apiFetch("/materias"),
    () => carregarMaterias()
  );
}