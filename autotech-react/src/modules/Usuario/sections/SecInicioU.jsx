/* ══════════════════════════════════════════
   AUTOTECH — SECCIÓN INICIO (REDISEÑADA)
   sections/SecInicio.jsx
══════════════════════════════════════════ */
import { useState, useEffect } from "react";
import * as Icon from "../icons/Icons";
import "./SecInicio.css";

const MESES_FULL = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];
const DIAS_SEMANA = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches";
}

function getDateLabel() {
  const d = new Date();
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES_FULL[d.getMonth()]} de ${d.getFullYear()}`;
}

/* ── MODAL ── */
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="si-modal-overlay" onClick={onClose}>
      <div className="si-modal" onClick={(e) => e.stopPropagation()}>
        <div className="si-modal-header">
          <h3 className="si-modal-title">{title}</h3>
          <button className="si-modal-close" onClick={onClose}>
            <Icon.X />
          </button>
        </div>
        <div className="si-modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ── BADGE ── */
function Badge({ estado }) {
  return (
    <span className={`si-badge si-badge-${estado}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}

/* ── ALERTA KM ── */
function AlertaKm({ km }) {
  if (km < 80000) return null;
  return (
    <div className="si-alerta-km">
      <Icon.AlertTriangle />
      Supera 80,000 km — revisión preventiva recomendada
    </div>
  );
}

/* ── STAT CARD ANIMADA ── */
function StatCard({ icono: Icono, label, value, color, bg, onClick }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const step = Math.ceil(value / 20);
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(interval); }
      else setCount(start);
    }, 40);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="si-stat-card" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className="si-stat-icon" style={{ background: bg, color }}>
        <Icono />
      </div>
      <div className="si-stat-info">
        <span className="si-stat-value">{count}</span>
        <span className="si-stat-label">{label}</span>
      </div>
      <div className="si-stat-chevron" style={{ color }}>›</div>
    </div>
  );
}

