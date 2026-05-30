/* ══════════════════════════════════════════
   AUTOTECH — SECCIÓN VEHÍCULOS (USUARIO)
   sections/SecVehiculos.jsx
══════════════════════════════════════════ */
import { useState } from "react";
import * as Icon from "../icons/Icons";
import "./SecVehiculosU.css";

/* ── NOTA API ──────────────────────────────
   Props recibidas desde UsuarioApp:
     vehiculos → GET /api/usuarios/:id/vehiculos
     onAgregar → abre SlidePanel con ModalAgregarVehiculo

   Para eliminar un vehículo (botón futuro):
     DELETE /api/usuarios/:id/vehiculos/:vehiculoId
   Para editar un vehículo (botón futuro):
     PUT /api/usuarios/:id/vehiculos/:vehiculoId
────────────────────────────────────────── */

const colorMap = {
  blue:   { bg: "#dbeafe", accent: "#1d4ed8", dot: "#3b82f6" },
  orange: { bg: "#ffedd5", accent: "#c2410c", dot: "#f97316" },
  green:  { bg: "#dcfce7", accent: "#15803d", dot: "#22c55e" },
  red:    { bg: "#fee2e2", accent: "#b91c1c", dot: "#ef4444" },
  purple: { bg: "#ede9fe", accent: "#7c3aed", dot: "#a78bfa" },
};

function BadgeEstado({ estado }) {
  return (
    <span className={`svu-badge ${estado === "ok" ? "ok" : "warn"}`}>
      <span className="svu-badge-dot" />
      {estado === "ok" ? "Al día" : "Revisión pendiente"}
    </span>
  );
}

function AlertaKm({ km }) {
  if (km < 80000) return null;
  return (
    <div className="svu-alerta">
      <Icon.AlertTriangle />
      Supera 80,000 km — revisión preventiva recomendada
    </div>
  );
}

