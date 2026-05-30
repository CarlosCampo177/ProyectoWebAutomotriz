/* ══════════════════════════════════════════
   AUTOTECH — SECCIÓN PERFIL
   sections/SecPerfil.jsx
══════════════════════════════════════════ */
import { useState, useEffect } from "react";
import apiClient from "../../../services/apiClient";
import "./SecPerfil.css";

/* ── NOTA API ──────────────────────────────
   El objeto user del contexto solo trae:
     { id, nombre, email, rol, iniciales }

   Este componente llama a:
     GET /api/usuarios/:id  → datos completos
   y luego permite editar con:
     PUT /api/usuarios/:id
     Body: { Telefono, Email, Direccion }
────────────────────────────────────────── */

function CampoInfo({ label, valor, icon }) {
  return (
    <div className="sp-campo">
      <label>{label}</label>
      <div className="sp-campo-valor">
        {icon && <i className={`ti ti-${icon}`} aria-hidden="true" />}
        <span>{valor || "—"}</span>
      </div>
    </div>
  );
}

/* ── Panel lateral de edición ───────────── */
function PanelEditar({ detalle, onClose, onGuardar }) {
  const [form, setForm] = useState({
    Telefono:  detalle?.Telefono  ?? "",
    Email:     detalle?.Email     ?? "",
    Direccion: detalle?.Direccion ?? "",
  });
  const [guardando, setGuardando] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      /* ── NOTA API ──────────────────────────
         Cuando tengas el endpoint listo:
         await apiClient.put(`Usuarios/${detalle.IdUsuario}`, form);
      ─────────────────────────────────────── */
      await new Promise(r => setTimeout(r, 600)); // quitar al conectar API
      onGuardar(form);
      onClose();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="sp-overlay" onClick={onClose} />
      <aside className="sp-panel">
        <div className="sp-panel-head">
          <div className="sp-panel-head-info">
            <div className="sp-panel-titulo">Editar Perfil</div>
            <div className="sp-panel-sub">Actualiza tu información de contacto</div>
          </div>
          <button className="sp-panel-close" onClick={onClose}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="sp-panel-body">
          <div className="sp-panel-section-label">Datos personales</div>

          <div className="sp-panel-field">
            <label>Nombre completo</label>
            <div className="sp-panel-input-wrap readonly">
              <i className="ti ti-user" aria-hidden="true" />
              <span>{detalle?.nombreCompleto ?? "—"}</span>
            </div>
            <span className="sp-panel-hint">El nombre no es editable</span>
          </div>

          <div className="sp-panel-field">
            <label>Documento</label>
            <div className="sp-panel-input-wrap readonly">
              <i className="ti ti-id" aria-hidden="true" />
              <span>{detalle?.Documento ?? "—"}</span>
            </div>
            <span className="sp-panel-hint">El documento no es editable</span>
          </div>

          <div className="sp-panel-section-label">Información de contacto</div>

          <div className="sp-panel-field">
            <label>Correo electrónico</label>
            <div className="sp-panel-input-wrap">
              <i className="ti ti-mail" aria-hidden="true" />
              <input
                type="email"
                value={form.Email}
                onChange={e => set("Email", e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div className="sp-panel-field">
            <label>Teléfono</label>
            <div className="sp-panel-input-wrap">
              <i className="ti ti-phone" aria-hidden="true" />
              <input
                type="tel"
                value={form.Telefono}
                onChange={e => set("Telefono", e.target.value)}
                placeholder="300 000 0000"
              />
            </div>
          </div>

          <div className="sp-panel-field">
            <label>Dirección</label>
            <div className="sp-panel-input-wrap">
              <i className="ti ti-map-pin" aria-hidden="true" />
              <input
                type="text"
                value={form.Direccion}
                onChange={e => set("Direccion", e.target.value)}
                placeholder="Calle 123 # 45-67"
              />
            </div>
          </div>
        </div>

        <div className="sp-panel-actions">
          <button className="sp-panel-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="sp-panel-btn-primary"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Componente principal ───────────────── */
export default function SecPerfil({ usuario, vehiculos, stats, onActualizar }) {
  const [detalle,  setDetalle]  = useState(null);
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Carga los datos completos del usuario desde el backend
  useEffect(() => {
  if (!usuario) return;
  setDetalle({
    nombreCompleto: usuario.nombre  ?? "—",
    Documento:      usuario.cedula  ?? "—",
    Email:          usuario.email   ?? "—",
    Telefono:       usuario.telefono ?? "—",
    Direccion:      "—",
  });
  setCargando(false);
}, [usuario]);

  if (!usuario) return null;

  const iniciales = usuario.iniciales
    ?? usuario.nombre?.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()
    ?? "??";

  const handleGuardar = (datos) => {
    setDetalle(prev => ({ ...prev, ...datos }));
    if (onActualizar) onActualizar({ ...usuario, ...datos });
  };

  return (
    <div className="sp-wrapper">
      {/* ─── Header ─── */}
      <div className="sp-page-header">
        <div className="sp-page-title">Mi Perfil</div>
        <div className="sp-page-sub">Información personal y configuración de tu cuenta</div>
      </div>

      <div className="sp-layout">
        {/* ─── Columna izquierda ─── */}
        <div className="sp-col-left">
          <div className="sp-avatar-card">
            <div className="sp-avatar-ring">
              <div className="sp-avatar">{iniciales}</div>
            </div>
            <div className="sp-nombre">{usuario.nombre ?? "—"}</div>
            <div className="sp-rol">Cliente</div>

            <div className="sp-stats-row">
              <div className="sp-stat">
                <span className="sp-stat-val">{vehiculos?.length ?? 0}</span>
                <span className="sp-stat-label">Vehículos</span>
              </div>
              <div className="sp-stat-divider" />
              <div className="sp-stat">
                <span className="sp-stat-val">{stats?.serviciosRealizados ?? 0}</span>
                <span className="sp-stat-label">Servicios</span>
              </div>
            </div>
          </div>

          <div className="sp-security-card">
            <div className="sp-sec-header">
              <div className="sp-sec-icon">
                <i className="ti ti-shield-check" aria-hidden="true" />
              </div>
              <span>Cuenta verificada</span>
            </div>
            <p className="sp-sec-text">
              Tu cuenta está activa y verificada. Puedes agendar citas y
              gestionar tus vehículos.
            </p>
            <button className="sp-btn-outline" disabled title="Próximamente">
              Cambiar contraseña
            </button>
          </div>
        </div>

        {/* ─── Columna derecha ─── */}
        <div className="sp-col-right">
          <div className="sp-datos-card">
            <div className="sp-datos-header">
              <div className="sp-datos-header-icon">
                <i className="ti ti-user" aria-hidden="true" />
              </div>
              <div>
                <div className="sp-datos-title">Información Personal</div>
                <div className="sp-datos-sub">Datos registrados en tu cuenta</div>
              </div>
              <button className="sp-btn-edit" onClick={() => setEditando(true)}>
                <i className="ti ti-pencil" aria-hidden="true" />
                Editar
              </button>
            </div>

            {cargando ? (
              <div className="sp-cargando">
                <i className="ti ti-loader-2 sp-spin" aria-hidden="true" />
                Cargando información...
              </div>
            ) : (
              <div className="sp-campos-grid">
                <CampoInfo label="Nombre completo"   valor={detalle?.nombreCompleto} icon="user"    />
                <CampoInfo label="Documento (CC)"     valor={detalle?.Documento}     icon="id"      />
                <CampoInfo label="Correo electrónico" valor={detalle?.Email}         icon="mail"    />
                <CampoInfo label="Teléfono"           valor={detalle?.Telefono}      icon="phone"   />
                {detalle?.Direccion && detalle.Direccion !== "—" && (
                  <CampoInfo label="Dirección"        valor={detalle?.Direccion}     icon="map-pin" />
                )}
              </div>
            )}
          </div>

          {vehiculos && vehiculos.length > 0 && (
            <div className="sp-datos-card">
              <div className="sp-datos-header">
                <div className="sp-datos-header-icon">
                  <i className="ti ti-car" aria-hidden="true" />
                </div>
                <div>
                  <div className="sp-datos-title">Vehículos Registrados</div>
                  <div className="sp-datos-sub">
                    {vehiculos.length} vehículo{vehiculos.length !== 1 ? "s" : ""} en tu cuenta
                  </div>
                </div>
              </div>

              <div className="sp-veh-list">
                {vehiculos.map((v, i) => (
                  <div key={v.id ?? i} className="sp-veh-item">
                    <div className="sp-veh-icon">
                      <i className={`ti ti-${v.icono === "truck" ? "truck" : "car"}`} aria-hidden="true" />
                    </div>
                    <div className="sp-veh-body">
                      <div className="sp-veh-nombre">{v.nombre} {v.anio}</div>
                      <div className="sp-veh-meta">
                        {v.placa} · {v.km?.toLocaleString("es-CO")} km
                      </div>
                    </div>
                    <span className={`sp-veh-badge ${v.estado}`}>
                      {v.estado === "ok" ? "Al día" : "Revisión"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editando && (
        <PanelEditar
          detalle={detalle}
          onClose={() => setEditando(false)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
}