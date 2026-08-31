import { NavLink } from "react-router-dom";
import { IconeGrade, IconeLista, IconeEngrenagem } from "../icons";

// Navegação usada só em telas pequenas (celular), no lugar da sidebar
function BarraInferior() {
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
            <NavLink to="/configuracoes" className='item-inferior'>
                <IconeEngrenagem />
                Ajustes
            </NavLink>
        </nav>
    );
}

export default BarraInferior;