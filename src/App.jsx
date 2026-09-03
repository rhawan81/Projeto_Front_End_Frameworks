import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import RotaProtegida from "./auth/RotaProtegida";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Atividades from "./pages/Atividades";
import AtividadeForm from "./pages/AtividadeForm";
import Configuracoes from "./pages/Configuracoes";
import EmBreve from "./pages/EmBreve";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Rota pública de Login */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas (exigem que o usuário esteja logado) */}
      <Route
        element={
          <RotaProtegida>
            <AppLayout />
          </RotaProtegida>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/atividades" element={<Atividades />} />
        <Route path="/atividades/nova" element={<AtividadeForm />} />
        <Route path="/atividades/:id/editar" element={<AtividadeForm />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        
        {/* Rota administrativa exclusiva para perfil de Administrador (ADM) */}
        <Route
          path="/admin"
          element={
            <RotaProtegida somenteAdmin>
              <Admin />
            </RotaProtegida>
          }
        />

        {/* Páginas secundárias / recursos futuros */}
        <Route path="/materias" element={<EmBreve titulo="Matérias" />} />
        <Route path="/calendario" element={<EmBreve titulo="Calendário" />} />
        <Route path="/prioridades" element={<EmBreve titulo="Prioridades" />} />
        <Route path="/estatisticas" element={<EmBreve titulo="Estatísticas" />} />
      </Route>

      {/* Rota coringa: redireciona para a raiz */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;