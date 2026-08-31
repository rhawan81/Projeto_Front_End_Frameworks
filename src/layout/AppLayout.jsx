import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BarraInferior from "./BarraInferior";
import Topbar from "./Topbar";

function AppLayout() {
    return (
        <div className="app-shell">
            <Sidebar />
            <div className="app-conteudo">
                <Topbar />
                <main>
                    <Outlet />
                </main>
            </div>
            <BarraInferior />
        </div>
    );
}

export default AppLayout;