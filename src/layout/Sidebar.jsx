import { NavLink } from "react-router-dom";
import { IconeGrade, IconeLista, IconeEngrenagem } from "../icons";

const itensPrincipais = [
    { to: "/", label: "Dashboard", icone: IconeGrade, fim: true },
    { to: "/atividades", label: "Atividades", icone: IconeLista },
];

const itensExtras = [
    { to: "/materias", label: "Matérias" },
    { to: "/calendario", label: "Calendário" },
    { to: "/prioridades", label: "Prioridades" },
    { to: "/estatisticas", label: "Estatísticas" },
];

function Sidebar() {
  return (
    <aside className="barra-lateral">
      <div className="marca-sidebar">
        <span className="marca-icone">📘</span>
        <div>
          <strong>Organizador</strong>
          <span>de Estudos</span>
        </div>
      </div>

      <nav>
        {itensPrincipais.map(({ to, label, icone: Icone, fim}) => (
            <NavLink key={to} to={to} end={fim} className="item-nav">
                <Icone />
                {label}
            </NavLink>
        ))}

        <div className="separador-nav">Em Breve</div>

        {itensExtras.map(({ to, label }) => (
            <NavLink key={to} to={to} className="item-nav item-nav-extra">
                <span className="ponto-extra" />
                {label}
                </NavLink>
        ))}

        <NavLink to="/configuracoes" className="item-nav">
         <IconeEngrenagem />
            Configurações
        </NavLink>
      </nav>

      <div className="rodape-sidebar">
        <span className="avatar">E</span>
        <div>
          <strong>Emilly</strong>
          <span>ver perfil</span>
        </div>
      </div>
        </aside>
    );
}

export default Sidebar;