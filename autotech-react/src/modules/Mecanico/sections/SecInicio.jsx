// src/modules/Mecanico/sections/SecInicio.jsx

import { estadoConfig, prioridadConfig, useCounter, getSaludo, getFecha } from "../mecanicoHelpers.jsx";

export default function SecInicio({ mecanico, ordenes, setSeccion }) {
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
            {topOrdenes.length === 0 && <p className="empty-msg">No hay órdenes activas.</p>}
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