import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../services/http";

// Chaves para persistência no localStorage (nenhuma senha em texto puro é armazenada)
const CHAVE_SESSAO = "organizador-estudos:auth";
const CHAVE_USUARIOS = "organizador-estudos:usuarios";

// Função utilitária determinística para verificar credencial em modo contingência sem guardar senha em texto puro
function gerarHashContingencia(texto) {
  const str = String(texto || "");
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

// Hashes pré-calculados para contingência offline (sem senhas em texto puro no código ou no localStorage)
const HASH_PERFIL_ADMIN = "2651f8bc";
const HASH_PERFIL_ESTUDANTE = "cf0bc6c5";

// Perfil padrão do Administrador do sistema (sem campo senha)
export const ADMIN_PADRAO = {
  id: "usr-admin",
  nome: "Prof. Henrique (ADM)",
  email: "admin@estudos.com",
  papel: "admin",
  status: "ativo",
  criadoEm: "2026-08-01",
  credencialHash: HASH_PERFIL_ADMIN,
};

// Lista inicial de usuários de contingência (Integrantes da equipe do projeto, sem senhas em texto puro)
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

function sanitizarUsuarioParaStorage(u) {
  const { senha: _senhaRemovida, ...resto } = u || {};
  return {
    ...resto,
    credencialHash:
      resto.credencialHash ||
      (resto.papel === "admin" ? HASH_PERFIL_ADMIN : HASH_PERFIL_ESTUDANTE),
  };
}

function sanitizarSessao(u, token = null) {
  return {
    id: u.id || `usr-${Date.now()}`,
    nome: u.nome || u.name || "Estudante",
    email: u.email,
    papel:
      String(u.papel || u.role || "estudante").toLowerCase() === "admin"
        ? "admin"
        : "estudante",
    status: String(u.status || "ativo").toLowerCase(),
    criadoEm: u.criadoEm || new Date().toISOString().split("T")[0],
    ...(token || u.token ? { token: token || u.token } : {}),
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Usuários cadastrados no sistema (sanitizados para nunca guardar senha em texto puro)
  const [usuarios, setUsuarios] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_USUARIOS);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed)) {
          const sanitizados = parsed.map(sanitizarUsuarioParaStorage);
          const indexAdmin = sanitizados.findIndex(
            (u) => u.email?.toLowerCase() === ADMIN_PADRAO.email.toLowerCase()
          );
          if (indexAdmin >= 0) {
            sanitizados[indexAdmin] = {
              ...sanitizados[indexAdmin],
              ...ADMIN_PADRAO,
            };
            return sanitizados;
          }
          return [ADMIN_PADRAO, ...sanitizados];
        }
      }
    } catch {
      // Caso ocorra erro de parse, retorna padrão
    }
    const iniciais = USUARIOS_INICIAIS.map(sanitizarUsuarioParaStorage);
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(iniciais));
    return iniciais;
  });

  // Usuário atualmente autenticado (sem senha)
  const [usuario, setUsuario] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_SESSAO);
      if (!salvo) return null;
      const parsed = JSON.parse(salvo);
      return parsed ? sanitizarSessao(parsed) : null;
    } catch {
      return null;
    }
  });

  // Sincroniza a lista de usuários sanitizados no localStorage
  useEffect(() => {
    localStorage.setItem(
      CHAVE_USUARIOS,
      JSON.stringify(usuarios.map(sanitizarUsuarioParaStorage))
    );
  }, [usuarios]);

  // Sincroniza a sessão ativa no localStorage (sem armazenar senha)
  useEffect(() => {
    if (usuario) {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sanitizarSessao(usuario)));
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

  // Autentica usuário tentando primeiro o endpoint da API REST e usando contingência local caso o servidor esteja indisponível
  async function login(email, senha) {
    const emailLimpo = email.trim().toLowerCase();
    const hashDigitado = gerarHashContingencia(senha);

    // 1. Tenta autenticar via API REST (/auth/login)
    try {
      const respostaApi = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: emailLimpo, senha }),
      });

      if (respostaApi) {
        const dadosUsuarioApi = respostaApi.usuario || respostaApi.user || respostaApi;
        const dadosSessao = sanitizarSessao(
          { ...dadosUsuarioApi, email: dadosUsuarioApi.email || emailLimpo },
          respostaApi.token
        );
        setUsuario(dadosSessao);
        return { sucesso: true, usuario: dadosSessao, origem: "api" };
      }
    } catch (erro) {
      // Se o endpoint /auth/login existir e retornar 403 explícito de conta bloqueada, rejeita
      if (erro.status === 403) {
        return {
          sucesso: false,
          erro: erro.message || "Acesso negado (403).",
        };
      }
      // Caso o servidor esteja offline ou /auth/login não esteja mapeado no SecurityConfig, valida pela contingência local
    }

    // 2. Contingência local
    if (emailLimpo === ADMIN_PADRAO.email.toLowerCase()) {
      if (hashDigitado !== HASH_PERFIL_ADMIN) {
        return { sucesso: false, erro: "Credenciais inválidas. Verifique sua senha." };
      }

      const adminAtual =
        usuarios.find((u) => u.email.toLowerCase() === emailLimpo) || ADMIN_PADRAO;

      const dadosSessao = sanitizarSessao({
        ...adminAtual,
        email: ADMIN_PADRAO.email,
        papel: "admin",
        status: "ativo",
      });

      setUsuario(dadosSessao);
      return { sucesso: true, usuario: dadosSessao, origem: "contingencia" };
    }

    const encontrado = usuarios.find(
      (u) => u.email.toLowerCase() === emailLimpo
    );

    if (!encontrado) {
      return {
        sucesso: false,
        erro: "Usuário não encontrado. Verifique o e-mail informado.",
      };
    }

    const hashEsperado = encontrado.credencialHash || HASH_PERFIL_ESTUDANTE;
    if (hashDigitado !== hashEsperado) {
      return {
        sucesso: false,
        erro: "Credenciais inválidas. Verifique sua senha.",
      };
    }

    if (encontrado.status === "bloqueado") {
      return {
        sucesso: false,
        erro: "Acesso negado (403): sua conta está suspensa pelo Administrador.",
      };
    }

    const dadosSessao = sanitizarSessao(encontrado);
    setUsuario(dadosSessao);
    return { sucesso: true, usuario: dadosSessao, origem: "contingencia" };
  }

  // Encerra a sessão removendo os dados do localStorage
  function logout() {
    setUsuario(null);
  }

  // Cadastro de novo usuário (tenta via API e mantém contingência local sem salvar senha em texto puro)
  async function cadastrarUsuario({ nome, email, senha, papel = "estudante" }) {
    const emailNormalizado = email.trim().toLowerCase();
    const existente = usuarios.some(
      (u) => u.email.toLowerCase() === emailNormalizado
    );

    if (existente) {
      return {
        sucesso: false,
        erro: "Este e-mail já está cadastrado no sistema.",
      };
    }

    let idCriado = `usr-${Date.now()}`;

    try {
      const criadoApi = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nome: nome.trim(),
          email: emailNormalizado,
          senha,
          papel,
        }),
      });
      if (criadoApi?.id) {
        idCriado = criadoApi.id;
      }
    } catch (erro) {
      if (erro.status === 400 || erro.status === 409) {
        return { sucesso: false, erro: erro.message };
      }
      // Prossegue em modo contingência caso o servidor esteja offline
    }

    const novo = {
      id: idCriado,
      nome: nome.trim(),
      email: emailNormalizado,
      papel,
      status: "ativo",
      criadoEm: new Date().toISOString().split("T")[0],
      credencialHash: gerarHashContingencia(senha),
    };

    setUsuarios((atuais) => [...atuais, novo]);
    return { sucesso: true, usuario: sanitizarSessao(novo) };
  }

  // Alterna permissão de administrador
  function alternarPapelUsuario(id) {
    const usuarioAlvo = usuarios.find((u) => u.id === id);
    if (usuarioAlvo?.email?.toLowerCase() === ADMIN_PADRAO.email.toLowerCase()) {
      return;
    }

    setUsuarios((atuais) =>
      atuais.map((u) => {
        if (u.id !== id) return u;
        const novoPapel = u.papel === "admin" ? "estudante" : "admin";

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
      return;
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
