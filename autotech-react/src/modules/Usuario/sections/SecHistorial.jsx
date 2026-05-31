import { useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext';
import "./SecHistorial.css";

function FechaCol({ dia, mes }) {
  return (
    <div className="sh-fecha">
      <span className="sh-fecha-dia">{dia}</span>
      <span className="sh-fecha-mes">{mes}</span>
    </div>
  );
}

export default function SecHistorial() {
  const { user }                    = useAuth();
  const [historial, setHistorial]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/Cliente/${user.id}/historial`)
      .then(r => r.json())
      .then(setHistorial)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p style={{ color: "#888" }}>Cargando historial...</p>;

  return (
    <div>
      <div className="sh-header-sec">
        <div className="sh-title">Historial de Mantenimiento</div>
        <div className="sh-subtitle">Todos los servicios realizados a tus vehículos</div>
      </div>

      {historial.length === 0 && (
        <div className="sh-empty">No hay servicios registrados en el historial.</div>
      )}

      <div className="sh-list">
        {historial.map((h, i) => (
          <div key={h.id ?? i} className="sh-item">
            <FechaCol dia={h.dia} mes={h.mes} />
            <div className="sh-item-body">
              <div className="sh-item-title">{h.servicio}</div>
              <div className="sh-item-meta">
                <span>{h.vehiculo}</span>
                <span>{h.mecanico}</span>
                <span>${h.monto?.toLocaleString("es-CO")}</span>
              </div>
            </div>
            <span className="sh-badge">Completado</span>
          </div>
        ))}
      </div>
    </div>
  );
}