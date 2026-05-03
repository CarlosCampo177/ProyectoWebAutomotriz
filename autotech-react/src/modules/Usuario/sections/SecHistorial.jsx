/* ══════════════════════════════════════════
   AUTOTECH — SECCIÓN HISTORIAL
   sections/SecHistorial.jsx
══════════════════════════════════════════ */
import "./SecHistorial.css";

/* ── NOTA API ──────────────────────────────
   Props recibidas desde UsuarioApp:
     historial → GET /api/usuarios/:id/historial
     Estructura esperada por item:
       {
         id, servicio, dia, mes, vehiculo,
         mecanico, monto, fecha (ISO string)
       }

   Paginación futura:
     GET /api/usuarios/:id/historial?page=1&limit=10
     Agregar botón "Cargar más" o paginación.
────────────────────────────────────────── */

function FechaCol({ dia, mes }) {
  return (
    <div className="sh-fecha">
      <span className="sh-fecha-dia">{dia}</span>
      <span className="sh-fecha-mes">{mes}</span>
    </div>
  );
}

export default function SecHistorial({ historial }) {
  /* ── NOTA API ──────────────────────────────
     Estado de carga:
     if (loading) return <div className="sh-loading">Cargando historial...</div>
     if (error)   return <div className="sh-error">No se pudo cargar el historial.</div>
  ────────────────────────────────────────── */

  return (
    <div>
      <div className="sh-header-sec">
        <div className="sh-title">Historial de Mantenimiento</div>
        <div className="sh-subtitle">Todos los servicios realizados a tus vehículos</div>
      </div>

      {(!historial || historial.length === 0) && (
        <div className="sh-empty">No hay servicios registrados en el historial.</div>
      )}

      <div className="sh-list">
        {(historial ?? []).map((h, i) => (
          <div key={h.id ?? i} className="sh-item">
            <FechaCol dia={h.dia} mes={h.mes} />
            <div className="sh-item-body">
              <div className="sh-item-title">{h.servicio}</div>
              <div className="sh-item-meta">
                <span>{h.vehiculo}</span>
                <span>{h.mecanico}</span>
                {/* ── NOTA API → h.monto viene del campo `total` o `monto` de la factura */}
                <span>${h.monto?.toLocaleString("es-CO")}</span>
              </div>
            </div>
            <span className="sh-badge">Completado</span>
          </div>
        ))}
      </div>
    </div>
  );
}