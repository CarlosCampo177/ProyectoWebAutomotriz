// src/modules/Mecanico/sections/SecOrdenes.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getMecanicoOrdenes } from "../../../services/mecanicoService";
import { estadoConfig, prioridadConfig, Badge } from "../mecanicoHelpers.jsx";

export default function SecOrdenes() {
  const { user }  = useAuth();
  const idUsuario = user?.id;

  const [ordenes,  setOrdenes]  = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState("");
  const [filtro,   setFiltro]   = useState("todas");

  useEffect(() => {
    if (!idUsuario) return;
    setCargando(true);
    getMecanicoOrdenes(idUsuario)
      .then(data => setOrdenes(data))
      .catch(e => { console.error(e); setError("No se pudieron cargar las órdenes."); })
      .finally(() => setCargando(false));
  }, [idUsuario]);

  const lista = filtro === "todas"
    ? ordenes
    : ordenes.filter(o => o.estado === filtro);

  if (cargando) return <p className="empty-msg">Cargando órdenes...</p>;
  if (error)    return <p className="empty-msg" style={{ color: "#c62828" }}>{error}</p>;

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
          <button
            key={f}
            className={`filtro-btn ${filtro === f ? "active" : ""}`}
            onClick={() => setFiltro(f)}
          >
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