import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { carregarAtividades, salvarAtividades } from "../data/storage";
import { useToast } from "../toast/ToastContext";
import { IconeVoltar } from "../icons";

const FORM_VAZIO = {
  titulo: "",
  materia: "",
  descricao: "",
  prazo: "",
  prioridade: "media",
  status: "pendente",
};

function AtividadeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const [form, setForm] = useState(FORM_VAZIO);
  const [erros, setErros] = useState({});
  const [materias, setMaterias] = useState([]);

  const modoEdicao = Boolean(id);

  useEffect(() => {
    const atividades = carregarAtividades();
    setMaterias([...new Set(atividades.map((a) => a.materia))].sort());

    if (modoEdicao) {
      const atividade = atividades.find((a) => a.id === id);
      if (atividade) setForm({ ...FORM_VAZIO, ...atividade });
    }
  }, [id, modoEdicao]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  function validar() {
    const novosErros = {};
    if (!form.titulo.trim()) novosErros.titulo = "Informe o título.";
    if (!form.materia.trim()) novosErros.materia = "Informe a matéria.";
    if (!form.prazo) novosErros.prazo = "Informe o prazo.";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    const atividades = carregarAtividades();

    if (modoEdicao) {
      const novaLista = atividades.map((a) => (a.id === id ? { ...form, id } : a));
      salvarAtividades(novaLista);
      mostrarToast("Atividade atualizada com sucesso.");
    } else {
      const novaAtividade = { ...form, id: Date.now().toString() };
      salvarAtividades([...atividades, novaAtividade]);
      mostrarToast("Atividade cadastrada com sucesso.");
    }

    navigate("/atividades");
  }

  function handleExcluir() {
    const atividades = carregarAtividades().filter((a) => a.id !== id);
    salvarAtividades(atividades);
    mostrarToast("Atividade excluída.", "aviso");
    navigate("/atividades");
  }

  return (
    <section className="atividade-form">
      <button
        type="button"
        className="link-voltar"
        onClick={() => navigate("/atividades")}
      >
        <IconeVoltar /> Voltar
      </button>

      <h1>{modoEdicao ? "Editar atividade" : "Nova atividade"}</h1>

      <form onSubmit={handleSubmit} noValidate>
        <label>
          Título
          <input
            type="text"
            name="titulo"
            placeholder="Ex: Trabalho de Matemática"
            value={form.titulo}
            onChange={handleChange}
          />
          {erros.titulo && <span className="erro">{erros.titulo}</span>}
        </label>

        <label>
          Matéria
          <input
            type="text"
            name="materia"
            placeholder="Selecione ou digite a matéria"
            value={form.materia}
            onChange={handleChange}
            list="lista-materias"
          />
          <datalist id="lista-materias">
            {materias.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          {erros.materia && <span className="erro">{erros.materia}</span>}
        </label>

        <label className="campo-largo">
          Descrição
          <textarea
            name="descricao"
            placeholder="Digite uma descrição (opcional)"
            value={form.descricao}
            onChange={handleChange}
            rows={3}
          />
        </label>

        <label>
          Prazo
          <input
            type="date"
            name="prazo"
            value={form.prazo}
            onChange={handleChange}
          />
          {erros.prazo && <span className="erro">{erros.prazo}</span>}
        </label>

        <label>
          Prioridade
          <div className="opcoes-prioridade">
            {["alta", "media", "baixa"].map((valor) => (
              <button
                type="button"
                key={valor}
                className={`selo selo-${valor} ${
                  form.prioridade === valor ? "selo-selecionado" : ""
                }`}
                onClick={() => setForm((f) => ({ ...f, prioridade: valor }))}
              >
                {valor === "alta" ? "Alta" : valor === "media" ? "Média" : "Baixa"}
              </button>
            ))}
          </div>
        </label>

        <label>
          Situação
          <div className="opcoes-situacao">
            <label>
              <input
                type="radio"
                name="status"
                value="pendente"
                checked={form.status === "pendente"}
                onChange={handleChange}
              />
              Pendente
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="concluida"
                checked={form.status === "concluida"}
                onChange={handleChange}
              />
              Concluída
            </label>
          </div>
        </label>

        <div className="form-acoes">
          {modoEdicao && (
            <button
              type="button"
              className="link-excluir"
              onClick={handleExcluir}
            >
              Excluir
            </button>
          )}
          <span className="espacador" />
          <button
            type="button"
            className="botao-secundario"
            onClick={() => navigate("/atividades")}
          >
            Cancelar
          </button>
          <button type="submit" className="botao-primario">
            {modoEdicao ? "Salvar alterações" : "Salvar atividade"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AtividadeForm;