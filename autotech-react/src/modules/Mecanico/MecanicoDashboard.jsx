import { useState, useEffect } from "react";
import "./MecanicoDashboard.css";

/* ══════════════════════════════════════
   DATOS SIMULADOS
══════════════════════════════════════ */
const mecanico = {
  nombre: "Carlos Mendoza",
  iniciales: "CM",
  especialidad: "Motor & Transmisión",
};

const ordenes = [
  { id: "ORD-001", servicio: "Cambio de aceite y filtros",        vehiculo: "Toyota Corolla 2020",  placa: "ABC-123", cliente: "Oscar Avila",    fecha: { dia: "28", mes: "MAR" }, hora: "10:00 AM", prioridad: "normal",  estado: "en_proceso" },
  { id: "ORD-002", servicio: "Revisión general de frenos",        vehiculo: "Chevrolet Spark 2018", placa: "XYZ-789", cliente: "María López",    fecha: { dia: "05", mes: "ABR" }, hora: "2:00 PM",  prioridad: "alta",    estado: "pendiente"  },
  { id: "ORD-003", servicio: "Alineación y balanceo",             vehiculo: "Renault Duster 2021",  placa: "DEF-456", cliente: "Luis Hernández", fecha: { dia: "10", mes: "ABR" }, hora: "9:00 AM",  prioridad: "normal",  estado: "completada" },
  { id: "ORD-004", servicio: "Diagnóstico eléctrico",             vehiculo: "Kia Picanto 2019",     placa: "GHI-321", cliente: "Ana Torres",     fecha: { dia: "12", mes: "ABR" }, hora: "11:00 AM", prioridad: "urgente", estado: "pendiente"  },
  { id: "ORD-005", servicio: "Cambio de correa de distribución",  vehiculo: "Mazda 3 2017",         placa: "JKL-654", cliente: "Pedro Ruiz",     fecha: { dia: "14", mes: "ABR" }, hora: "8:00 AM",  prioridad: "alta",    estado: "completada" },
];

const vehiculosAsignados = [
  { id: 1, nombre: "Toyota Corolla",  placa: "ABC-123", anio: 2020, km: 45200, combustible: "Gasolina", color: "Blanco", cliente: "Oscar Avila",  servicio: "Cambio de aceite",      estado: "en_proceso", colorWrap: "blue"   },
  { id: 2, nombre: "Chevrolet Spark", placa: "XYZ-789", anio: 2018, km: 82000, combustible: "Gasolina", color: "Rojo",   cliente: "María López",  servicio: "Revisión de frenos",    estado: "pendiente",  colorWrap: "orange" },
  { id: 3, nombre: "Kia Picanto",     placa: "GHI-321", anio: 2019, km: 38500, combustible: "Gasolina", color: "Azul",   cliente: "Ana Torres",   servicio: "Diagnóstico eléctrico", estado: "pendiente",  colorWrap: "purple" },
];

const observaciones = [
  { id: 1, vehiculo: "Toyota Corolla — ABC-123",  cliente: "Oscar Avila",    fecha: "10 Mar 2026", texto: "Filtro de aire en mal estado, se recomienda cambio inmediato. Se detectaron pequeñas fugas de aceite en la junta del motor.",         tipo: "advertencia" },
  { id: 2, vehiculo: "Renault Duster — DEF-456",  cliente: "Luis Hernández", fecha: "08 Mar 2026", texto: "Vehículo en buen estado general. Pastillas de freno con 30% de vida útil, se notifica para próximo servicio.",                        tipo: "info"        },
  { id: 3, vehiculo: "Mazda 3 — JKL-654",         cliente: "Pedro Ruiz",     fecha: "05 Mar 2026", texto: "Correa de distribución cambiada exitosamente. Se recomienda revisión del sistema de refrigeración en el próximo mantenimiento.",         tipo: "ok"          },
  { id: 4, vehiculo: "Chevrolet Spark — XYZ-789", cliente: "María López",    fecha: "03 Mar 2026", texto: "Frenos traseros con desgaste crítico. Requiere cambio urgente de pastillas y revisión del disco.",                                      tipo: "urgente"     },
];

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
const estadoConfig = {
  en_proceso: { bg: "#e8f0fe", color: "#1a6bdc", label: "En proceso" },
  pendiente:  { bg: "#fff3e0", color: "#e65100", label: "Pendiente"  },
  completada: { bg: "#e8f5e9", color: "#2e7d32", label: "Completada" },
};

