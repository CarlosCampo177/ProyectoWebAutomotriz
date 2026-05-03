/* ══════════════════════════════════════════
   AUTOTECH — SECCIÓN VEHÍCULOS
   sections/SecVehiculos.jsx
══════════════════════════════════════════ */
import * as Icon from "../icons/Icons";
import "./SecVehiculos.css";

/* ── NOTA API ──────────────────────────────
   Props recibidas desde UsuarioApp:
     vehiculos → GET /api/usuarios/:id/vehiculos
     onAgregar → abre SlidePanel con ModalAgregarVehiculo

   Para eliminar un vehículo (botón futuro):
     DELETE /api/usuarios/:id/vehiculos/:vehiculoId
     Después de la respuesta, filtrar del estado local.

   Para editar un vehículo (botón futuro):
     PUT /api/usuarios/:id/vehiculos/:vehiculoId
     Actualizar el estado local con la respuesta.
────────────────────────────────────────── */

const colorMap = {
  blue:   { bg: "#e8f0fe", color: "#1a6bdc" },
  orange: { bg: "#fff3e0", color: "#e65100" },
  green:  { bg: "#e8f5e9", color: "#2e7d32" },
};

function AlertaKm({ km }) {
  if (km < 80000) return null;
  return (
    <div className="sv-alerta-km">
      <div className="sv-alerta-icon"><Icon.AlertTriangle /></div>
      Supera 80,000 km — se recomienda revisión preventiva
    </div>
  );
}

export default function SecVehiculos({ vehiculos, onAgregar }) {
  /* ── NOTA API ──────────────────────────────
     Estado de carga mientras llega la lista:
     if (loading) return <div className="sv-loading">Cargando vehículos...</div>
     if (error)   return <div className="sv-error">No se pudo cargar la información.</div>
  ────────────────────────────────────────── */

  return (
    <div>
      {/* Header sección */}
      <div className="sv-header">
        <div>
          <div className="sv-title">Mis Vehículos</div>
          <div className="sv-subtitle">Vehículos registrados en tu cuenta</div>
        </div>
        <button className="sv-btn-add" onClick={onAgregar}>
          <div className="sv-btn-icon"><Icon.Plus /></div>
          Agregar vehículo
        </button>
      </div>

      {/* Sin vehículos */}
      {vehiculos.length === 0 && (
        <div className="sv-empty">
          No tienes vehículos registrados. Agrega uno para comenzar.
        </div>
      )}

      {/* Grid de tarjetas */}
      <div className="sv-grid">
        {vehiculos.map((v, i) => {
          const c = colorMap[v.colorWrap] || colorMap.blue;
          return (
            <div key={v.id ?? i} className="sv-card">
              {/* Ícono */}
              <div className="sv-card-header">
                <div className="sv-icon-wrap" style={{ background: c.bg, color: c.color }}>
                  {v.icono === "car" ? <Icon.Car /> : <Icon.Truck />}
                </div>
              </div>

              {/* Datos */}
              <div className="sv-card-body">
                <div className="sv-nombre">{v.nombre}</div>
                <div className="sv-sub">{v.placa} · {v.anio}</div>

                <div className="sv-stats">
                  <div>
                    <div className="sv-stat-label">Kilometraje</div>
                    <div className={`sv-stat-value${v.km >= 80000 ? " warn" : ""}`}>
                      {v.km?.toLocaleString("es-CO")} km{v.km >= 80000 ? " !" : ""}
                    </div>
                  </div>
                  <div>
                    <div className="sv-stat-label">Combustible</div>
                    <div className="sv-stat-value">{v.combustible}</div>
                  </div>
                  <div>
                    <div className="sv-stat-label">Color</div>
                    <div className="sv-stat-value">{v.color}</div>
                  </div>
                  <div>
                    {/* ── NOTA API ──────────────────────────
                        ultimoServicio → puede venir de
                        GET /api/usuarios/:id/vehiculos/:vehiculoId/historial?limit=1
                        o calcularse desde el array de historial del vehículo.
                    ───────────────────────────────────────── */}
                    <div className="sv-stat-label">Último servicio</div>
                    <div className="sv-stat-value">{v.ultimoServicio ?? "Sin registro"}</div>
                  </div>
                </div>

                <AlertaKm km={v.km} />
              </div>

              {/* Footer */}
              <div className="sv-card-footer">
                <span className={`sv-status ${v.estado}`}>
                  {v.estado === "ok" ? "Al día" : "Revisión pendiente"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}