/* ── Panel lateral (slide-in) ───────────── */
function PanelDetalle({ vehiculo, onClose }) {
  if (!vehiculo) return null;
  const c = colorMap[vehiculo.colorWrap] || colorMap.blue;

  return (
    <>
      <div className="svu-overlay" onClick={onClose} />
      <aside className="svu-panel">
        {/* Encabezado del panel */}
        <div className="svu-panel-head" style={{ borderColor: c.dot }}>
          <div className="svu-panel-icon" style={{ background: c.bg, color: c.accent }}>
            {vehiculo.icono === "car" ? <Icon.Car /> : <Icon.Truck />}
          </div>
          <div className="svu-panel-head-info">
            <div className="svu-panel-nombre">{vehiculo.nombre}</div>
            <div className="svu-panel-placa">{vehiculo.placa} · {vehiculo.anio}</div>
          </div>
          <button className="svu-panel-close" onClick={onClose}>
            <Icon.X />
          </button>
        </div>

        {/* Estado */}
        <div className="svu-panel-estado">
          <BadgeEstado estado={vehiculo.estado} />
          <AlertaKm km={vehiculo.km} />
        </div>

        {/* Stats grid */}
        <div className="svu-panel-section-label">Información del vehículo</div>
        <div className="svu-panel-stats">
          <div className="svu-panel-stat">
            <span className="svu-panel-stat-label">Kilometraje</span>
            <span className={`svu-panel-stat-val${vehiculo.km >= 80000 ? " warn" : ""}`}>
              {vehiculo.km?.toLocaleString("es-CO")} km
            </span>
          </div>
          <div className="svu-panel-stat">
            <span className="svu-panel-stat-label">Combustible</span>
            <span className="svu-panel-stat-val">{vehiculo.combustible}</span>
          </div>
          <div className="svu-panel-stat">
            <span className="svu-panel-stat-label">Color</span>
            <span className="svu-panel-stat-val">{vehiculo.color}</span>
          </div>
          <div className="svu-panel-stat">
            <span className="svu-panel-stat-label">Año</span>
            <span className="svu-panel-stat-val">{vehiculo.anio}</span>
          </div>
        </div>

        {/* Último servicio */}
        <div className="svu-panel-section-label">Último servicio</div>
        <div className="svu-panel-servicio">
          {vehiculo.ultimoServicio ? (
            <>
              <div className="svu-panel-servicio-nombre">{vehiculo.ultimoServicio}</div>
              {/* ── NOTA API ──────────────────────────
                  fecha y taller vienen de:
                  GET /api/usuarios/:id/vehiculos/:vehiculoId/historial?limit=1
              ───────────────────────────────────── */}
              {vehiculo.fechaServicio && (
                <div className="svu-panel-servicio-fecha">{vehiculo.fechaServicio}</div>
              )}
            </>
          ) : (
            <div className="svu-panel-servicio-vacio">Sin registro de servicios</div>
          )}
        </div>

        {/* Acciones */}
        <div className="svu-panel-actions">
          <button className="svu-panel-btn-primary">
            <Icon.Plus /> Agendar servicio
          </button>
          <button className="svu-panel-btn-secondary">
            <Icon.Clock /> Ver historial
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Tarjeta de vehículo ────────────────── */
function CardVehiculo({ vehiculo, onSelect, isActive }) {
  const c = colorMap[vehiculo.colorWrap] || colorMap.blue;
  return (
    <div
      className={`svu-card${isActive ? " active" : ""}`}
      onClick={() => onSelect(vehiculo)}
      style={{ "--accent": c.dot, "--accent-bg": c.bg, "--accent-text": c.accent }}
    >
      {/* Barra lateral de color */}
      <div className="svu-card-stripe" />

      <div className="svu-card-inner">
        {/* Ícono + nombre */}
        <div className="svu-card-top">
          <div className="svu-card-icon">
            {vehiculo.icono === "car" ? <Icon.Car /> : <Icon.Truck />}
          </div>
          <BadgeEstado estado={vehiculo.estado} />
        </div>

        <div className="svu-card-nombre">{vehiculo.nombre}</div>
        <div className="svu-card-sub">{vehiculo.placa} · {vehiculo.anio}</div>

        {/* Métricas */}
        <div className="svu-card-metrics">
          <div className="svu-card-metric">
            <span className="svu-metric-label">KM</span>
            <span className={`svu-metric-val${vehiculo.km >= 80000 ? " warn" : ""}`}>
              {vehiculo.km?.toLocaleString("es-CO")}
            </span>
          </div>
          <div className="svu-card-metric-sep" />
          <div className="svu-card-metric">
            <span className="svu-metric-label">Combustible</span>
            <span className="svu-metric-val">{vehiculo.combustible}</span>
          </div>
          <div className="svu-card-metric-sep" />
          <div className="svu-card-metric">
            <span className="svu-metric-label">Color</span>
            <span className="svu-metric-val">{vehiculo.color}</span>
          </div>
        </div>

        <AlertaKm km={vehiculo.km} />

        {/* Último servicio */}
        <div className="svu-card-footer">
          <span className="svu-footer-label">Último servicio</span>
          <span className="svu-footer-val">{vehiculo.ultimoServicio ?? "Sin registro"}</span>
        </div>
      </div>

      {/* Flecha indicadora */}
      <div className="svu-card-arrow">
        <Icon.ChevronRight />
      </div>
    </div>
  );
}

/* ── Componente principal ───────────────── */
export default function SecVehiculos({ vehiculos, onAgregar }) {
  const [seleccionado, setSeleccionado] = useState(null);

  const handleSelect = (v) => {
    setSeleccionado(prev => (prev?.id === v.id ? null : v));
  };

  return (
    <div className="svu-root">
      {/* Header */}
      <div className="svu-header">
        <div>
          <div className="svu-title">
            <span className="svu-title-icon"><Icon.Car /></span>
            Mis Vehículos
          </div>
          <div className="svu-subtitle">
            {vehiculos.length > 0
              ? `${vehiculos.length} vehículo${vehiculos.length > 1 ? "s" : ""} registrado${vehiculos.length > 1 ? "s" : ""}`
              : "Sin vehículos en tu cuenta"}
          </div>
        </div>
        <button className="svu-btn-add" onClick={onAgregar}>
          <Icon.Plus />
          Agregar vehículo
        </button>
      </div>

      {/* Sin vehículos */}
      {vehiculos.length === 0 && (
        <div className="svu-empty">
          <div className="svu-empty-icon"><Icon.Car /></div>
          <div className="svu-empty-text">No tienes vehículos registrados.</div>
          <div className="svu-empty-sub">Agrega uno para comenzar a gestionar tus servicios.</div>
          <button className="svu-btn-add" onClick={onAgregar}>
            <Icon.Plus /> Agregar vehículo
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="svu-grid">
        {vehiculos.map((v, i) => (
          <CardVehiculo
            key={v.id ?? i}
            vehiculo={v}
            onSelect={handleSelect}
            isActive={seleccionado?.id === v.id}
          />
        ))}
      </div>

      {/* Panel lateral */}
      <PanelDetalle vehiculo={seleccionado} onClose={() => setSeleccionado(null)} />
    </div>
  );
}