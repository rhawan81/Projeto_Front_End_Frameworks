import { createContext, useContext, useEffect, useState } from "react";
import { autenticarUsuario, registrarUsuario } from "../services/api";

const CHAVE_SESSAO = "organizador-estudos:auth";
const CHAVE_USUARIOS = "organizador-estudos:usuarios";

// Função utilitária determinística para verificar credencial em modo contingência offline sem guardar senha em texto puro
function gerarHashContingencia(texto) {
  const s = String(texto || "");
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) % 1000000007;
  }
  return String(h);
}

const HASH_PERFIL_ADMIN = "694790411";
const HASH_PERFIL_ESTUDANTE = "28500407";

export const ADMIN_PADRAO = {
  id: "usr-admin",
  nome: "Prof. Henrique (ADM)",
  email: "admin@estudos.com",
  papel: "admin",
  status: "ativo",
  criadoEm: "2026-08-01",
  credencialHash: HASH_PERFIL_ADMIN,
};

const USUARIOS_INICIAIS = [
  ADMIN_PADRAO,
  {
    id: "usr-2",
    nome: "Emilly Silva",
    email: "emilly@estudos.com",
    papel: "estudante",
    status: "ativo",
    criadoEm: "2026-08-10",
    credencialHash: HASH_PERFIL_ESTUDANTE,
  },
  {
    id: "usr-3",
    nome: "José Rhawan Michel",
    email: "michel@estudos.com",
    papel: "estudante",
    status: "ativo",
    criadoEm: "2026-08-15",
    credencialHash: HASH_PERFIL_ESTUDANTE,
  },
  {
    id: "usr-4",
    nome: "Mylena Oliveira",
    email: "mylena@estudos.com",
    papel: "estudante",
    status: "ativo",
    criadoEm: "2026-08-20",
    credencialHash: HASH_PERFIL_ESTUDANTE,
  },
  {
    id: "usr-5",
    nome: "Ariely Lopes",
    email: "ariely@estudos.com",
    papel: "estudante",
    status: "ativo",
    criadoEm: "2026-08-22",
    credencialHash: HASH_PERFIL_ESTUDANTE,
  },
  {
    id: "usr-6",
    nome: "Aluno Teste",
    email: "aluno@estudos.com",
    papel: "estudante",
    status: "ativo",
    criadoEm: "2026-08-25",
    credencialHash: HASH_PERFIL_ESTUDANTE,
  },
];

const AuthContext = createContext(null);

// Padroniza o perfil recebido do backend para o frontend
function normalizarPapel(papel) {
  return String(papel || "").toUpperCase() === "ADMIN" ? "admin" : "estudante";
}

// Remove dados antigos de senha que possam estar salvos no navegador
function limparUsuario(usuario) {
  if (!usuario) return null;

  const { senha: _s, password: _p, ...dados } = usuario;
  const papelNormalizado = normalizarPapel(dados.papel);
  const ehContaPadrao = USUARIOS_INICIAIS.some(
    (u) => u.email.toLowerCase() === String(dados.email || "").toLowerCase()
  );

  return {
    ...dados,
    papel: papelNormalizado,
    status: dados.status || "ativo",
    credencialHash: ehContaPadrao
      ? papelNormalizado === "admin"
        ? HASH_PERFIL_ADMIN
        : HASH_PERFIL_ESTUDANTE
      : dados.credencialHash || HASH_PERFIL_ESTUDANTE,
  };
}

