/* ══════════════════════════════════════════
   AUTOTECH — SECCIÓN CITAS
   sections/SecCitas.jsx
══════════════════════════════════════════ */
import { useState } from "react";
import * as Icon from "../icons/Icons";
import "./SecCitas.css";

/* ── NOTA API ──────────────────────────────
   Props recibidas desde UsuarioApp:
     citas     → GET /api/usuarios/:id/citas
     onAgendar → abre SlidePanel con ModalAgendarCita

   Para cancelar una cita (botón futuro):
     PATCH /api/citas/:id  body: { estado: "cancelada" }
     Actualizar el item en el estado local.

   Filtro por estado: se puede pasar como query param
     GET /api/usuarios/:id/citas?estado=pendiente
   o filtrar localmente (opción actual).
────────────────────────────────────────── */

const filtros = ["todas", "pendiente", "confirmada", "completada", "cancelada"];

function Badge({ estado }) {
  return (
    <span className={`sc-badge sc-badge-${estado}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}

function FechaCol({ dia, mes }) {
  return (
    <div className="sc-fecha">
      <span className="sc-fecha-dia">{dia}</span>
      <span className="sc-fecha-mes">{mes}</span>
    </div>
  );
}

export default function SecCitas({ citas, onAgendar }) {
  const [filtro, setFiltro] = useState("todas");

  /* ── NOTA API ──────────────────────────────
     Filtro local. Con API se puede usar:
     useEffect que llame GET /api/usuarios/:id/citas?estado=filtro
     cuando cambie el filtro. Por ahora filtramos el array local.
  ────────────────────────────────────────── */
  const lista = filtro === "todas"
    ? citas
    : citas.filter(c => c.estado === filtro);

  return (
    <div>
      {/* Header */}
      <div className="sc-header">
        <div>
          <div className="sc-title">Mis Citas</div>
          <div className="sc-subtitle">Consulta y gestiona todas tus citas agendadas</div>
        </div>
        <button className="sc-btn-add" onClick={onAgendar}>
          <div className="sc-btn-icon"><Icon.Calendar /></div>
          Agendar cita
        </button>
      </div>

      {/* Filtros */}
      <div className="sc-filtros">
        {filtros.map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`sc-filtro${filtro === f ? " active" : ""}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="sc-list">
        {lista.length === 0 && (
          <div className="sc-empty">No hay citas con este estado.</div>
        )}
        {lista.map((c, i) => (
          <div key={c.id ?? i} className="sc-item">
            <FechaCol dia={c.dia} mes={c.mes} />
            <div className="sc-item-body">
              <div className="sc-item-title">{c.servicio}</div>
              <div className="sc-item-meta">
                <span>{c.hora}</span>
                <span>{c.vehiculo}</span>
                {/* ── NOTA API → c.mecanico = mecanico.nombre del join */}
                <span>{c.mecanico}</span>
              </div>
              {c.observaciones && (
                <div className="sc-item-obs">"{c.observaciones}"</div>
              )}
            </div>
            <Badge estado={c.estado} />
          </div>
        ))}
      </div>
    </div>
  );
}