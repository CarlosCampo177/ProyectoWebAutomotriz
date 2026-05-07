// src/modules/Mecanico/mecanicoHelpers.js

import { useState, useEffect } from "react";

/* ── Configs de badges ── */
export const estadoConfig = {
  en_proceso: { bg: "#e8f0fe", color: "#1a6bdc", label: "En proceso" },
  pendiente:  { bg: "#fff3e0", color: "#e65100", label: "Pendiente"  },
  completada: { bg: "#e8f5e9", color: "#2e7d32", label: "Completada" },
};

export const prioridadConfig = {
  normal:  { bg: "#f0f2f7", color: "#5a6a8a", label: "Normal"  },
  alta:    { bg: "#fff3e0", color: "#e65100", label: "Alta"    },
  urgente: { bg: "#fce4ec", color: "#c62828", label: "Urgente" },
};

export const obsConfig = {
  advertencia: { bg: "#fff8e1", color: "#f57c00", icon: "bi-exclamation-triangle-fill" },
  info:        { bg: "#e3f2fd", color: "#1565c0", icon: "bi-info-circle-fill"          },
  ok:          { bg: "#e8f5e9", color: "#2e7d32", icon: "bi-check-circle-fill"         },
  urgente:     { bg: "#fce4ec", color: "#c62828", icon: "bi-x-octagon-fill"            },
};

/* ── Badge reutilizable ── */
export function Badge({ tipo, config }) {
  const c = config[tipo];
  if (!c) return null;
  return (
    <span className="badge-estado" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

/* ── Contador animado ── */
export function useCounter(target, active) {
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

/* ── Saludo y fecha ── */
export function getSaludo() {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches";
}

export function getFecha() {
  const hoy   = new Date();
  const dias  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto",
                 "septiembre","octubre","noviembre","diciembre"];
  return `${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
}