import { Link, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import Atividades from "./pages/Atividades";
import AtividadeForm from "./pages/AtividadeForm";
import Configuracoes from "./pages/Configuracoes";
import EmBreve from "./pages/EmBreve";
import "./App.css";

function App() {
  return (
       <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/atividades" element={<Atividades />} />
        <Route path="/atividades/nova" element={<AtividadeForm />} />
        <Route path="/atividades/:id/editar" element={<AtividadeForm />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/materias" element={<EmBreve titulo="Matérias" />} />
        <Route path="/calendario" element={<EmBreve titulo="Calendário" />} />
        <Route path="/prioridades" element={<EmBreve titulo="Prioridades" />} />
        <Route path="/estatisticas" element={<EmBreve titulo="Estatísticas" />} />
      </Route>
    </Routes>
  );
}

export default App;