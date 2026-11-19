import "./EstadoRequisicao.css";

function IconeAviso() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconeAtualizar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function BotaoTentarNovamente({ onTentarNovamente }) {
  if (!onTentarNovamente) return null;

  return (
    <button
      type="button"
      className="estado-req-botao"
      onClick={onTentarNovamente}
    >
      <IconeAtualizar />
      Tentar novamente
    </button>
  );
}

export default function EstadoRequisicao({
  carregando = false,
  erro = null,
  origem = "api",
  vazio = false,
  mensagemVazio = "Nenhum dado encontrado.",
  onTentarNovamente,
  children,
}) {
  // Carregando
  if (carregando) {
    return (
      <div className="estado-req-carregando" role="status" aria-live="polite">
        <span className="estado-req-spinner" aria-hidden="true" />
        <span>Carregando dados...</span>
      </div>
    );
  }

  // API indisponível, mas o app segue com dados de demonstração
  if (origem === "contingencia") {
    return (
      <>
        <div className="estado-req-aviso" role="status">
          <span className="estado-req-aviso-icone">
            <IconeAviso />
          </span>

          <span className="estado-req-aviso-texto">
            <strong>Servidor indisponível.</strong> Mostrando dados de
            demonstração.
          </span>

          <BotaoTentarNovamente onTentarNovamente={onTentarNovamente} />
        </div>

        {children}
      </>
    );
  }

  // Erro sem dados para mostrar
  if (erro) {
    return (
      <div className="estado-req-erro" role="alert">
        <strong>Não foi possível carregar os dados.</strong>
        <span>{erro}</span>
        <BotaoTentarNovamente onTentarNovamente={onTentarNovamente} />
      </div>
    );
  }

  // Lista vazia
  if (vazio) {
    return <p className="estado-req-vazio">{mensagemVazio}</p>;
  }

  return <>{children}</>;
}