import { createContext, useContext, useEffect, useState } from "react";

// Chaves para persistência no localStorage
const CHAVE_SESSAO = "organizador-estudos:auth";
const CHAVE_USUARIOS = "organizador-estudos:usuarios";

// Credenciais fixas do Administrador do sistema
export const ADMIN_PADRAO = {
  id: "usr-admin",
  nome: "Prof. Henrique (ADM)",
  email: "admin@estudos.com",
  senha: "admin123", // Senha fixa do administrador
  papel: "admin",
  status: "ativo",
  criadoEm: "2026-08-01",
};

// Lista inicial de estudantes pré-cadastrados (Integrantes da equipe do projeto)
const USUARIOS_INICIAIS = [
  ADMIN_PADRAO,
  {
    id: "usr-2",
    nome: "Emilly Silva",
    email: "emilly@estudos.com",
    senha: "aluno123",
    papel: "estudante",
    status: "ativo",
    criadoEm: "2026-08-10",
  },
  {
    id: "usr-3",
    nome: "Michel Santos",
    email: "michel@estudos.com",
    senha: "aluno123",
    papel: "estudante",
    status: "ativo",
    criadoEm: "2026-08-15",
  },
  {
    id: "usr-4",
    nome: "Mylena Oliveira",
    email: "mylena@estudos.com",
    senha: "aluno123",
    papel: "estudante",
    status: "ativo",
    criadoEm: "2026-08-20",
  },
  {
    id: "usr-5",
    nome: "Aluno Teste",
    email: "aluno@estudos.com",
    senha: "aluno123",
    papel: "estudante",
    status: "ativo",
    criadoEm: "2026-08-25",
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Usuários cadastrados no sistema
  const [usuarios, setUsuarios] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_USUARIOS);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed)) {
          // Garante que o admin fixo esteja presente com a senha correta e papel ativo
          const indexAdmin = parsed.findIndex(
            (u) => u.email?.toLowerCase() === ADMIN_PADRAO.email.toLowerCase()
          );
          if (indexAdmin >= 0) {
            parsed[indexAdmin] = {
              ...parsed[indexAdmin],
              ...ADMIN_PADRAO,
            };
            return parsed;
          }
          return [ADMIN_PADRAO, ...parsed];
        }
      }
    } catch {
      // Caso ocorra erro de parse, retorna padrão
    }
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(USUARIOS_INICIAIS));
    return USUARIOS_INICIAIS;
  });

  // Usuário atualmente autenticado
  const [usuario, setUsuario] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_SESSAO);
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  // Sincroniza a lista de usuários no LocalStorage sempre que for alterada
  useEffect(() => {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
  }, [usuarios]);

  // Sincroniza a sessão ativa no LocalStorage
  useEffect(() => {
    if (usuario) {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(CHAVE_SESSAO);
    }
  }, [usuario]);

  // Função para autenticar usuário por e-mail e senha
  function login(email, senha) {
    const emailLimpo = email.trim().toLowerCase();

    // Verificação prioritária do Administrador com senha fixa
    if (emailLimpo === ADMIN_PADRAO.email.toLowerCase()) {
      if (senha !== ADMIN_PADRAO.senha) {
        return { sucesso: false, erro: "Senha incorreta. Tente novamente." };
      }

      const adminAtual = usuarios.find(
        (u) => u.email.toLowerCase() === emailLimpo
      ) || ADMIN_PADRAO;

      const dadosSessao = {
        id: adminAtual.id || ADMIN_PADRAO.id,
        nome: adminAtual.nome || ADMIN_PADRAO.nome,
        email: ADMIN_PADRAO.email,
        papel: "admin",
        status: "ativo",
        criadoEm: adminAtual.criadoEm || ADMIN_PADRAO.criadoEm,
      };

      setUsuario(dadosSessao);
      return { sucesso: true, usuario: dadosSessao };
    }

    const encontrado = usuarios.find(
      (u) => u.email.toLowerCase() === emailLimpo
    );

    if (!encontrado) {
      return { sucesso: false, erro: "Usuário não encontrado. Verifique o e-mail." };
    }

    if (encontrado.senha !== senha) {
      return { sucesso: false, erro: "Senha incorreta. Tente novamente." };
    }

    if (encontrado.status === "bloqueado") {
      return {
        sucesso: false,
        erro: "Sua conta foi suspensa temporariamente pelo Administrador.",
      };
    }

    // Cria cópia segura (sem expor a senha no estado da sessão ativa)
    const dadosSessao = {
      id: encontrado.id,
      nome: encontrado.nome,
      email: encontrado.email,
      papel: encontrado.papel,
      status: encontrado.status,
      criadoEm: encontrado.criadoEm,
    };
    setUsuario(dadosSessao);
    return { sucesso: true, usuario: dadosSessao };
  }

  // Encerra a sessão
  function logout() {
    setUsuario(null);
  }

  // Cadastro de novo usuário
  function cadastrarUsuario({ nome, email, senha, papel = "estudante" }) {
    const emailNormalizado = email.trim().toLowerCase();
    const existente = usuarios.some(
      (u) => u.email.toLowerCase() === emailNormalizado
    );

    if (existente) {
      return { sucesso: false, erro: "Este e-mail já está cadastrado no sistema." };
    }

    const novo = {
      id: `usr-${Date.now()}`,
      nome: nome.trim(),
      email: emailNormalizado,
      senha,
      papel,
      status: "ativo",
      criadoEm: new Date().toISOString().split("T")[0],
    };

    setUsuarios((atuais) => [...atuais, novo]);
    return { sucesso: true, usuario: novo };
  }

  // Alterna permissão de administrador
  function alternarPapelUsuario(id) {
    const usuarioAlvo = usuarios.find((u) => u.id === id);
    if (usuarioAlvo?.email?.toLowerCase() === ADMIN_PADRAO.email.toLowerCase()) {
      return; // A conta mestre do Administrador mantém sempre o perfil admin
    }

    setUsuarios((atuais) =>
      atuais.map((u) => {
        if (u.id !== id) return u;
        const novoPapel = u.papel === "admin" ? "estudante" : "admin";
        
        // Se for o próprio usuário logado, atualiza também a sessão ativa
        if (usuario?.id === id) {
          setUsuario((antigo) => ({ ...antigo, papel: novoPapel }));
        }

        return { ...u, papel: novoPapel };
      })
    );
  }

  // Bloquear / Desbloquear usuário
  function alternarStatusUsuario(id) {
    const usuarioAlvo = usuarios.find((u) => u.id === id);
    if (usuarioAlvo?.email?.toLowerCase() === ADMIN_PADRAO.email.toLowerCase()) {
      return; // A conta mestre do Administrador não pode ser bloqueada
    }

    setUsuarios((atuais) =>
      atuais.map((u) => {
        if (u.id !== id) return u;
        const novoStatus = u.status === "ativo" ? "bloqueado" : "ativo";
        return { ...u, status: novoStatus };
      })
    );
  }

  // Excluir usuário do sistema
  function excluirUsuario(id) {
    if (usuario?.id === id) {
      return { sucesso: false, erro: "Você não pode excluir sua própria conta enquanto estiver logado." };
    }
    const usuarioParaExcluir = usuarios.find((u) => u.id === id);
    if (usuarioParaExcluir?.email?.toLowerCase() === ADMIN_PADRAO.email.toLowerCase()) {
      return { sucesso: false, erro: "A conta principal do Administrador não pode ser excluída." };
    }
    setUsuarios((atuais) => atuais.filter((u) => u.id !== id));
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

// Hook personalizado para consumir o contexto de autenticação com segurança
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return contexto;
}
