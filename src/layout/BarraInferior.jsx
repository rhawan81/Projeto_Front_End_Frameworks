import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { IconeGrade, IconeLista, IconeEngrenagem, IconeEscudo } from "../icons";

// Navegação usada em telas pequenas (celular), no lugar da sidebar
function BarraInferior() {
  const { isAdmin } = useAuth();

  return (
    <nav className="barra-inferior">
      <NavLink to="/" end className="item-inferior">
        <IconeGrade />
        Início
      </NavLink>
      <NavLink to="/atividades" className="item-inferior">
        <IconeLista />
        Atividades
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin" className="item-inferior">
          <IconeEscudo />
          ADM
        </NavLink>
      )}
      <NavLink to="/configuracoes" className="item-inferior">
        <IconeEngrenagem />
        Ajustes
      </NavLink>
    </nav>
  );
}

export default BarraInferior;