import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getMecanicoOrdenes, cambiarEstadoOrden } from "../../../services/mecanicoService";
import { estadoConfig, prioridadConfig } from "../mecanicoHelpers.jsx";
import "./SecOrdenes.css";

export default function SecOrdenes() {
  const { user }  = useAuth();
  const idUsuario = user?.id;

  const [ordenes,    setOrdenes]    = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState("");
  const [filtro,     setFiltro]     = useState("todas");
  const [seleccion,  setSeleccion]  = useState(null);

  useEffect(() => {
    if (!idUsuario) return;
    setCargando(true);
    getMecanicoOrdenes(idUsuario)
      .then(data => setOrdenes(data))
      .catch(e => { console.error(e); setError("No se pudieron cargar las órdenes."); })
      .finally(() => setCargando(false));
  }, [idUsuario]);

  const FILTROS = [
    { key: "todas",      label: "Todas"      },
    { key: "pendiente",  label: "Pendiente"  },
    { key: "en_proceso", label: "En proceso" },
    { key: "completada", label: "Completada" },
  ];

  const lista = filtro === "todas"
    ? ordenes
    : ordenes.filter(o => o.estado === filtro);

  const iniciales = (nombre = "") =>
    nombre.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  const seleccionar = (orden) =>
    setSeleccion(prev => prev?.id === orden.id ? null : orden);

  const cerrar = () => setSeleccion(null);

  const actualizarEstado = async () => {
    if (!seleccion) return;
    if (seleccion.estado === "completada") return;
    try {
      const res = await cambiarEstadoOrden(idUsuario, seleccion.id);
      setOrdenes(prev =>
        prev.map(o => o.id === seleccion.id ? { ...o, estado: res.estado } : o)
      );
      setSeleccion(prev => ({ ...prev, estado: res.estado }));
    } catch {
      alert("No se pudo cambiar el estado.");
    }
  };

  if (cargando) return <p className="sec-empty">Cargando órdenes...</p>;
  if (error)    return <p className="sec-empty sec-error">{error}</p>;

  return (
    <div className={`sec-page ${seleccion ? "sec-has-panel" : ""}`}>

      {/* ── COLUMNA PRINCIPAL ── */}
      <div className="sec-main">

        <div className="sec-header">
          <div>
            <h2 className="sec-title">
              <i className="bi bi-clipboard-check me-2" />
              Mis órdenes
            </h2>
            <p className="sec-sub">Órdenes de trabajo asignadas a ti</p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="sec-filtros">
          {FILTROS.map(f => (
            <button
              key={f.key}
              className={`sec-filtro-btn ${filtro === f.key ? "active" : ""}`}
              onClick={() => { setFiltro(f.key); setSeleccion(null); }}
            >
              {f.label}
            </button>
          ))}
          <span className="sec-count">{lista.length} orden{lista.length !== 1 ? "es" : ""}</span>
        </div>

        {/* LISTA */}
        <div className="sec-lista">
          {lista.length === 0 && (
            <p className="sec-empty">No hay órdenes con este estado.</p>
          )}
          {lista.map(o => (
            <div
              key={o.id}
              className={`orden-card ${seleccion?.id === o.id ? "orden-selected" : ""}`}
              onClick={() => seleccionar(o)}
            >
              <div className="orden-fecha">
                <span className="fecha-dia">{o.fecha?.dia ?? "--"}</span>
                <span className="fecha-mes">{o.fecha?.mes ?? "---"}</span>
              </div>

              <div className="orden-info">
                <div className="orden-titulo">{o.servicio}</div>
                <div className="orden-meta">
                  <span><i className="bi bi-tag" /> #{o.id}</span>
                  <span><i className="bi bi-clock" /> {o.hora}</span>
                  <span><i className="bi bi-car-front" /> {o.vehiculo} — {o.placa}</span>
                  <span><i className="bi bi-person" /> {o.cliente}</span>
                </div>
              </div>

              <div className="orden-badges">
                <span className={`sec-badge prioridad-${o.prioridad}`}>
                  {prioridadConfig[o.prioridad]?.label ?? o.prioridad}
                </span>
                <span className={`sec-badge estado-${o.estado}`}>
                  {estadoConfig[o.estado]?.label ?? o.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PANEL LATERAL ── */}
      {seleccion && (
        <aside className="sec-panel">

          <div className="panel-top">
            <div>
              <div className="panel-servicio">{seleccion.servicio}</div>
              <div className="panel-id">Orden #{seleccion.id}</div>
            </div>
            <button className="panel-close" onClick={cerrar}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="panel-body">

            <div className="panel-section">
              <p className="panel-section-title">Fecha y hora</p>
              <div className="panel-row">
                <i className="bi bi-calendar3" />
                <span>{seleccion.fecha?.dia} {seleccion.fecha?.mes}</span>
              </div>
              <div className="panel-row">
                <i className="bi bi-clock" />
                <span>{seleccion.hora}</span>
              </div>
            </div>

            <div className="panel-section">
              <p className="panel-section-title">Vehículo</p>
              <div className="panel-row">
                <i className="bi bi-car-front" />
                <span>{seleccion.vehiculo}</span>
              </div>
              <div className="panel-row">
                <i className="bi bi-upc-scan" />
                <span className="panel-placa">{seleccion.placa}</span>
              </div>
            </div>

            <div className="panel-section">
              <p className="panel-section-title">Cliente</p>
              <div className="panel-row">
                <div className="panel-avatar">{iniciales(seleccion.cliente)}</div>
                <span style={{ fontWeight: 500 }}>{seleccion.cliente}</span>
              </div>
            </div>

            <div className="panel-section">
              <p className="panel-section-title">Estado actual</p>
              <div className="panel-row" style={{ gap: "6px" }}>
                <span className={`sec-badge prioridad-${seleccion.prioridad}`}>
                  {prioridadConfig[seleccion.prioridad]?.label ?? seleccion.prioridad}
                </span>
                <span className={`sec-badge estado-${seleccion.estado}`}>
                  {estadoConfig[seleccion.estado]?.label ?? seleccion.estado}
                </span>
              </div>
            </div>

          </div>

          <div className="panel-footer">
            <button
              className="panel-btn panel-btn-primary"
              onClick={actualizarEstado}
              disabled={seleccion.estado !== "pendiente"}
              style={{ opacity: seleccion.estado !== "pendiente" ? 0.45 : 1 }}
            >
              <i className="bi bi-play-fill me-1" /> Iniciar orden
            </button>
            <button
              className="panel-btn"
              onClick={actualizarEstado}
              disabled={seleccion.estado !== "en_proceso"}
              style={{ opacity: seleccion.estado !== "en_proceso" ? 0.45 : 1 }}
            >
              <i className="bi bi-check-lg me-1" /> Marcar completada
            </button>
          </div>

        </aside>
      )}
    </div>
  );
}