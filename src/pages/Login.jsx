import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../toast/ToastContext";
import { useTheme } from "../theme/ThemeContext";
import {
  IconeEscudo,
  IconeUsuario,
  IconeCadeado,
  IconeSol,
  IconeLua,
} from "../icons";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, cadastrarUsuario } = useAuth();
  const { mostrarToast } = useToast();
  const { tema, alternarTema } = useTheme();

  const [modoCadastro, setModoCadastro] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  // Dados do formulário
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [erros, setErros] = useState({});

  // Destino após login (redireciona para onde o usuário tentou acessar ou para a raiz)
  const deOndeVem = location.state?.from?.pathname || "/";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((atual) => ({ ...atual, [name]: value }));
    setErroGeral("");
    if (erros[name]) {
      setErros((antigos) => ({ ...antigos, [name]: "" }));
    }
  }

  function validar() {
    const novosErros = {};

    if (modoCadastro && !form.nome.trim()) {
      novosErros.nome = "Por favor, informe seu nome completo.";
    }

    if (!form.email.trim()) {
      novosErros.email = "Informe seu e-mail.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      novosErros.email = "Formato de e-mail inválido.";
    }

    if (!form.senha) {
      novosErros.senha = "Informe sua senha.";
    } else if (form.senha.length < 6) {
      novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (modoCadastro && form.senha !== form.confirmarSenha) {
      novosErros.confirmarSenha = "As senhas não coincidem.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    setCarregando(true);
    setErroGeral("");

    try {
      if (modoCadastro) {
        const res = cadastrarUsuario({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          papel: "estudante",
        });

        if (!res.sucesso) {
          setErroGeral(res.erro);
          setCarregando(false);
          return;
        }

        mostrarToast("Cadastro realizado com sucesso! Faça seu login.", "sucesso");
        setModoCadastro(false);
        setForm((atual) => ({ ...atual, senha: "", confirmarSenha: "" }));
      } else {
        const res = login(form.email, form.senha);

        if (!res.sucesso) {
          setErroGeral(res.erro);
          setCarregando(false);
          return;
        }

        mostrarToast(`Bem-vindo(a), ${res.usuario.nome}!`, "sucesso");
        navigate(deOndeVem, { replace: true });
      }
    } catch {
      setErroGeral("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  // Atalhos de demonstração para facilitar testes do avaliador
  function preencherEEntrar(email, senha) {
    setForm((atual) => ({ ...atual, email, senha }));
    setModoCadastro(false);
    setErroGeral("");

    const res = login(email, senha);
    if (res.sucesso) {
      mostrarToast(`Entrando como ${res.usuario.papel === "admin" ? "Administrador" : "Estudante"}...`);
      navigate(deOndeVem, { replace: true });
    }
  }

  return (
    <div className="login-container">
      {/* Botão flutuante de alternância de tema */}
      <div className="login-tema-topo">
        <button
          type="button"
          onClick={alternarTema}
          className="botao-icone-login"
          title={tema === "claro" ? "Ativar modo escuro" : "Ativar modo claro"}
          aria-label="Alternar tema"
        >
          {tema === "claro" ? <IconeLua /> : <IconeSol />}
        </button>
      </div>

      <div className="login-card">
        {/* Cabeçalho com Logomarca */}
        <div className="login-cabecalho">
          <div className="login-icone-app">📘</div>
          <h1>Organizador de Estudos</h1>
          <p className="login-subtitulo">
            {modoCadastro
              ? "Crie sua conta de estudante e organize sua vida acadêmica."
              : "Acesse sua conta para acompanhar tarefas, matérias e prazos."}
          </p>
        </div>

        {/* Mensagem de Erro Geral */}
        {erroGeral && (
          <div className="alerta-erro" role="alert">
            {erroGeral}
          </div>
        )}

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {modoCadastro && (
            <div className="campo-grupo">
              <label htmlFor="campo-nome">Nome Completo</label>
              <div className="campo-com-icone">
                <span className="icone-input">
                  <IconeUsuario />
                </span>
                <input
                  id="campo-nome"
                  type="text"
                  name="nome"
                  placeholder="Ex: Lucas Martins"
                  value={form.nome}
                  onChange={handleChange}
                />
              </div>
              {erros.nome && <span className="erro">{erros.nome}</span>}
            </div>
          )}

          <div className="campo-grupo">
            <label htmlFor="campo-email">E-mail</label>
            <div className="campo-com-icone">
              <span className="icone-input">@</span>
              <input
                id="campo-email"
                type="email"
                name="email"
                placeholder="seu.email@estudos.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {erros.email && <span className="erro">{erros.email}</span>}
          </div>

          <div className="campo-grupo">
            <label htmlFor="campo-senha">Senha</label>
            <div className="campo-com-icone">
              <span className="icone-input">
                <IconeCadeado />
              </span>
              <input
                id="campo-senha"
                type="password"
                name="senha"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
                autoComplete={modoCadastro ? "new-password" : "current-password"}
              />
            </div>
            {erros.senha && <span className="erro">{erros.senha}</span>}
          </div>

          {modoCadastro && (
            <div className="campo-grupo">
              <label htmlFor="campo-confirmar">Confirmar Senha</label>
              <div className="campo-com-icone">
                <span className="icone-input">
                  <IconeCadeado />
                </span>
                <input
                  id="campo-confirmar"
                  type="password"
                  name="confirmarSenha"
                  placeholder="••••••••"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                />
              </div>
              {erros.confirmarSenha && (
                <span className="erro">{erros.confirmarSenha}</span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="botao-primario botao-bloco"
            disabled={carregando}
          >
            {carregando ? (
              "Processando..."
            ) : modoCadastro ? (
              "Cadastrar Conta"
            ) : (
              "Entrar no Sistema"
            )}
          </button>
        </form>

        {/* Alternância entre Login e Cadastro */}
        <div className="login-rodape-alternar">
          {modoCadastro ? (
            <p>
              Já tem uma conta?{" "}
              <button
                type="button"
                className="link-texto"
                onClick={() => {
                  setModoCadastro(false);
                  setErroGeral("");
                }}
              >
                Faça login
              </button>
            </p>
          ) : (
            <p>
              Não possui conta?{" "}
              <button
                type="button"
                className="link-texto"
                onClick={() => {
                  setModoCadastro(true);
                  setErroGeral("");
                }}
              >
                Cadastre-se como estudante
              </button>
            </p>
          )}
        </div>

        {/* Seção de Atalhos Rápidos para Avaliação Acadêmica */}
        <div className="login-atalhos-demo">
          <div className="divisor-com-texto">
            <span>Acesso Rápido para Avaliação</span>
          </div>

          <div className="botoes-demo-grid">
            <button
              type="button"
              className="botao-demo botao-demo-aluno"
              onClick={() => preencherEEntrar("aluno@estudos.com", "aluno123")}
            >
              <IconeUsuario />
              <div className="demo-info">
                <strong>Entrar como Aluno</strong>
                <small>aluno@estudos.com</small>
              </div>
            </button>

            <button
              type="button"
              className="botao-demo botao-demo-admin"
              onClick={() => preencherEEntrar("admin@estudos.com", "admin123")}
            >
              <IconeEscudo />
              <div className="demo-info">
                <strong>Entrar como ADM</strong>
                <small>admin@estudos.com</small>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
