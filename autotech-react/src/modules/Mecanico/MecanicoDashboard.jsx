// src/modules/Mecanico/MecanicoDashboard.jsx

import { useState, useEffect } from "react";
import "./MecanicoDashboard.css";
import { useAuth } from "../../context/AuthContext";
import {
  getMecanicoPerfil,
  getMecanicoOrdenes,
  getMecanicoVehiculos,
  getMecanicoObservaciones,
} from "../../services/mecanicoService";

import SecInicio        from "./sections/SecInicio";
import SecOrdenes       from "./sections/SecOrdenes";
import SecVehiculos     from "./sections/SecVehiculos";
import SecObservaciones from "./sections/SecObservaciones";

/* ── Ítems del menú lateral ── */
const navItems = [
  { label: "Inicio",              sec: "inicio",        icon: "bi-grid-1x2"        },
  { label: "Mis órdenes",         sec: "ordenes",       icon: "bi-clipboard-check" },
  { label: "Vehículos asignados", sec: "vehiculos",     icon: "bi-car-front"       },
  { label: "Observaciones",       sec: "observaciones", icon: "bi-chat-left-text"  },
];

export default function MecanicoDashboard() {
  const { user }  = useAuth();
  const idUsuario = user?.id;

  const [seccion,            setSeccion]            = useState("inicio");
  const [mecanico,           setMecanico]           = useState(null);
  const [ordenes,            setOrdenes]            = useState([]);
  const [vehiculosAsignados, setVehiculosAsignados] = useState([]);
  const [observaciones,      setObservaciones]      = useState([]);
  const [cargando,           setCargando]           = useState(true);
  const [errorGlobal,        setErrorGlobal]        = useState("");

  useEffect(() => {
    if (!idUsuario) return;
    setCargando(true);
    Promise.all([
      getMecanicoPerfil(idUsuario),
      getMecanicoOrdenes(idUsuario),
      getMecanicoVehiculos(idUsuario),
      getMecanicoObservaciones(idUsuario),
    ])
      .then(([perfil, ords, vehs, obs]) => {
        setMecanico(perfil);
        setOrdenes(ords);
        setVehiculosAsignados(vehs);
        setObservaciones(obs);
      })
      .catch(e => {
        console.error(e);
        setErrorGlobal("No se pudo cargar la información. Verifica tu conexión.");
      })
      .finally(() => setCargando(false));
  }, [idUsuario]);

  /* ── Estados de carga y error ── */
  if (cargando) return (
    <div className="at-loading-screen">
      <i className="bi bi-gear-fill spin"></i>
      <span>Cargando dashboard...</span>
    </div>
  );

  if (errorGlobal) return (
    <div className="at-loading-screen">
      <i className="bi bi-exclamation-triangle-fill" style={{ color: "#c62828" }}></i>
      <span>{errorGlobal}</span>
    </div>
  );

  if (!mecanico) return null;

  const tituloActual = navItems.find(n => n.sec === seccion)?.label || "Inicio";

  return (
    <div className="at-layout">

      {/* ── SIDEBAR ── */}
      <aside className="at-sidebar">
        <div className="at-brand">AUTO<span>TECH</span></div>
        <div className="at-user-info">
          <div className="at-avatar">{mecanico.iniciales}</div>
          <div>
            <div className="at-user-name">{mecanico.nombre}</div>
            <div className="at-user-role">{mecanico.especialidad}</div>
          </div>
        </div>
        <nav className="at-nav">
          {navItems.map(item => (
            <button
              key={item.sec}
              className={`at-nav-item ${seccion === item.sec ? "active" : ""}`}
              onClick={() => setSeccion(item.sec)}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="at-sidebar-footer">
          <i className="bi bi-box-arrow-left"></i> Cerrar sesión
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="at-main">
        <div className="at-topbar">
          <span className="at-page-title">{tituloActual}</span>
          <span className="at-role-badge">Mecánico</span>
        </div>
        <div className="at-content">

          {seccion === "inicio" && (
            <SecInicio
              mecanico={mecanico}
              ordenes={ordenes}
              setSeccion={setSeccion}
            />
          )}

          {seccion === "ordenes" && (
            <SecOrdenes ordenes={ordenes} />
          )}

          {seccion === "vehiculos" && (
            <SecVehiculos vehiculosAsignados={vehiculosAsignados} />
          )}

          {seccion === "observaciones" && (
            <SecObservaciones
              idUsuario={idUsuario}
              ordenes={ordenes}
              observaciones={observaciones}
              setObservaciones={setObservaciones}
            />
          )}

        </div>
      </div>

    </div>
  );
}