/* ══════════════════════════════════════════
   AUTOTECH — HEADER / TOPBAR
   components/Header.jsx
══════════════════════════════════════════ */
import "./Header.css";

const titulos = {
  inicio:    "Inicio",
  vehiculos: "Mis Vehículos",
  citas:     "Mis Citas",
  historial: "Historial",
  facturas:  "Facturas",
  perfil:    "Perfil",
};

export default function Header({ seccion }) {
  return (
    <div className="topbar">
      <span className="topbar-title">{titulos[seccion] ?? "Panel"}</span>
      <span className="topbar-badge">Cliente</span>
    </div>
  );
}