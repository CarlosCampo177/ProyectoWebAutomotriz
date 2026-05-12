import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getMecanicoVehiculos, getMecanicoOrdenes, postObservacion } from "../../../services/mecanicoService";
import { estadoConfig, Badge } from "../mecanicoHelpers.jsx";
import "./SecVehiculos.css";

export default function SecVehiculos() {
  const { user }  = useAuth();
  const idUsuario = user?.id;

  const [vehiculos,  setVehiculos]  = useState([]);
  const [ordenes,    setOrdenes]    = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState("");

  // id del vehículo cuyo formulario está abierto (solo uno a la vez)
  const [obsAbierta, setObsAbierta] = useState(null);
  const [texto,      setTexto]      = useState("");
  const [guardando,  setGuardando]  = useState(false);
  const [errForm,    setErrForm]    = useState("");
  const [okMsg,      setOkMsg]      = useState("");

  useEffect(() => {
    if (!idUsuario) return;
    setCargando(true);
    Promise.all([
      getMecanicoVehiculos(idUsuario),
      getMecanicoOrdenes(idUsuario),
    ])
      .then(([vehs, ords]) => { setVehiculos(vehs); setOrdenes(ords); })
      .catch(e => { console.error(e); setError("No se pudieron cargar los vehículos."); })
      .finally(() => setCargando(false));
  }, [idUsuario]);

  const abrirObs = (vehId) => {
    setObsAbierta(prev => prev === vehId ? null : vehId);
    setTexto("");
    setErrForm("");
    setOkMsg("");
  };

  const handleGuardar = async (vehiculo) => {
    if (!texto.trim()) { setErrForm("Escribe una observación antes de guardar."); return; }

    // Busca la orden activa asociada a este vehículo
    const orden = ordenes.find(
      o => o.vehiculo === vehiculo.nombre && o.estado !== "completada"
    );
    if (!orden) { setErrForm("No se encontró una orden activa para este vehículo."); return; }

    setErrForm("");
    setGuardando(true);
    try {
      await postObservacion(idUsuario, { idOrden: orden.id, texto });
      setOkMsg("✓ Observación guardada correctamente.");
      setTexto("");
      setTimeout(() => { setObsAbierta(null); setOkMsg(""); }, 1500);
    } catch (e) {
      setErrForm("Error al guardar. Intenta de nuevo.");
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <p className="empty-msg">Cargando vehículos...</p>;
  if (error)    return <p className="empty-msg" style={{ color: "#c62828" }}>{error}</p>;

  return (
    <div>
      <div className="sec-header">
        <div>
          <h6 className="block-title">Vehículos Asignados</h6>
          <p className="block-sub">Vehículos que tienes actualmente a cargo</p>
        </div>
      </div>

      {vehiculos.length === 0 && (
        <p className="empty-msg">No tienes vehículos asignados actualmente.</p>
      )}

      <div className="veh-grid">
        {vehiculos.map(v => (
          <div className="veh-card" key={v.id}>
            <div className="veh-card-top">
              <div className={`veh-icon-wrap ${v.colorWrap ?? "blue"}`}>
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
              {/* ← Botón nuevo */}
              <button
                className="btn-obs-inline"
                onClick={() => abrirObs(v.id)}
                title="Agregar observación"
              >
                <i className="bi bi-chat-left-text"></i>
                {obsAbierta === v.id ? "Cerrar" : "Observación"}
              </button>
            </div>

            {/* Panel inline de observación */}
            {obsAbierta === v.id && (
              <div className="obs-inline-panel">
                <p className="obs-inline-label">
                  <i className="bi bi-pencil-square"></i> Nueva observación
                </p>
                <textarea
                  className="obs-inline-textarea"
                  placeholder="Escribe la observación técnica..."
                  rows={3}
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                />
                {errForm && <p className="obs-inline-err">{errForm}</p>}
                {okMsg   && <p className="obs-inline-ok">{okMsg}</p>}
                <div className="obs-inline-actions">
                  <button
                    className="btn-cancelar"
                    onClick={() => { setObsAbierta(null); setErrForm(""); setOkMsg(""); }}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-guardar"
                    onClick={() => handleGuardar(v)}
                    disabled={guardando}
                  >
                    <i className="bi bi-check2"></i> {guardando ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}