export function AuthProvider({ children }) {
  const [usuarios, setUsuarios] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_USUARIOS);
      if (salvo) {
        const lista = JSON.parse(salvo);
        if (Array.isArray(lista) && lista.length > 0) {
          const sanitizados = lista.map(limparUsuario);
          const temAdmin = sanitizados.some(
            (u) => u.email?.toLowerCase() === ADMIN_PADRAO.email.toLowerCase()
          );
          return temAdmin ? sanitizados : [ADMIN_PADRAO, ...sanitizados];
        }
      }
    } catch {
      // Usa lista inicial em caso de erro de parse
    }
    const iniciais = USUARIOS_INICIAIS.map(limparUsuario);
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(iniciais));
    return iniciais;
  });

  const [usuario, setUsuario] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_SESSAO);
      if (!salvo) return null;
      const sessao = JSON.parse(salvo);
      return sessao ? limparUsuario(sessao) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      CHAVE_USUARIOS,
      JSON.stringify(usuarios.map(limparUsuario))
    );
  }, [usuarios]);

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(limparUsuario(usuario)));
    } else {
      localStorage.removeItem(CHAVE_SESSAO);
    }
  }, [usuario]);

  // Escuta respostas 401 da API para encerrar sessão inválida/expirada automaticamente
  useEffect(() => {
    function handleNaoAutorizado() {
      setUsuario(null);
    }
    window.addEventListener("auth:nao-autorizado", handleNaoAutorizado);
    return () => {
      window.removeEventListener("auth:nao-autorizado", handleNaoAutorizado);
    };
  }, []);

  // Login utilizando o backend Spring Boot (com contingência offline caso o servidor não esteja iniciado)
  async function login(email, senha) {
    const emailLimpo = email.trim().toLowerCase();

    try {
      const resposta = await autenticarUsuario(emailLimpo, senha);

      if (resposta?.token) {
        const dadosSessao = {
          id: resposta.usuarioId,
          nome: resposta.nome,
          email: resposta.email,
          papel: normalizarPapel(resposta.papel),
          status: "ativo",
          token: resposta.token,
          tipo: resposta.tipo || "Bearer",
        };

        setUsuario(dadosSessao);
        return {
          sucesso: true,
          usuario: dadosSessao,
          origem: "api",
        };
      }
    } catch (erro) {
      // Se o backend Spring Boot está rodando e respondeu erro HTTP (ex: 401 credenciais inválidas), retorna o erro
      if (!erro.isOffline) {
        return {
          sucesso: false,
          erro: erro.message || "Não foi possível realizar o login.",
        };
      }
      // Se o backend estiver desligado (isOffline), permite login em modo contingência para demonstração
    }

    const hashDigitado = gerarHashContingencia(senha);
    const encontrado = usuarios.find(
      (u) => u.email?.toLowerCase() === emailLimpo
    );

    if (!encontrado) {
      return {
        sucesso: false,
        erro: "Usuário não encontrado (servidor offline).",
      };
    }

    const hashEsperado = encontrado.credencialHash || HASH_PERFIL_ESTUDANTE;
    if (hashDigitado !== hashEsperado) {
      return {
        sucesso: false,
        erro: "E-mail ou senha incorretos.",
      };
    }

    if (encontrado.status === "bloqueado") {
      return {
        sucesso: false,
        erro: "Acesso negado (403): sua conta está suspensa pelo Administrador.",
      };
    }

    const dadosSessao = {
      ...limparUsuario(encontrado),
      origem: "contingencia",
    };
    setUsuario(dadosSessao);
    return {
      sucesso: true,
      usuario: dadosSessao,
      origem: "contingencia",
    };
  }

  // Encerra a sessão removendo os dados do localStorage
  function logout() {
    setUsuario(null);
  }

  // Cadastro utilizando o backend Spring Boot (com contingência offline caso o servidor esteja desligado)
  async function cadastrarUsuario({ nome, email, senha, papel = "estudante" }) {
    const emailLimpo = email.trim().toLowerCase();

    try {
      const resposta = await registrarUsuario({
        nome: nome.trim(),
        email: emailLimpo,
        senha,
      });

      const novoUsuario = {
        id: resposta.usuarioId || `usr-${Date.now()}`,
        nome: resposta.nome || nome.trim(),
        email: resposta.email || emailLimpo,
        papel: normalizarPapel(resposta.papel || papel),
        status: "ativo",
        criadoEm: new Date().toISOString().split("T")[0],
        credencialHash: gerarHashContingencia(senha),
      };

      setUsuarios((atuais) => {
        const semDuplicado = atuais.filter(
          (item) => item.email?.toLowerCase() !== novoUsuario.email
        );
        return [...semDuplicado, novoUsuario];
      });

      return {
        sucesso: true,
        usuario: novoUsuario,
      };
    } catch (erro) {
      if (!erro.isOffline) {
        return {
          sucesso: false,
          erro: erro.message || "Não foi possível realizar o cadastro.",
        };
      }
    }

    // Contingência offline
    const jaExiste = usuarios.some(
      (item) => item.email?.toLowerCase() === emailLimpo
    );
    if (jaExiste) {
      return {
        sucesso: false,
        erro: "Este e-mail já está cadastrado no sistema.",
      };
    }

    const novoLocal = {
      id: `usr-${Date.now()}`,
      nome: nome.trim(),
      email: emailLimpo,
      papel: normalizarPapel(papel),
      status: "ativo",
      criadoEm: new Date().toISOString().split("T")[0],
      credencialHash: gerarHashContingencia(senha),
    };

    setUsuarios((atuais) => [...atuais, novoLocal]);
    return {
      sucesso: true,
      usuario: novoLocal,
    };
  }

  function alternarPapelUsuario(id) {
    const usuarioAlvo = usuarios.find((item) => item.id === id);

    if (
      !usuarioAlvo ||
      usuarioAlvo.email === usuario?.email ||
      usuarioAlvo.email?.toLowerCase() === ADMIN_PADRAO.email.toLowerCase()
    ) {
      return;
    }

    setUsuarios((atuais) =>
      atuais.map((item) =>
        item.id === id
          ? {
              ...item,
              papel: item.papel === "admin" ? "estudante" : "admin",
            }
          : item
      )
    );
  }

  function alternarStatusUsuario(id) {
    const usuarioAlvo = usuarios.find((item) => item.id === id);

    if (
      !usuarioAlvo ||
      usuarioAlvo.email === usuario?.email ||
      usuarioAlvo.email?.toLowerCase() === ADMIN_PADRAO.email.toLowerCase()
    ) {
      return;
    }

    setUsuarios((atuais) =>
      atuais.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "ativo" ? "bloqueado" : "ativo",
            }
          : item
      )
    );
  }

  function excluirUsuario(id) {
    if (usuario?.id === id) {
      return {
        sucesso: false,
        erro: "Você não pode excluir sua própria conta enquanto estiver logado.",
      };
    }

    const usuarioParaExcluir = usuarios.find((u) => u.id === id);
    if (
      usuarioParaExcluir?.email?.toLowerCase() ===
      ADMIN_PADRAO.email.toLowerCase()
    ) {
      return {
        sucesso: false,
        erro: "A conta principal do Administrador não pode ser excluída.",
      };
    }

    setUsuarios((atuais) => atuais.filter((item) => item.id !== id));

    return { sucesso: true };
  }

  const isAdmin = usuario?.papel === "admin";
  const autenticado = Boolean(usuario);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        usuarios,
        autenticado,
        isAdmin,
        login,
        logout,
        cadastrarUsuario,
        alternarPapelUsuario,
        alternarStatusUsuario,
        excluirUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }

  return contexto;
}
