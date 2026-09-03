import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useToast } from "../toast/ToastContext";

/**
 * Componente guardião de rotas.
 * - Redireciona para /login se o usuário não estiver autenticado.
 * - Redireciona para / se a rota exigir perfil de administrador e o usuário for estudante.
 */
export default function RotaProtegida({ somenteAdmin = false, children }) {
  const { autenticado, isAdmin } = useAuth();
  const { mostrarToast } = useToast();

  useEffect(() => {
    if (autenticado && somenteAdmin && !isAdmin) {
      mostrarToast("Acesso restrito: esta página é exclusiva para Administradores.", "aviso");
    }
  }, [autenticado, somenteAdmin, isAdmin, mostrarToast]);

  // Se não estiver logado, redireciona para a tela de login
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // Se a rota for restrita a administradores e o usuário for estudante, volta para o dashboard
  if (somenteAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Se foram passados filhos diretos, renderiza-os; caso contrário, renderiza o Outlet do React Router
  return children ? children : <Outlet />;
}
