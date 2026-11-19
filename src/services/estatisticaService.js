
import { buscarAtividades } from "./atividadesService";

export async function buscarEstatisticas() {
  const resultado = await buscarAtividades();
  const atividades = resultado.dados;

  const porMateria = {};
  const porPrioridade = {};
  const porSituacao = {};

  atividades.forEach((atividade) => {
    const materia = atividade.materia || "Sem matéria";
    const prioridade = atividade.prioridade || "Não definida";
    const situacao = atividade.status || "Não definida";

    porMateria[materia] = (porMateria[materia] || 0) + 1;
    porPrioridade[prioridade] = (porPrioridade[prioridade] || 0) + 1;
    porSituacao[situacao] = (porSituacao[situacao] || 0) + 1;
  });

  return {
    total: atividades.length,
    porMateria,
    porPrioridade,
    porSituacao,
    origem: resultado.origem,
    erro: resultado.erro,
  };
}