/* ══ COMPONENTE PRINCIPAL ══ */
export default function SecInicio({ vehiculos, citas, setSeccion, usuario }) {
  const [modal, setModal] = useState(null); // null | 'citas' | 'vehiculos' | 'ia'

  const pendientes  = citas.filter(c => c.estado === "pendiente").length;
  const completadas = citas.filter(c => c.estado === "completada").length;
  const proximas    = citas.filter(c => c.estado === "pendiente" || c.estado === "confirmada");

  const stats = [
    { icono: Icon.Car,      bg: "#e8f0fe", color: "#1a6bdc", label: "Vehículos",           value: vehiculos.length, sec: "vehiculos" },
    { icono: Icon.Calendar, bg: "#fff3e0", color: "#e65100", label: "Citas pendientes",     value: pendientes,       sec: "citas"     },
    { icono: Icon.Wrench,   bg: "#e8f5e9", color: "#2e7d32", label: "Servicios realizados", value: completadas,      sec: null        },
    { icono: Icon.Bot,      bg: "#f3e5f5", color: "#6a1b9a", label: "Consultas IA",         value: 0,                sec: "consultaIA"},
  ];

  const acciones = [
    { icono: Icon.Calendar, label: "Nueva cita",      color: "#1a6bdc", bg: "#e8f0fe", action: () => setModal("nuevaCita") },
    { icono: Icon.Car,      label: "Mis vehículos",   color: "#2e7d32", bg: "#e8f5e9", action: () => setSeccion("vehiculos") },
    { icono: Icon.Bot,      label: "Consultar IA",    color: "#6a1b9a", bg: "#f3e5f5", action: () => setModal("ia") },
    { icono: Icon.Clock,    label: "Ver historial",   color: "#e65100", bg: "#fff3e0", action: () => setSeccion("historial") },
  ];

  return (
    <div className="si-wrapper">

      {/* ── HERO BANNER ── */}
      <div className="si-hero">
        <div className="si-hero-bg" />
        <div className="si-hero-content">
          <p className="si-hero-sub">{getGreeting()} · {getDateLabel()}</p>
          <h1 className="si-hero-title">
            Hola, <span>{usuario?.nombre?.split(" ")[0] ?? "Usuario"}</span> <i className="bi bi-person-circle si-hero-icon" />
          </h1>
          <p className="si-hero-desc">Gestiona tus vehículos y citas desde aquí.</p>
          <button className="si-hero-btn" onClick={() => setModal("nuevaCita")}>
            <Icon.Calendar /> Agendar cita
          </button>
        </div>
        <div className="si-hero-deco">
          <div className="si-hero-circle c1" />
          <div className="si-hero-circle c2" />
          <div className="si-hero-circle c3" />
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="si-stats">
        {stats.map((s, i) => (
          <StatCard
            key={i}
            icono={s.icono}
            label={s.label}
            value={s.value}
            color={s.color}
            bg={s.bg}
            onClick={s.sec ? () => setSeccion(s.sec) : null}
          />
        ))}
      </div>

      {/* ── ACCIONES RÁPIDAS ── */}
      <div className="si-section-header">
        <span className="si-section-title">Acciones rápidas</span>
      </div>
      <div className="si-acciones">
        {acciones.map((a, i) => (
          <button
            key={i}
            className="si-accion"
            style={{ "--c": a.color, "--bg": a.bg }}
            onClick={a.action}
          >
            <div className="si-accion-icon"><a.icono /></div>
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* ── GRID 2 COL ── */}
      <div className="si-grid2">

        {/* Próximas citas */}
        <div className="si-panel">
          <div className="si-panel-header">
            <span className="si-panel-title"><Icon.Calendar /> Próximas citas</span>
            <button className="si-ver-mas" onClick={() => setSeccion("citas")}>Ver todas →</button>
          </div>
          {proximas.length === 0 ? (
            <div className="si-empty">
              <Icon.Calendar />
              <p>Sin citas próximas</p>
              <button className="si-empty-btn" onClick={() => setModal("nuevaCita")}>Agendar ahora</button>
            </div>
          ) : (
            proximas.slice(0, 3).map((c, i) => (
              <div key={i} className="si-item">
                <div className="si-item-dot" style={{ background: c.estado === "confirmada" ? "#2e7d32" : "#1a6bdc" }} />
                <div className="si-item-body">
                  <p className="si-item-title">{c.servicio}</p>
                  <p className="si-item-meta">{c.dia} {c.mes} · {c.hora} · {c.vehiculo}</p>
                </div>
                <Badge estado={c.estado} />
              </div>
            ))
          )}
        </div>

        {/* Mis vehículos */}
        <div className="si-panel">
          <div className="si-panel-header">
            <span className="si-panel-title"><Icon.Car /> Mis vehículos</span>
            <button className="si-ver-mas" onClick={() => setSeccion("vehiculos")}>Ver todos →</button>
          </div>
          {vehiculos.length === 0 ? (
            <div className="si-empty">
              <Icon.Car />
              <p>Sin vehículos registrados</p>
              <button className="si-empty-btn" onClick={() => setSeccion("vehiculos")}>Agregar vehículo</button>
            </div>
          ) : (
            vehiculos.map((v, i) => (
              <div key={i} className="si-item si-item--veh">
                <div className="si-veh-icon"><Icon.Car /></div>
                <div className="si-item-body">
                  <p className="si-item-title">{v.nombre}</p>
                  <p className="si-item-meta">{v.placa} · {v.anio}</p>
                  <AlertaKm km={v.km} />
                </div>
                <span className="si-veh-km">{v.km?.toLocaleString("es-CO")} km</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ══ MODALES ══ */}

      {/* Modal: Nueva cita */}
      {modal === "nuevaCita" && (
        <Modal title="Agendar nueva cita" onClose={() => setModal(null)}>
          <div className="si-form">
            <div className="si-form-group">
              <label>Servicio</label>
              <select>
                <option>Cambio de aceite</option>
                <option>Revisión general</option>
                <option>Frenos</option>
                <option>Diagnóstico</option>
              </select>
            </div>
            <div className="si-form-group">
              <label>Vehículo</label>
              <select>
                {vehiculos.length === 0
                  ? <option>Sin vehículos registrados</option>
                  : vehiculos.map((v, i) => <option key={i}>{v.nombre} — {v.placa}</option>)
                }
              </select>
            </div>
            <div className="si-form-row">
              <div className="si-form-group">
                <label>Fecha</label>
                <input type="date" min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="si-form-group">
                <label>Hora</label>
                <select>
                  {["08:00","09:00","10:00","11:00","14:00","15:00","16:00"].map(h => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="si-form-group">
              <label>Observaciones</label>
              <textarea rows={3} placeholder="Describe el problema o servicio requerido..." />
            </div>
            <div className="si-form-actions">
              <button className="si-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button className="si-btn-primary" onClick={() => setModal(null)}>Confirmar cita</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Consultar IA */}
      {modal === "ia" && (
        <Modal title="Consultar IA AutoTech" onClose={() => setModal(null)}>
          <div className="si-ia">
            <div className="si-ia-avatar"><Icon.Bot /></div>
            <p className="si-ia-desc">
              Pregúntame sobre el mantenimiento de tu vehículo, síntomas de fallas o recomendaciones de servicio.
            </p>
            <div className="si-ia-input-row">
              <input type="text" placeholder="¿Cuándo debo cambiar el aceite?" className="si-ia-input" />
              <button className="si-btn-primary">Preguntar</button>
            </div>
            <p className="si-ia-note"><i className="bi bi-info-circle" /> Próximamente disponible</p>
          </div>
        </Modal>
      )}

    </div>
  );
}