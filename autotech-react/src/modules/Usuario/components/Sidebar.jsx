import * as Icon from "../icons/Icons";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const navItems = [
  { id: "inicio",    label: "Inicio",        Icon: Icon.Home     },
  { id: "vehiculos", label: "Mis vehículos", Icon: Icon.Car      },
  { id: "citas",     label: "Mis citas",     Icon: Icon.Calendar },
  { id: "historial", label: "Historial",     Icon: Icon.Clock    },
  { id: "facturas",  label: "Facturas",      Icon: Icon.Receipt  },
  { id: "perfil",    label: "Perfil",        Icon: Icon.User     },
];

export default function Sidebar({ seccion, setSeccion, usuario }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  function handleLogout() {
    logout();
    navigate("/page/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        AUTO<span>TECH</span>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {usuario?.iniciales ?? "??"}
        </div>
        <div>
          <div className="sidebar-user-name">{usuario?.nombre ?? "Cargando..."}</div>
          <div className="sidebar-user-role">Cliente</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.id}
            onClick={() => setSeccion(item.id)}
            className={`nav-item${seccion === item.id ? " active" : ""}`}
          >
            <div className="nav-item-icon"><item.Icon /></div>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <div className="nav-item-icon"><Icon.LogOut /></div>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}