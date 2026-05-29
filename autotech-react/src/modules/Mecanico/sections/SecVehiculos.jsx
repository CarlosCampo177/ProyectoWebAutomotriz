import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getMecanicoVehiculos,
  postObservacion,
} from "../../../services/mecanicoService";
import { estadoConfig, Badge } from "../mecanicoHelpers.jsx";
import "./SecVehiculos.css";

export default function SecVehiculos() {
  const { user } = useAuth();
  const idUsuario = user?.id;

  const [vehiculos,  setVehiculos]  = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState("");
  const [seleccion,  setSeleccion]  = useState(null);

  // obs — solo en panel lateral
  const [obsAbierta, setObsAbierta] = useState(false);
  const [texto,      setTexto]      = useState("");
  const [guardando,  setGuardando]  = useState(false);
  const [errForm,    setErrForm]    = useState("");
  const [okMsg,      setOkMsg]      = useState("");

  useEffect(() => {
    if (!idUsuario) return;
    setCargando(true);
    getMecanicoVehiculos(idUsuario)
      .then((data) => setVehiculos(data))
      .catch((e) => { console.error(e); setError("No se pudieron cargar los vehículos."); })
      .finally(() => setCargando(false));
  }, [idUsuario]);

  const seleccionar = (v) => {
    setSeleccion((prev) => (prev?.id === v.id ? null : v));
    setObsAbierta(false);
    setTexto(""); setErrForm(""); setOkMsg("");
  };

  const cerrarPanel = () => {
    setSeleccion(null);
    setObsAbierta(false);
    setTexto(""); setErrForm(""); setOkMsg("");
  };

  const toggleObs = () => {
    setObsAbierta((prev) => !prev);
    setTexto(""); setErrForm(""); setOkMsg("");
  };

  const handleGuardar = async () => {
    if (!texto.trim()) { setErrForm("Escribe una observación antes de guardar."); return; }
    if (!seleccion?.idOrden) { setErrForm("Este vehículo no tiene una orden activa."); return; }
    setErrForm(""); setGuardando(true);
    try {
      await postObservacion(idUsuario, { idOrden: seleccion.idOrden, texto });
      setOkMsg("✓ Observación guardada correctamente.");
      setTexto("");
      setTimeout(() => { setObsAbierta(false); setOkMsg(""); }, 1500);
    } catch (err) {
      setErrForm("Error al guardar. Intenta de nuevo.");
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <p className="empty-msg">Cargando vehículos...</p>;
  if (error)    return <p className="empty-msg" style={{ color: "#dc2626" }}>{error}</p>;

  return (
    <div className="veh-page">

      {/* ── COLUMNA PRINCIPAL ── */}
      <div className="veh-main">
        <div className="veh-header">
          <div>
            <h2 className="veh-title">
              <i className="bi bi-car-front-fill" />
              Vehículos asignados
            </h2>
            <p className="veh-sub">Vehículos que tienes actualmente a cargo</p>
          </div>
        </div>

        {vehiculos.length === 0 && (
          <p className="empty-msg">No tienes vehículos asignados actualmente.</p>
        )}

        <div className="veh-grid">
          {vehiculos.map((v) => (
            <div
              key={v.id}
              className={`veh-card ${seleccion?.id === v.id ? "selected" : ""}`}
              onClick={() => seleccionar(v)}
            >
              <div className="veh-card-top">
                <div className={`veh-icon-wrap ${v.colorWrap ?? "blue"}`}>
                  <i className="bi bi-car-front-fill" />
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
                    <i className="bi bi-exclamation-triangle-fill" />
                    Supera 80,000 km — revisión preventiva recomendada
                  </div>
                )}

                <div className="servicio-actual">
                  <i className="bi bi-wrench-adjustable" /> {v.servicio}
                </div>
              </div>

              {/* Footer sin botón de observación */}
              <div className="veh-card-footer">
                <Badge tipo={v.estado} config={estadoConfig} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PANEL LATERAL DETALLE ── */}
      {seleccion && (
        <aside className="veh-panel">

          <div className="veh-panel-top">
            <div>
              <div className="veh-panel-nombre">{seleccion.nombre}</div>
              <span className="veh-panel-placa">{seleccion.placa}</span>
            </div>
            <button className="veh-panel-close" onClick={cerrarPanel}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="veh-panel-body">

            <div className="veh-panel-section">
              <p className="veh-panel-section-title">Información del vehículo</p>
              <div className="veh-panel-grid">
                <div className="veh-panel-item">
                  <span className="veh-panel-label">Año</span>
                  <span className="veh-panel-val">{seleccion.anio}</span>
                </div>
                <div className="veh-panel-item">
                  <span className="veh-panel-label">Color</span>
                  <span className="veh-panel-val">{seleccion.color}</span>
                </div>
                <div className="veh-panel-item">
                  <span className="veh-panel-label">Kilometraje</span>
                  <span className={`veh-panel-val ${seleccion.km >= 80000 ? "warn" : ""}`}>
                    {seleccion.km?.toLocaleString("es-CO")} km
                  </span>
                </div>
                <div className="veh-panel-item">
                  <span className="veh-panel-label">Combustible</span>
                  <span className="veh-panel-val">{seleccion.combustible}</span>
                </div>
              </div>
            </div>

            <div className="veh-panel-section">
              <p className="veh-panel-section-title">Propietario</p>
              <div className="veh-panel-row">
                <i className="bi bi-person-circle" />
                <span style={{ fontWeight: 500, color: "#1e293b" }}>{seleccion.cliente}</span>
              </div>
            </div>

            <div className="veh-panel-section">
              <p className="veh-panel-section-title">Servicio actual</p>
              <div className="veh-panel-servicio">
                <i className="bi bi-wrench-adjustable" />
                {seleccion.servicio}
              </div>
            </div>

            <div className="veh-panel-section">
              <p className="veh-panel-section-title">Estado</p>
              <Badge tipo={seleccion.estado} config={estadoConfig} />
            </div>

            {/* Formulario de observación inline en el panel */}
            {obsAbierta && (
              <div className="veh-obs-form">
                <p className="obs-inline-label">
                  <i className="bi bi-pencil-square" /> Nueva observación
                </p>
                <textarea
                  className="obs-inline-textarea"
                  placeholder="Escribe la observación técnica..."
                  rows={3}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
                {errForm && <p className="obs-inline-err">{errForm}</p>}
                {okMsg   && <p className="obs-inline-ok">{okMsg}</p>}
                <div className="obs-inline-actions">
                  <button className="btn-cancelar" onClick={() => { setObsAbierta(false); setErrForm(""); setOkMsg(""); }}>
                    Cancelar
                  </button>
                  <button className="btn-guardar" onClick={handleGuardar} disabled={guardando}>
                    <i className="bi bi-check2" /> {guardando ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className="veh-panel-footer">
            <button
              className={`veh-panel-btn veh-panel-btn-primary ${obsAbierta ? "veh-panel-btn-outline" : ""}`}
              onClick={toggleObs}
            >
              <i className={`bi ${obsAbierta ? "bi-x" : "bi-chat-left-text"}`} />
              {obsAbierta ? "Cancelar observación" : "Agregar observación"}
            </button>
          </div>

        </aside>
      )}
    </div>
  );
}