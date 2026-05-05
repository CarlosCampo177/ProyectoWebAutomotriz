/* ══════════════════════════════════════════
   AUTOTECH — SECCIÓN PERFIL
   sections/SecPerfil.jsx
══════════════════════════════════════════ */
import * as Icon from "../icons/Icons";
import "./SecPerfil.css";

/* ── NOTA API ──────────────────────────────
   Para editar el perfil (botón futuro):
     PUT /api/usuarios/:id
     Body: { nombre, correo, telefono, ciudad }
     Actualizar el estado local con la respuesta.

   Para cambiar contraseña (botón futuro):
     POST /api/auth/cambiar-password
     Body: { passwordActual, passwordNuevo }
────────────────────────────────────────── */

function CampoInfo({ label, valor, icono: Icono }) {
  return (
    <div className="sp-campo">
      <label>{label}</label>
      <div className="sp-campo-valor">
        {Icono && (
          <div className="sp-campo-icon">
            <Icono />
          </div>
        )}
        <span>{valor || "—"}</span>
      </div>
    </div>
  );
}

export default function SecPerfil({ usuario, vehiculos, stats }) {
  if (!usuario) return null;

  const primerNombre = usuario.nombre?.split(" ")[0] ?? "Usuario";

  return (
    <div className="sp-wrapper">
      {/* ─── Header ─── */}
      <div className="sp-page-header">
        <div className="sp-page-title">Mi Perfil</div>
        <div className="sp-page-sub">
          Información personal y configuración de tu cuenta
        </div>
      </div>

      <div className="sp-layout">
        {/* ─── Columna izquierda: avatar + resumen ─── */}
        <div className="sp-col-left">
          {/* Avatar card */}
          <div className="sp-avatar-card">
            <div className="sp-avatar">{usuario.iniciales ?? "??"}</div>
            <div className="sp-nombre">{usuario.nombre ?? "Cargando..."}</div>
            <div className="sp-rol">Cliente</div>

            <div className="sp-stats-row">
              <div className="sp-stat">
                <span className="sp-stat-val">{vehiculos?.length ?? 0}</span>
                <span className="sp-stat-label">Vehículos</span>
              </div>
              <div className="sp-stat-divider" />
              <div className="sp-stat">
                <span className="sp-stat-val">
                  {stats?.serviciosRealizados ?? 0}
                </span>
                <span className="sp-stat-label">Servicios</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de seguridad */}
          <div className="sp-security-card">
            <div className="sp-sec-header">
              <div className="sp-sec-icon">
                <Icon.Check />
              </div>
              <span>Cuenta verificada</span>
            </div>
            <p className="sp-sec-text">
              Tu cuenta está activa y verificada. Puedes agendar citas y
              gestionar tus vehículos.
            </p>
            {/* Botón futuro → cambiar contraseña */}
            <button className="sp-btn-outline" disabled title="Próximamente">
              Cambiar contraseña
            </button>
          </div>
        </div>

        {/* ─── Columna derecha: datos ─── */}
        <div className="sp-col-right">
          {/* Información personal */}
          <div className="sp-datos-card">
            <div className="sp-datos-header">
              <div className="sp-datos-header-icon">
                <Icon.User />
              </div>
              <div>
                <div className="sp-datos-title">Información Personal</div>
                <div className="sp-datos-sub">
                  Datos registrados en tu cuenta
                </div>
              </div>
              {/* Botón futuro → editar perfil */}
              <button className="sp-btn-edit" disabled title="Próximamente">
                Editar
              </button>
            </div>

            <div className="sp-campos-grid">
              <CampoInfo
                label="Nombre completo"
                valor={usuario.nombre}
                icono={Icon.User}
              />
              <CampoInfo
                label="Cédula / CC"
                valor={usuario.cedula}
                icono={Icon.IdCard}
              />
              <CampoInfo
                label="Correo electrónico"
                valor={usuario.email}
                icono={Icon.Receipt}
              />
              <CampoInfo
                label="Teléfono"
                valor={usuario.telefono}
                icono={Icon.Clock}
              />
            </div>
          </div>

          {/* Mis vehículos resumen */}
          {vehiculos && vehiculos.length > 0 && (
            <div className="sp-datos-card">
              <div className="sp-datos-header">
                <div className="sp-datos-header-icon">
                  <Icon.Car />
                </div>
                <div>
                  <div className="sp-datos-title">Vehículos Registrados</div>
                  <div className="sp-datos-sub">
                    {vehiculos.length} vehículo
                    {vehiculos.length !== 1 ? "s" : ""} en tu cuenta
                  </div>
                </div>
              </div>

              <div className="sp-veh-list">
                {vehiculos.map((v, i) => (
                  <div key={v.id ?? i} className="sp-veh-item">
                    <div className="sp-veh-icon">
                      {v.icono === "truck" ? <Icon.Truck /> : <Icon.Car />}
                    </div>
                    <div className="sp-veh-body">
                      <div className="sp-veh-nombre">
                        {v.nombre} {v.anio}
                      </div>
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
    </div>
  );
}