const prioridadConfig = {
  normal:  { bg: "#f0f2f7", color: "#5a6a8a", label: "Normal"  },
  alta:    { bg: "#fff3e0", color: "#e65100", label: "Alta"    },
  urgente: { bg: "#fce4ec", color: "#c62828", label: "Urgente" },
};

const obsConfig = {
  advertencia: { bg: "#fff8e1", color: "#f57c00", icon: "bi-exclamation-triangle-fill" },
  info:        { bg: "#e3f2fd", color: "#1565c0", icon: "bi-info-circle-fill"          },
  ok:          { bg: "#e8f5e9", color: "#2e7d32", icon: "bi-check-circle-fill"         },
  urgente:     { bg: "#fce4ec", color: "#c62828", icon: "bi-x-octagon-fill"            },
};

function Badge({ tipo, config }) {
  const c = config[tipo];
  if (!c) return null;
  return <span className="badge-estado" style={{ background: c.bg, color: c.color }}>{c.label}</span>;
}

function useCounter(target, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let current = 0;
    const steps = 30;
    const inc = target / steps;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.round(current));
    }, 600 / steps);
    return () => clearInterval(timer);
  }, [target, active]);
  return val;
}

function getSaludo() {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches";
}
function getFecha() {
  const hoy   = new Date();
  const dias  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
}

