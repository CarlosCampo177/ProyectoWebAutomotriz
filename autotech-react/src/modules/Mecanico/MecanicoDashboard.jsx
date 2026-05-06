import { useState, useEffect } from "react";
import "./MecanicoDashboard.css";
import { useAuth } from "../../context/AuthContext";   
import {
  getMecanicoPerfil,
  getMecanicoOrdenes,
  getMecanicoVehiculos,
  getMecanicoObservaciones,
  postObservacion,
} from "../../services/mecanicoService";

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
  return (
    <span className="badge-estado" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
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
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto",
                 "septiembre","octubre","noviembre","diciembre"];
  return `${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
}

/* ══════════════════════════════════════
   SECCIÓN: INICIO
══════════════════════════════════════ */
function SecInicio({ mecanico, ordenes, setSeccion }) {
  const total       = ordenes.length;
  const pendientes  = ordenes.filter(o => o.estado === "pendiente").length;
  const enProceso   = ordenes.filter(o => o.estado === "en_proceso").length;
  const completadas = ordenes.filter(o => o.estado === "completada").length;
  const pctDia      = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const cTotal = useCounter(total,       true);
  const cPend  = useCounter(pendientes,  true);
  const cProc  = useCounter(enProceso,   true);
  const cComp  = useCounter(completadas, true);

  const urgente    = ordenes.find(o => o.prioridad === "urgente" && o.estado !== "completada");
  const topOrdenes = ordenes.filter(o => o.estado !== "completada").slice(0, 2);

  const circumference = 2 * Math.PI * 42;
  const strokeOffset  = circumference - (pctDia / 100) * circumference;

  return (
    <div className="inicio-v2">
      {/* ── HERO ── */}
      <div className="hero-banner">
        <div className="hero-deco-circle c1"></div>
        <div className="hero-deco-circle c2"></div>
        <div className="hero-left">
          <div className="hero-saludo">{getSaludo()}</div>
          <h2 className="hero-nombre">
            {mecanico.nombre.split(" ")[0]} <span>{mecanico.nombre.split(" ")[1]}</span>
          </h2>
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
            {mecanico.especialidad}
          </div>
        </div>
      </div>

      {/* ── ALERTA URGENTE ── */}
      {urgente && (
        <div className="alerta-urgente">
          <div className="alerta-pulse-dot"></div>
          <i className="bi bi-exclamation-octagon-fill"
             style={{ color: "#c62828", fontSize: "1.2rem", flexShrink: 0 }}></i>
          <div className="alerta-texto">
            <strong>Orden urgente:</strong> {urgente.servicio} — {urgente.vehiculo} · {urgente.cliente}
          </div>
          <button className="alerta-cta" onClick={() => setSeccion("ordenes")}>Ver orden →</button>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="stat-grid">
        {[
          { icon: "bi-card-checklist",    color: "#1a6bdc", bg: "#e8f0fe", label: "Total órdenes", val: cTotal, bar: total      },
          { icon: "bi-hourglass-split",   color: "#e65100", bg: "#fff3e0", label: "Pendientes",    val: cPend,  bar: pendientes  },
          { icon: "bi-gear-fill",         color: "#7c3aed", bg: "#f3e5f5", label: "En proceso",    val: cProc,  bar: enProceso   },
          { icon: "bi-check-circle-fill", color: "#2e7d32", bg: "#e8f5e9", label: "Completadas",   val: cComp,  bar: completadas },
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
              <div className="stat-bar-fill"
                   style={{ width: `${Math.round((s.bar / (total || 1)) * 100)}%`, background: s.color }}>
              </div>
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
            {topOrdenes.length === 0 && (
              <p className="empty-msg">No hay órdenes activas.</p>
            )}
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
                  <div className="taller-bar-fill"
                       style={{ width: `${Math.round((r.val / (total || 1)) * 100)}%`, background: r.color }}>
                  </div>
                </div>
                <span className="taller-bar-num" style={{ color: r.color }}>{r.val}</span>
              </div>
            ))}
          </div>
          <div className="acciones-rapidas-row">
            {[
              { icon: "bi-clipboard-check", label: "Órdenes",       sec: "ordenes",       c: "#1a6bdc", cs: "#e8f0fe" },
              { icon: "bi-car-front",       label: "Vehículos",     sec: "vehiculos",     c: "#2e7d32", cs: "#e8f5e9" },
              { icon: "bi-chat-left-text",  label: "Observaciones", sec: "observaciones", c: "#7c3aed", cs: "#f3e5f5" },
            ].map((a, i) => (
              <button key={i} className="btn-action"
                      style={{ "--c": a.c, "--cs": a.cs }}
                      onClick={() => setSeccion(a.sec)}>
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
function SecOrdenes({ ordenes }) {
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
        {["todas", "pendiente", "en_proceso", "completada"].map(f => (
          <button key={f}
                  className={`filtro-btn ${filtro === f ? "active" : ""}`}
                  onClick={() => setFiltro(f)}>
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
                <span><i className="bi bi-tag"></i> #{o.id}</span>
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
function SecVehiculos({ vehiculosAsignados }) {
  return (
    <div>
      <div className="sec-header">
        <div>
          <h6 className="block-title">Vehículos Asignados</h6>
          <p className="block-sub">Vehículos que tienes actualmente a cargo</p>
        </div>
      </div>
      {vehiculosAsignados.length === 0 && (
        <p className="empty-msg">No tienes vehículos asignados actualmente.</p>
      )}
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
                <div className="veh-stat">
                  <span className="veh-stat-label">Kilometraje</span>
                  <span className={`veh-stat-val ${v.km >= 80000 ? "warn" : ""}`}>
                    {v.km?.toLocaleString("es-CO")} km {v.km >= 80000 ? "⚠" : ""}
                  </span>
                </div>
                <div className="veh-stat">
                  <span className="veh-stat-label">Combustible</span>
                  <span className="veh-stat-val">{v.combustible}</span>
                </div>
                <div className="veh-stat">
                  <span className="veh-stat-label">Color</span>
                  <span className="veh-stat-val">{v.color}</span>
                </div>
                <div className="veh-stat">
                  <span className="veh-stat-label">Cliente</span>
                  <span className="veh-stat-val">{v.cliente}</span>
                </div>
              </div>
              {v.km >= 80000 && (
                <div className="km-alert">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  Supera 80,000 km — revisión preventiva recomendada
                </div>
              )}
              <div className="servicio-actual">
                <i className="bi bi-wrench-adjustable"></i> {v.servicio}
              </div>
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
function SecObservaciones({ idUsuario, ordenes, observaciones, setObservaciones }) {
  const [nueva,     setNueva]     = useState(false);
  const [ordenId,   setOrdenId]   = useState("");
  const [texto,     setTexto]     = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState("");

  const ordenesActivas = ordenes.filter(o => o.estado !== "completada");

  const handleGuardar = async () => {
    if (!ordenId || !texto.trim()) {
      setError("Selecciona una orden y escribe una observación.");
      return;
    }
    setError("");
    setGuardando(true);
    try {
      const nueva = await postObservacion(idUsuario, {
        idOrden: Number(ordenId),
        texto,
      });
      setObservaciones(prev => [nueva, ...prev]);
      setNueva(false);
      setTexto("");
      setOrdenId("");
    } catch (e) {
      setError("Error al guardar. Intenta de nuevo.");
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <div className="sec-header">
        <div>
          <h6 className="block-title">Observaciones</h6>
          <p className="block-sub">Notas técnicas sobre los vehículos atendidos</p>
        </div>
        <button className="btn-nueva" onClick={() => { setNueva(!nueva); setError(""); }}>
          <i className="bi bi-plus-lg"></i> Nueva observación
        </button>
      </div>

      {nueva && (
        <div className="obs-form-card">
          <div className="obs-form-title">
            <i className="bi bi-pencil-square"></i> Agregar observación
          </div>
          <div className="obs-form-row">
            <select
              className="obs-input"
              value={ordenId}
              onChange={e => setOrdenId(e.target.value)}
            >
              <option value="">Seleccionar orden...</option>
              {ordenesActivas.map(o => (
                <option key={o.id} value={o.id}>
                  {o.vehiculo} — {o.servicio}
                </option>
              ))}
            </select>
          </div>
          {error && <p style={{ color: "#c62828", fontSize: "0.82rem", margin: "4px 0" }}>{error}</p>}
          <textarea
            className="obs-textarea"
            placeholder="Escribe aquí la observación técnica..."
            rows={3}
            value={texto}
            onChange={e => setTexto(e.target.value)}
          />
          <div className="obs-form-actions">
            <button className="btn-cancelar" onClick={() => { setNueva(false); setError(""); }}>
              Cancelar
            </button>
            <button className="btn-guardar" onClick={handleGuardar} disabled={guardando}>
              <i className="bi bi-check2"></i> {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <div className="obs-lista">
        {observaciones.length === 0 && (
          <p className="empty-msg">No hay observaciones registradas.</p>
        )}
        {observaciones.map(o => {
          const conf = obsConfig[o.tipo] ?? obsConfig["advertencia"];
          return (
            <div className="obs-card" key={o.id} style={{ borderLeftColor: conf.color }}>
              <div className="obs-header">
                <div className="obs-icon-wrap" style={{ background: conf.bg, color: conf.color }}>
                  <i className={`bi ${conf.icon}`}></i>
                </div>
                <div className="obs-meta">
                  <div className="obs-vehiculo">{o.vehiculo}</div>
                  <div className="obs-sub">
                    <i className="bi bi-person"></i> {o.cliente}
                    &nbsp;·&nbsp;
                    <i className="bi bi-calendar3"></i> {o.fecha}
                  </div>
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
  const { user } = useAuth();                    // ← ajusta si tu contexto usa otro nombre
  const idUsuario = user?.id;                    // ← ajusta si el campo es user.idUsuario, etc.

  const [seccion,            setSeccion]            = useState("inicio");
  const [mecanico,           setMecanico]           = useState(null);
  const [ordenes,            setOrdenes]            = useState([]);
  const [vehiculosAsignados, setVehiculosAsignados] = useState([]);
  const [observaciones,      setObservaciones]      = useState([]);
  const [cargando,           setCargando]           = useState(true);
  const [errorGlobal,        setErrorGlobal]        = useState("");

  useEffect(() => {
    if (!idUsuario) return;
    setCargando(true);
    Promise.all([
      getMecanicoPerfil(idUsuario),
      getMecanicoOrdenes(idUsuario),
      getMecanicoVehiculos(idUsuario),
      getMecanicoObservaciones(idUsuario),
    ])
      .then(([perfil, ords, vehs, obs]) => {
        setMecanico(perfil);
        setOrdenes(ords);
        setVehiculosAsignados(vehs);
        setObservaciones(obs);
      })
      .catch(e => {
        console.error(e);
        setErrorGlobal("No se pudo cargar la información. Verifica tu conexión.");
      })
      .finally(() => setCargando(false));
  }, [idUsuario]);

  if (cargando) return (
    <div className="at-loading-screen">
      <i className="bi bi-gear-fill spin"></i>
      <span>Cargando dashboard...</span>
    </div>
  );

  if (errorGlobal) return (
    <div className="at-loading-screen">
      <i className="bi bi-exclamation-triangle-fill" style={{ color: "#c62828" }}></i>
      <span>{errorGlobal}</span>
    </div>
  );

  if (!mecanico) return null;

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
            <button key={item.sec}
                    className={`at-nav-item ${seccion === item.sec ? "active" : ""}`}
                    onClick={() => setSeccion(item.sec)}>
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
          {seccion === "inicio" && (
            <SecInicio
              mecanico={mecanico}
              ordenes={ordenes}
              setSeccion={setSeccion}
            />
          )}
          {seccion === "ordenes" && (
            <SecOrdenes ordenes={ordenes} />
          )}
          {seccion === "vehiculos" && (
            <SecVehiculos vehiculosAsignados={vehiculosAsignados} />
          )}
          {seccion === "observaciones" && (
            <SecObservaciones
              idUsuario={idUsuario}
              ordenes={ordenes}
              observaciones={observaciones}
              setObservaciones={setObservaciones}
            />
          )}
        </div>
      </div>
    </div>
  );
}