const API_URL = import.meta.env.VITE_API_URL;
const TEMPO_LIMITE_MS = 3000;

function comTempoLimite(promessa, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Tempo limite da requisição excedido."));
    }, ms);

    promessa
      .then((valor) => {
        clearTimeout(timer);
        resolve(valor);
      })
      .catch((erro) => {
        clearTimeout(timer);
        reject(erro);
      });
  });
}

export async function executarComFallback(
  requisicao,
  dadosContingencia
) {
  const obterFallback = () =>
    typeof dadosContingencia === "function"
      ? dadosContingencia()
      : dadosContingencia;

  // Sem API configurada: usa os dados locais, sem aviso.
  if (!API_URL) {
    return {
      dados: obterFallback(),
      origem: "local",
      erro: null,
    };
  }

  // Com API configurada: tenta a API e só avisa se ela falhar.
  try {
    const dados = await comTempoLimite(requisicao(), TEMPO_LIMITE_MS);

    return {
      dados,
      origem: "api",
      erro: null,
    };
  } catch (erro) {
    console.warn(
      "API indisponível. Utilizando dados locais de contingência.",
      erro.message
    );

    return {
      dados: obterFallback(),
      origem: "contingencia",
      erro: null,
    };
  }
}