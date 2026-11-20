
import { createContext, useContext, useEffect, useState } from "react";
import {
  autenticarUsuario,
  registrarUsuario,
} from "../services/api";

const CHAVE_SESSAO = "organizador-estudos:auth";
const CHAVE_USUARIOS = "organizador-estudos:usuarios";

const AuthContext = createContext(null);

// Padroniza o perfil recebido do backend para o frontend
function normalizarPapel(papel) {
  return String(papel || "").toUpperCase() === "ADMIN"
    ? "admin"
    : "estudante";
}

// Remove dados antigos de senha que possam estar salvos no navegador
function limparUsuario(usuario) {
  if (!usuario) return null;

  const { senha, password, ...dados } = usuario;

  return {
    ...dados,
    papel: normalizarPapel(dados.papel),
    status: dados.status || "ativo",
  };
}

export function AuthProvider({ children }) {
  const [usuarios, setUsuarios] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_USUARIOS);
      const lista = salvo ? JSON.parse(salvo) : [];

      return Array.isArray(lista) ? lista.map(limparUsuario) : [];
    } catch {
      return [];
    }
  });

  const [usuario, setUsuario] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_SESSAO);

      if (!salvo) return null;

      const sessao = JSON.parse(salvo);

      if (!sessao.token) return null;

      return limparUsuario(sessao);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    if (usuario?.token) {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(CHAVE_SESSAO);
    }
  }, [usuario]);

  // Login utilizando o backend Spring Boot
  async function login(email, senha) {
    try {
      const resposta = await autenticarUsuario(
        email.trim().toLowerCase(),
        senha
      );

      if (!resposta?.token) {
        return {
          sucesso: false,
          erro: "O backend não retornou o token de autenticação.",
        };
      }

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
      };
    } catch (erro) {
      return {
        sucesso: false,
        erro: erro.message || "Não foi possível realizar o login.",
      };
    }
  }

  // Encerra a sessão
  function logout() {
    setUsuario(null);
  }

  // Cadastro utilizando o backend Spring Boot
  async function cadastrarUsuario({ nome, email, senha }) {
    try {
      const resposta = await registrarUsuario({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
      });

      const novoUsuario = {
        id: resposta.usuarioId,
        nome: resposta.nome || nome.trim(),
        email: resposta.email || email.trim().toLowerCase(),
        papel: normalizarPapel(resposta.papel || "ESTUDANTE"),
        status: "ativo",
        criadoEm: new Date().toISOString().split("T")[0],
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
      return {
        sucesso: false,
        erro: erro.message || "Não foi possível realizar o cadastro.",
      };
    }
  }

  // As funções administrativas abaixo ainda atuam na lista local.
  // A integração delas com endpoints administrativos será uma próxima etapa.

  function alternarPapelUsuario(id) {
    const usuarioAlvo = usuarios.find((item) => item.id === id);

    if (!usuarioAlvo || usuarioAlvo.email === usuario?.email) return;

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

    if (!usuarioAlvo || usuarioAlvo.email === usuario?.email) return;

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

    setUsuarios((atuais) => atuais.filter((item) => item.id !== id));

    return { sucesso: true };
  }

  const isAdmin = usuario?.papel === "admin";
  const autenticado = Boolean(usuario?.token);

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
    throw new Error(
      "useAuth deve ser utilizado dentro de um AuthProvider"
    );
  }

  return contexto;
}