/* ══════════════════════════════════════
   SECCIÓN: INICIO
══════════════════════════════════════ */
function SecInicio({ setSeccion }) {
  const total       = ordenes.length;
  const pendientes  = ordenes.filter(o => o.estado === "pendiente").length;
  const enProceso   = ordenes.filter(o => o.estado === "en_proceso").length;
  const completadas = ordenes.filter(o => o.estado === "completada").length;
  const pctDia      = Math.round((completadas / total) * 100);

  const cTotal = useCounter(total,       true);
  const cPend  = useCounter(pendientes,  true);
  const cProc  = useCounter(enProceso,   true);
  const cComp  = useCounter(completadas, true);

  const urgente    = ordenes.find(o => o.prioridad === "urgente" && o.estado !== "completada");
  const topOrdenes = ordenes.filter(o => o.estado !== "completada").slice(0, 2);

  const circumference = 2 * Math.PI * 42; // r=42
  const strokeOffset  = circumference - (pctDia / 100) * circumference;

  return (
    <div className="inicio-v2">

      {/* ── HERO ── */}
      <div className="hero-banner">
        <div className="hero-deco-circle c1"></div>
        <div className="hero-deco-circle c2"></div>
        <div className="hero-left">
          <div className="hero-saludo">{getSaludo()}</div>
          <h2 className="hero-nombre">Carlos <span>Mendoza</span></h2>
          <div className="hero-fecha">{getFecha()}</div>
          <div className="hero-prog-wrap">
            <div className="hero-prog-labels">
              <span>Progreso del día</span>
              <strong>{pctDia}%</strong>
            </div>
            <div className="hero-prog-track">
              <div className="hero-prog-fill" style={{ width: `${pctDia}%` }}></div>
            </div>
            <div className="hero-prog-sub">{completadas} de {total} órdenes completadas</div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-ring-wrap">
            <svg viewBox="0 0 100 100" className="ring-svg">
              <circle cx="50" cy="50" r="42" className="ring-bg" />
              <circle cx="50" cy="50" r="42" className="ring-fg"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={`${strokeOffset}`}
              />
            </svg>
            <div className="ring-inner">
              <div className="ring-num">{pctDia}%</div>
              <div className="ring-lbl">completado</div>
            </div>
          </div>
          <div className="hero-spec-tag">
            <i className="bi bi-wrench-adjustable-circle-fill"></i>
            Motor &amp; Transmisión
          </div>
        </div>
      </div>

      {/* ── ALERTA URGENTE ── */}
      {urgente && (
        <div className="alerta-urgente">
          <div className="alerta-pulse-dot"></div>
          <i className="bi bi-exclamation-octagon-fill" style={{ color: "#c62828", fontSize: "1.2rem", flexShrink: 0 }}></i>
          <div className="alerta-texto">
            <strong>Orden urgente:</strong> {urgente.servicio} — {urgente.vehiculo} · {urgente.cliente}
          </div>
          <button className="alerta-cta" onClick={() => setSeccion("ordenes")}>Ver orden →</button>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="stat-grid">
        {[
          { icon: "bi-clipboard-list-fill", color: "#1a6bdc", bg: "#e8f0fe", label: "Total órdenes", val: cTotal, bar: total      },
          { icon: "bi-hourglass-split",     color: "#e65100", bg: "#fff3e0", label: "Pendientes",    val: cPend,  bar: pendientes  },
          { icon: "bi-gear-wide-connected", color: "#7c3aed", bg: "#f3e5f5", label: "En proceso",    val: cProc,  bar: enProceso   },
          { icon: "bi-patch-check-fill",    color: "#2e7d32", bg: "#e8f5e9", label: "Completadas",   val: cComp,  bar: completadas },
        ].map((s, i) => (
          <div className="stat-card" key={i} style={{ "--d": `${i * 0.07}s` }}>
            <div className="stat-card-top">
              <div className="stat-icon-box" style={{ background: s.bg }}>
                <i className={`bi ${s.icon}`} style={{ color: s.color }}></i>
              </div>
              <div className="stat-num" style={{ color: s.color }}>{s.val}</div>
            </div>
            <div className="stat-lbl">{s.label}</div>
            <div className="stat-bar-track">
              <div className="stat-bar-fill" style={{ width: `${Math.round((s.bar / (total || 1)) * 100)}%`, background: s.color }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* ── BOTTOM ── */}
      <div className="inicio-bottom-grid">

        {/* Órdenes prioritarias */}
        <div className="ib-panel">
          <div className="ib-panel-head">
            <div className="ib-panel-title">
              <i className="bi bi-lightning-charge-fill" style={{ color: "#e65100" }}></i>
              Órdenes prioritarias
            </div>
            <button className="link-ver" onClick={() => setSeccion("ordenes")}>Ver todas →</button>
          </div>
          <div className="ib-ordenes">
            {topOrdenes.map((o, i) => {
              const pConf = prioridadConfig[o.prioridad];
              const eConf = estadoConfig[o.estado];
              return (
                <div className="ib-orden-row" key={o.id} style={{ "--d": `${0.25 + i * 0.1}s` }}>
                  <div className="ib-orden-num">{String(i + 1).padStart(2, "0")}</div>
                  <div className="ib-orden-info">
                    <div className="ib-orden-titulo">{o.servicio}</div>
                    <div className="ib-orden-meta">
                      <span><i className="bi bi-car-front"></i> {o.vehiculo}</span>
                      <span><i className="bi bi-person"></i> {o.cliente}</span>
                      <span><i className="bi bi-clock"></i> {o.hora}</span>
                    </div>
                  </div>
                  <div className="ib-orden-tags">
                    <span className="tag-pill" style={{ background: pConf.bg, color: pConf.color }}>{pConf.label}</span>
                    <span className="tag-pill" style={{ background: eConf.bg, color: eConf.color }}>{eConf.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado del taller */}
        <div className="ib-panel">
          <div className="ib-panel-head">
            <div className="ib-panel-title">
              <i className="bi bi-activity" style={{ color: "#2e7d32" }}></i>
              Estado del taller hoy
            </div>
          </div>
          <div className="taller-bars">
            {[
              { label: "Completadas", val: completadas, color: "#2e7d32", icon: "bi-check-circle-fill" },
              { label: "En proceso",  val: enProceso,   color: "#7c3aed", icon: "bi-gear-fill"         },
              { label: "Pendientes",  val: pendientes,  color: "#e65100", icon: "bi-clock-fill"        },
            ].map((r, i) => (
              <div className="taller-bar-row" key={i}>
                <div className="taller-bar-left">
                  <i className={`bi ${r.icon}`} style={{ color: r.color }}></i>
                  <span>{r.label}</span>
                </div>
                <div className="taller-bar-track">
                  <div className="taller-bar-fill" style={{ width: `${Math.round((r.val / (total || 1)) * 100)}%`, background: r.color }}></div>
                </div>
                <span className="taller-bar-num" style={{ color: r.color }}>{r.val}</span>
              </div>
            ))}
          </div>
          <div className="acciones-rapidas-row">
            {[
              { icon: "bi-clipboard-check-fill", label: "Órdenes",       sec: "ordenes",       c: "#1a6bdc", cs: "#e8f0fe" },
              { icon: "bi-car-front-fill",        label: "Vehículos",    sec: "vehiculos",     c: "#2e7d32", cs: "#e8f5e9" },
              { icon: "bi-chat-left-text-fill",   label: "Observaciones",sec: "observaciones", c: "#7c3aed", cs: "#f3e5f5" },
            ].map((a, i) => (
              <button key={i} className="btn-action" style={{ "--c": a.c, "--cs": a.cs }} onClick={() => setSeccion(a.sec)}>
                <i className={`bi ${a.icon}`}></i>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   SECCIÓN: MIS ÓRDENES
══════════════════════════════════════ */
function SecOrdenes() {
  const [filtro, setFiltro] = useState("todas");
  const lista = filtro === "todas" ? ordenes : ordenes.filter(o => o.estado === filtro);

  return (
    <div>
      <div className="sec-header">
        <div>
          <h6 className="block-title">Mis Órdenes</h6>
          <p className="block-sub">Órdenes de trabajo asignadas a ti</p>
        </div>
      </div>
      <div className="filtros-row">
        {["todas","pendiente","en_proceso","completada"].map(f => (
          <button key={f} className={`filtro-btn ${filtro === f ? "active" : ""}`} onClick={() => setFiltro(f)}>
            {f === "todas" ? "Todas" : estadoConfig[f]?.label || f}
          </button>
        ))}
      </div>
      <div className="citas-tabla">
        {lista.length === 0 && <p className="empty-msg">No hay órdenes con este estado.</p>}
        {lista.map(o => (
          <div className="orden-row" key={o.id}>
            <div className="fecha-col">
              <span className="cr-dia">{o.fecha.dia}</span>
              <span className="cr-mes">{o.fecha.mes}</span>
            </div>
            <div className="orden-info">
              <div className="cr-titulo">{o.servicio}</div>
              <div className="cr-meta">
                <span><i className="bi bi-tag"></i> {o.id}</span>
                <span><i className="bi bi-clock"></i> {o.hora}</span>
                <span><i className="bi bi-car-front"></i> {o.vehiculo} — {o.placa}</span>
                <span><i className="bi bi-person"></i> {o.cliente}</span>
              </div>
            </div>
            <div className="orden-badges">
              <Badge tipo={o.prioridad} config={prioridadConfig} />
              <Badge tipo={o.estado}    config={estadoConfig}    />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   SECCIÓN: VEHÍCULOS ASIGNADOS
══════════════════════════════════════ */
function SecVehiculos() {
  return (
    <div>
      <div className="sec-header">
        <div>
          <h6 className="block-title">Vehículos Asignados</h6>
          <p className="block-sub">Vehículos que tienes actualmente a cargo</p>
        </div>
      </div>
      <div className="veh-grid">
        {vehiculosAsignados.map(v => (
          <div className="veh-card" key={v.id}>
            <div className="veh-card-top">
              <div className={`veh-icon-wrap ${v.colorWrap}`}>
                <i className="bi bi-car-front-fill"></i>
              </div>
            </div>
            <div className="veh-card-body">
              <div className="veh-card-name">{v.nombre}</div>
              <div className="veh-card-plate">{v.placa} &nbsp;·&nbsp; {v.anio}</div>
              <div className="veh-card-stats">
                <div className="veh-stat"><span className="veh-stat-label">Kilometraje</span><span className={`veh-stat-val ${v.km >= 80000 ? "warn" : ""}`}>{v.km.toLocaleString("es-CO")} km {v.km >= 80000 ? "⚠" : ""}</span></div>
                <div className="veh-stat"><span className="veh-stat-label">Combustible</span><span className="veh-stat-val">{v.combustible}</span></div>
                <div className="veh-stat"><span className="veh-stat-label">Color</span><span className="veh-stat-val">{v.color}</span></div>
                <div className="veh-stat"><span className="veh-stat-label">Cliente</span><span className="veh-stat-val">{v.cliente}</span></div>
              </div>
              {v.km >= 80000 && (
                <div className="km-alert"><i className="bi bi-exclamation-triangle-fill"></i> Supera 80,000 km — revisión preventiva recomendada</div>
              )}
              <div className="servicio-actual"><i className="bi bi-wrench-adjustable"></i> {v.servicio}</div>
            </div>
            <div className="veh-card-footer">
              <Badge tipo={v.estado} config={estadoConfig} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   SECCIÓN: OBSERVACIONES
══════════════════════════════════════ */
function SecObservaciones() {
  const [nueva, setNueva] = useState(false);

  return (
    <div>
      <div className="sec-header">
        <div>
          <h6 className="block-title">Observaciones</h6>
          <p className="block-sub">Notas técnicas sobre los vehículos atendidos</p>
        </div>
        <button className="btn-nueva" onClick={() => setNueva(!nueva)}>
          <i className="bi bi-plus-lg"></i> Nueva observación
        </button>
      </div>
      {nueva && (
        <div className="obs-form-card">
          <div className="obs-form-title"><i className="bi bi-pencil-square"></i> Agregar observación</div>
          <div className="obs-form-row">
            <select className="obs-input">
              <option>Seleccionar vehículo...</option>
              {vehiculosAsignados.map(v => <option key={v.id}>{v.nombre} — {v.placa}</option>)}
            </select>
            <select className="obs-input">
              <option value="info">Informativa</option>
              <option value="advertencia">Advertencia</option>
              <option value="urgente">Urgente</option>
              <option value="ok">Todo OK</option>
            </select>
          </div>
          <textarea className="obs-textarea" placeholder="Escribe aquí la observación técnica..." rows={3}></textarea>
          <div className="obs-form-actions">
            <button className="btn-cancelar" onClick={() => setNueva(false)}>Cancelar</button>
            <button className="btn-guardar"><i className="bi bi-check2"></i> Guardar</button>
          </div>
        </div>
      )}
      <div className="obs-lista">
        {observaciones.map(o => {
          const conf = obsConfig[o.tipo];
          return (
            <div className="obs-card" key={o.id} style={{ borderLeftColor: conf.color }}>
              <div className="obs-header">
                <div className="obs-icon-wrap" style={{ background: conf.bg, color: conf.color }}>
                  <i className={`bi ${conf.icon}`}></i>
                </div>
                <div className="obs-meta">
                  <div className="obs-vehiculo">{o.vehiculo}</div>
                  <div className="obs-sub"><i className="bi bi-person"></i> {o.cliente} &nbsp;·&nbsp; <i className="bi bi-calendar3"></i> {o.fecha}</div>
                </div>
                <span className="obs-tipo-badge" style={{ background: conf.bg, color: conf.color }}>
                  <i className={`bi ${conf.icon}`}></i>
                  {o.tipo.charAt(0).toUpperCase() + o.tipo.slice(1)}
                </span>
              </div>
              <p className="obs-texto">{o.texto}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════ */
const navItems = [
  { label: "Inicio",              sec: "inicio",        icon: "bi-grid-1x2"        },
  { label: "Mis órdenes",         sec: "ordenes",       icon: "bi-clipboard-check" },
  { label: "Vehículos asignados", sec: "vehiculos",     icon: "bi-car-front"       },
  { label: "Observaciones",       sec: "observaciones", icon: "bi-chat-left-text"  },
];

export default function MecanicoDashboard() {
  const [seccion, setSeccion] = useState("inicio");
  const tituloActual = navItems.find(n => n.sec === seccion)?.label || "Inicio";

  return (
    <div className="at-layout">
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
            <button key={item.sec} className={`at-nav-item ${seccion === item.sec ? "active" : ""}`} onClick={() => setSeccion(item.sec)}>
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="at-sidebar-footer">
          <i className="bi bi-box-arrow-left"></i> Cerrar sesión
        </div>
      </aside>

      <div className="at-main">
        <div className="at-topbar">
          <span className="at-page-title">{tituloActual}</span>
          <span className="at-role-badge">Mecánico</span>
        </div>
        <div className="at-content">
          {seccion === "inicio"        && <SecInicio setSeccion={setSeccion} />}
          {seccion === "ordenes"       && <SecOrdenes />}
          {seccion === "vehiculos"     && <SecVehiculos />}
          {seccion === "observaciones" && <SecObservaciones />}
        </div>
      </div>
    </div>
  );
}