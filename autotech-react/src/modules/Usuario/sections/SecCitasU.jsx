import { useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext';
import { getCitas } from '../../../services/clienteService';
import "./SecCitasU.css";

const filtros = ["todas", "pendiente", "confirmada", "completada", "cancelada"];

function Badge({ estado }) {
  return (
    <span className={`sc-badge sc-badge-${estado}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}

function FechaCol({ dia, mes }) {
  return (
    <div className="sc-fecha">
      <span className="sc-fecha-dia">{dia}</span>
      <span className="sc-fecha-mes">{mes}</span>
    </div>
  );
}

export default function SecCitas() {
  const { user }              = useAuth();
  const [filtro, setFiltro]   = useState("todas");
  const [citas, setCitas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getCitas(user.id)
      .then(res => setCitas(Array.isArray(res) ? res : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const lista = filtro === "todas" ? citas : citas.filter(c => c.estado === filtro);

  if (loading) return <p style={{ color: "#888" }}>Cargando citas...</p>;

  return (
    <div>
      <div className="sc-header">
        <div>
          <div className="sc-title">Mis Citas</div>
          <div className="sc-subtitle">Consulta y gestiona todas tus citas agendadas</div>
        </div>
        <button className="sc-btn-add" onClick={() => setModal(true)}>
          <i className="bi bi-calendar-plus" /> Agendar cita
        </button>
      </div>

      <div className="sc-filtros">
        {filtros.map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`sc-filtro${filtro === f ? " active" : ""}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="sc-list">
        {lista.length === 0 && <div className="sc-empty">No hay citas con este estado.</div>}
        {lista.map((c, i) => (
          <div key={c.id ?? i} className="sc-item">
            <FechaCol dia={c.dia} mes={c.mes} />
            <div className="sc-item-body">
              <div className="sc-item-title">{c.servicio}</div>
              <div className="sc-item-meta">
                <span>{c.hora}</span>
                <span>{c.vehiculo}</span>
                <span>{c.mecanico}</span>
              </div>
              {c.observaciones && <div className="sc-item-obs">"{c.observaciones}"</div>}
            </div>
            <Badge estado={c.estado} />
          </div>
        ))}
      </div>

      {modal && (
        <div className="si-modal-overlay" onClick={() => setModal(false)}>
          <div className="si-modal" onClick={e => e.stopPropagation()}>
            <div className="si-modal-header">
              <h3 className="si-modal-title">Agendar nueva cita</h3>
              <button className="si-modal-close" onClick={() => setModal(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="si-modal-body">
              <div className="si-form">
                <div className="si-form-group">
                  <label>Servicio</label>
                  <select>
                    <option>Cambio de aceite</option>
                    <option>Revisión general</option>
                    <option>Frenos</option>
                    <option>Diagnóstico</option>
                  </select>
                </div>
                <div className="si-form-row">
                  <div className="si-form-group">
                    <label>Fecha</label>
                    <input type="date" min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="si-form-group">
                    <label>Hora</label>
                    <select>
                      {["08:00","09:00","10:00","11:00","14:00","15:00","16:00"].map(h => (
                        <option key={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="si-form-group">
                  <label>Observaciones</label>
                  <textarea rows={3} placeholder="Describe el problema..." />
                </div>
                <div className="si-form-actions">
                  <button className="si-btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                  <button className="si-btn-primary">Confirmar cita</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}