export default function EstadoRequisicao({
  carregando,
  erro,
  origem,
  vazio,
  onTentarNovamente,
  children,
}) {
  if (carregando) {
    return (
      <div className="estado-requisicao">
        Carregando informações...
      </div>
    );
  }

  return (
    <>
      {origem === "contingencia" && (
        <div className="aviso-contingencia" role="alert">
          <p>
            Não foi possível conectar ao servidor.
            Estamos exibindo dados de demonstração.
          </p>

          <button type="button" onClick={onTentarNovamente}>
            Tentar novamente
          </button>
        </div>
      )}

      {erro && origem !== "contingencia" && (
        <div className="erro-requisicao" role="alert">
          <p>Ocorreu um erro ao carregar as informações.</p>

          <button type="button" onClick={onTentarNovamente}>
            Tentar novamente
          </button>
        </div>
      )}

      {vazio ? (
        <div className="estado-requisicao">
          Nenhuma informação encontrada.
        </div>
      ) : (
        children
      )}
    </>
  );
}