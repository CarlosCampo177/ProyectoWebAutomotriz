import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getMecanicoObservaciones } from "../../../services/mecanicoService";
import "./SecObservaciones.css";

export default function SecObservaciones() {
  const { user }  = useAuth();
  const idUsuario = user?.id;

  const [observaciones, setObservaciones] = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState("");
  const [seleccion,     setSeleccion]     = useState(null);

  useEffect(() => {
    if (!idUsuario) return;
    setCargando(true);
    getMecanicoObservaciones(idUsuario)
      .then(obs => setObservaciones(obs))
      .catch(e => { console.error(e); setError("No se pudieron cargar las observaciones."); })
      .finally(() => setCargando(false));
  }, [idUsuario]);

  if (cargando) return <p className="obs2-empty">Cargando observaciones...</p>;
  if (error)    return <p className="obs2-empty" style={{ color: "#c62828" }}>{error}</p>;

  return (
    <div className="obs2-page">

      <div className="obs2-header">
        <div>
          <h2 className="obs2-title">
            <i className="bi bi-chat-left-text-fill" />
            Observaciones
          </h2>
          <p className="obs2-sub">Notas técnicas sobre los vehículos atendidos</p>
        </div>
      </div>

      {observaciones.length === 0 && (
        <p className="obs2-empty">No hay observaciones registradas.</p>
      )}

      <div className="obs2-lista">
        {observaciones.map((o, i) => (
          <div
            key={o.id ?? i}
            className="obs2-card"
            onClick={() => setSeleccion(o)}
          >
            <div className="obs2-card-left">
              <div className="obs2-dot dot-azul" />
            </div>
            <div className="obs2-card-body">
              <div className="obs2-card-vehiculo">{o.vehiculo}</div>
              <div className="obs2-card-meta">
                <span><i className="bi bi-person" /> {o.cliente}</span>
                <span><i className="bi bi-calendar3" /> {o.fecha}</span>
              </div>
              <p className="obs2-card-texto">{o.texto}</p>
            </div>
            <div className="obs2-card-right">
              <i className="bi bi-chevron-right obs2-chevron" />
            </div>
          </div>
        ))}
      </div>

      {seleccion && (
        <div className="obs2-overlay" onClick={() => setSeleccion(null)}>
          <div className="obs2-modal" onClick={e => e.stopPropagation()}>

            <div className="obs2-modal-top">
              <div className="obs2-modal-icon">
                <i className="bi bi-chat-left-text-fill" />
              </div>
              <button className="obs2-modal-close" onClick={() => setSeleccion(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="obs2-modal-body">
              <div className="obs2-modal-vehiculo">{seleccion.vehiculo}</div>

              <div className="obs2-modal-grid">
                <div className="obs2-modal-item">
                  <span className="obs2-modal-label">Cliente</span>
                  <span className="obs2-modal-val">
                    <i className="bi bi-person-fill" /> {seleccion.cliente}
                  </span>
                </div>
                <div className="obs2-modal-item">
                  <span className="obs2-modal-label">Fecha</span>
                  <span className="obs2-modal-val">
                    <i className="bi bi-calendar3" /> {seleccion.fecha}
                  </span>
                </div>
                {seleccion.tipo && (
                  <div className="obs2-modal-item">
                    <span className="obs2-modal-label">Tipo</span>
                    <span className="obs2-modal-val" style={{ textTransform: "capitalize" }}>
                      {seleccion.tipo}
                    </span>
                  </div>
                )}
              </div>

              <div className="obs2-modal-obs-label">Observación</div>
              <div className="obs2-modal-obs-texto">{seleccion.texto}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}