import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  carregarAtividades,
  carregarMaterias,
  garantirMateriaCadastrada,
} from "../data/storage";
import {
  buscarAtividadePorId,
  criarAtividade,
  atualizarAtividade,
  excluirAtividade,
} from "../services/atividadesService";
import { buscarMaterias } from "../services/materiasService";
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const [form, setForm] = useState(FORM_VAZIO);
  const [erros, setErros] = useState({});
  const [materias, setMaterias] = useState([]);
  const [salvando, setSalvando] = useState(false);

  const modoEdicao = Boolean(id);

  useEffect(() => {
    let ativo = true;

    async function inicializarFormulario() {
      const atividadesLocais = carregarAtividades();
      const materiasLocais = carregarMaterias().map((m) => m.nome);
      const materiasDasAtividades = atividadesLocais.map((a) => a.materia);
      const iniciais = [
        ...new Set([...materiasLocais, ...materiasDasAtividades].filter(Boolean)),
      ].sort();
      if (ativo) setMaterias(iniciais);

      try {
        const resMaterias = await buscarMaterias();
        if (ativo && Array.isArray(resMaterias?.dados)) {
          const nomesApi = resMaterias.dados.map((m) => m.nome);
          const combinadas = [
            ...new Set([...iniciais, ...nomesApi].filter(Boolean)),
          ].sort();
          setMaterias(combinadas);
        }
      } catch {
        // Mantém lista local em caso de contingência
      }

      if (modoEdicao) {
        const local = atividadesLocais.find((a) => String(a.id) === String(id));
        if (local && ativo) {
          setForm({ ...FORM_VAZIO, ...local });
        }
        try {
          const remota = await buscarAtividadePorId(id);
          if (remota && ativo) {
            setForm({ ...FORM_VAZIO, ...remota });
          }
        } catch {
          // Mantém dados locais caso a busca por ID falhe
        }
      } else {
        const materiaParam = searchParams.get("materia");
        if (materiaParam && ativo) {
          setForm((f) => ({ ...f, materia: materiaParam }));
        }
      }
    }

    inicializarFormulario();
    return () => {
      ativo = false;
    };
  }, [id, modoEdicao, searchParams]);

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar() || salvando) return;

    const nomeMateriaLimpo = form.materia.trim();
    garantirMateriaCadastrada(nomeMateriaLimpo);
    setSalvando(true);

    try {
      if (modoEdicao) {
        await atualizarAtividade(id, { ...form, materia: nomeMateriaLimpo });
        mostrarToast("Atividade atualizada com sucesso.");
      } else {
        await criarAtividade({ ...form, materia: nomeMateriaLimpo });
        mostrarToast("Atividade cadastrada com sucesso.");
      }
      navigate("/atividades");
    } catch (erro) {
      mostrarToast(
        erro.message || "Não foi possível salvar a atividade.",
        "erro"
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (salvando) return;
    setSalvando(true);
    try {
      await excluirAtividade(id);
      mostrarToast("Atividade excluída.", "aviso");
      navigate("/atividades");
    } catch (erro) {
      mostrarToast(
        erro.message || "Não foi possível excluir a atividade.",
        "erro"
      );
    } finally {
      setSalvando(false);
    }
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
              disabled={salvando}
            >
              Excluir
            </button>
          )}
          <span className="espacador" />
          <button
            type="button"
            className="botao-secundario"
            onClick={() => navigate("/atividades")}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button type="submit" className="botao-primario" disabled={salvando}>
            {salvando
              ? "Salvando..."
              : modoEdicao
              ? "Salvar alterações"
              : "Salvar atividade"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AtividadeForm;
