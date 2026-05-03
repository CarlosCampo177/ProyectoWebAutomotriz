/* ══════════════════════════════════════════
   AUTOTECH — SECCIÓN INICIO
   sections/SecInicio.jsx
══════════════════════════════════════════ */
import * as Icon from "../icons/Icons";
import "./SecInicio.css";

/* ── NOTA API ──────────────────────────────
   Props recibidas desde UsuarioApp:
     vehiculos → GET /api/usuarios/:id/vehiculos
     citas     → GET /api/usuarios/:id/citas
     setSeccion → navegación interna (sin API)

   estadisticas (opcional) → GET /api/usuarios/:id/estadisticas
   Respuesta esperada:
     { totalVehiculos, citasPendientes, serviciosRealizados, consultasIA }
   Mientras no exista ese endpoint, se calculan
   localmente desde los arrays.
────────────────────────────────────────── */

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

function Badge({ estado }) {
  return (
    <span className={`si-badge si-badge-${estado}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}

function AlertaKm({ km }) {
  if (km < 80000) return null;
  return (
    <div className="si-alerta-km">
      <div className="si-alerta-icon"><Icon.AlertTriangle /></div>
      Supera 80,000 km — se recomienda revisión preventiva
    </div>
  );
}

export default function SecInicio({ vehiculos, citas, setSeccion, usuario }) {
  /* ── NOTA API ──────────────────────────────
     Cálculos locales — cuando exista el endpoint
     GET /api/usuarios/:id/estadisticas
     estos valores vendrán directamente de la API
     como props o de un useEffect en este componente.
  ────────────────────────────────────────── */
  const pendientes = citas.filter(c => c.estado === "pendiente").length;
  const proximas   = citas.filter(c => c.estado === "pendiente" || c.estado === "confirmada");
  const dotColor   = { pendiente: "#1a6bdc", confirmada: "#2e7d32" };

  const summaryCards = [
    { Icono: Icon.Car,      bg: "#e8f0fe", color: "#1a6bdc", label: "Vehículos",          val: vehiculos.length },
    { Icono: Icon.Calendar, bg: "#fff3e0", color: "#e65100", label: "Citas pendientes",    val: pendientes },
    { Icono: Icon.Wrench,   bg: "#e8f5e9", color: "#2e7d32", label: "Servicios realizados",val: citas.filter(c => c.estado === "completada").length },
    { Icono: Icon.Bot,      bg: "#f3e5f5", color: "#6a1b9a", label: "Consultas IA",        val: 0 /* TODO API → estadisticas.consultasIA */ },
  ];

  const acciones = [
    { Icono: Icon.Calendar, label: "Mis citas",     c: "#1a6bdc", cs: "#e8f0fe", sec: "citas"     },
    { Icono: Icon.Car,      label: "Mis vehículos", c: "#2e7d32", cs: "#e8f5e9", sec: "vehiculos" },
    { Icono: Icon.Bot,      label: "Consultar IA",  c: "#6a1b9a", cs: "#f3e5f5", sec: ""          },
    { Icono: Icon.Clock,    label: "Ver historial", c: "#e65100", cs: "#fff3e0", sec: "historial" },
  ];

  return (
    <div className="si-wrapper">
      {/* Bienvenida */}
      <div className="si-greeting">
        <div className="si-greeting-sub">{getGreeting()}</div>
        {/* usuario?.nombre viene de GET /api/auth/me en UsuarioApp */}
        <h1 className="si-greeting-title">
          Bienvenido, <span>{usuario?.nombre?.split(" ")[0] ?? "Usuario"}</span>
        </h1>
        <div className="si-greeting-date">{getDateLabel()}</div>
      </div>

      {/* Cards resumen */}
      <div className="si-cards">
        {summaryCards.map((c, i) => (
          <div key={i} className="si-card">
            <div className="si-card-icon" style={{ background: c.bg, color: c.color }}>
              <c.Icono />
            </div>
            <div>
              <div className="si-card-label">{c.label}</div>
              <div className="si-card-value">{c.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="si-sec-label">Acciones rápidas</div>
      <div className="si-acciones">
        {acciones.map((a, i) => (
          <button
            key={i}
            onClick={() => a.sec && setSeccion(a.sec)}
            className="si-accion-btn"
            style={{ borderColor: a.cs, background: a.cs, color: a.c }}
            onMouseEnter={e => {
              e.currentTarget.style.background  = a.c;
              e.currentTarget.style.color       = "#fff";
              e.currentTarget.style.transform   = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = a.cs;
              e.currentTarget.style.color       = a.c;
              e.currentTarget.style.transform   = "";
            }}
          >
            <div className="si-accion-icon"><a.Icono /></div>
            {a.label}
          </button>
        ))}
      </div>

      {/* Dos columnas: citas + vehículos */}
      <div className="si-grid-2">
        {/* Próximas citas */}
        <div>
          <div className="si-subsec-header">
            <span className="si-sec-label" style={{ marginBottom: 0 }}>Próximas citas</span>
            <span className="si-ver-link" onClick={() => setSeccion("citas")}>Ver todas</span>
          </div>
          <div className="si-list">
            {proximas.length === 0 && (
              <div className="si-empty">Sin citas próximas</div>
            )}
            {proximas.slice(0, 2).map((c, i) => (
              <div key={i} className="si-list-item">
                <div className="si-dot" style={{ background: dotColor[c.estado] || "#888" }} />
                <div className="si-list-body">
                  <div className="si-list-title">{c.servicio}</div>
                  <div className="si-list-meta">
                    <span>{c.dia} {c.mes} · {c.hora}</span>
                    <span>{c.vehiculo}</span>
                  </div>
                </div>
                <Badge estado={c.estado} />
              </div>
            ))}
          </div>
        </div>

        {/* Vehículos */}
        <div>
          <div className="si-subsec-header">
            <span className="si-sec-label" style={{ marginBottom: 0 }}>Mis vehículos</span>
            <span className="si-ver-link" onClick={() => setSeccion("vehiculos")}>Ver todos</span>
          </div>
          <div className="si-list">
            {vehiculos.map((v, i) => (
              <div key={i} className="si-list-item si-list-item--col">
                <div className="si-veh-row">
                  <div className="si-veh-icon"><Icon.Car /></div>
                  <div className="si-list-body">
                    <div className="si-list-title">{v.nombre}</div>
                    <div className="si-list-meta">
                      <span>{v.placa} · {v.anio}</span>
                    </div>
                  </div>
                  <span className="si-veh-km">{v.km?.toLocaleString("es-CO")} km</span>
                </div>
                <AlertaKm km={v.km} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}