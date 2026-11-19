
import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import RotaProtegida from "./auth/RotaProtegida";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Atividades from "./pages/Atividades";
import AtividadeForm from "./pages/AtividadeForm";
import Configuracoes from "./pages/Configuracoes";
import Pomodoro from "./pages/Pomodoro";
import EmBreve from "./pages/EmBreve";
import Materias from "./pages/materias";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Rota pública de Login */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas */}
      <Route
        element={
          <RotaProtegida>
            <AppLayout />
          </RotaProtegida>
        }
      >
        <Route path="/" element={<Home />} />

        {/* Dashboard integrado à API */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/atividades" element={<Atividades />} />
        <Route path="/atividades/nova" element={<AtividadeForm />} />
        <Route path="/atividades/:id/editar" element={<AtividadeForm />} />

        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/configuracoes" element={<Configuracoes />} />

        {/* Rota administrativa */}
        <Route
          path="/admin"
          element={
            <RotaProtegida somenteAdmin>
              <Admin />
            </RotaProtegida>
          }
        />

        {/* Matérias */}
        <Route path="/materias" element={<Materias />} />

        {/* Páginas secundárias */}
        <Route path="/calendario" element={<EmBreve titulo="Calendário" />} />
        <Route path="/prioridades" element={<EmBreve titulo="Prioridades" />} />
        <Route path="/estatisticas" element={<EmBreve titulo="Estatísticas" />} />
      </Route>

      {/* Rota coringa */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;