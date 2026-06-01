import { useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext';
import { getCitas } from '../../../services/clienteService';
import "./SecCitasU.css";

const filtros = ["todas", "pendiente", "confirmada", "perdida", "completada", "cancelada"];

const estadoLabels = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  perdida: "Perdida",
  completada: "Completada",
  cancelada: "Cancelada",
};

const MESES = {
  ENE: 0, JAN: 0,
  FEB: 1,
  MAR: 2,
  ABR: 3, APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AGO: 7, AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DIC: 11, DEC: 11,
};

const fechaCita = (cita) => {
  const mes = MESES[String(cita.mes ?? "").toUpperCase()];
  const dia = Number(cita.dia);
  if (mes === undefined || Number.isNaN(dia)) return null;

  const [horaStr = "00:00", periodoRaw = ""] = String(cita.hora ?? "").trim().split(" ");
  let [hora = 0, minuto = 0] = horaStr.split(":").map(Number);
  const periodo = periodoRaw.toUpperCase();

  if (Number.isNaN(hora)) hora = 0;
  if (Number.isNaN(minuto)) minuto = 0;
  if (periodo === "PM" && hora !== 12) hora += 12;
  if (periodo === "AM" && hora === 12) hora = 0;

  return new Date(new Date().getFullYear(), mes, dia, hora, minuto);
};

const esCitaPerdida = (cita) => {
  if (cita.estado !== "pendiente") return false;
  const fecha = fechaCita(cita);
  return fecha ? fecha < new Date() : false;
};

function Badge({ estado }) {
  return (
    <span className={`sc-badge sc-badge-${estado}`}>
      {estadoLabels[estado] ?? estado}
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

function PanelDetalle({ cita, onClose }) {
  if (!cita) return null;

  return (
    <aside className="sc-panel">
      <div className="sc-panel-top">
        <div>
          <div className="sc-panel-title">{cita.servicio}</div>
          <div className="sc-panel-id">Cita #{cita.id}</div>
        </div>
        <button className="sc-panel-close" onClick={onClose}>
          <i className="bi bi-x-lg" />
        </button>
      </div>

      <Badge estado={cita.estado} />

      <div className="sc-panel-body">
        <div className="sc-panel-section">
          <p className="sc-panel-section-title">Fecha y hora</p>
          <div className="sc-panel-row">
            <i className="bi bi-calendar3" />
            <span>{cita.dia} {cita.mes}</span>
          </div>
          <div className="sc-panel-row">
            <i className="bi bi-clock" />
            <span>{cita.hora}</span>
          </div>
        </div>

        <div className="sc-panel-section">
          <p className="sc-panel-section-title">Vehículo</p>
          <div className="sc-panel-row">
            <i className="bi bi-car-front" />
            <span>{cita.vehiculo}</span>
          </div>
        </div>

        <div className="sc-panel-section">
          <p className="sc-panel-section-title">Mecánico asignado</p>
          <div className="sc-panel-row">
            <div className="sc-panel-avatar">
              {(cita.mecanico ?? "NA").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
            </div>
            <span>{cita.mecanico ?? "Sin mecánico asignado"}</span>
          </div>
        </div>

        <div className="sc-panel-section">
          <p className="sc-panel-section-title">Observaciones</p>
          <div className="sc-panel-note">
            <i className="bi bi-chat-left-text" />
            <span>{cita.observaciones || "Sin observaciones registradas."}</span>
          </div>
        </div>
      </div>

    </aside>
  );
}

export default function SecCitas() {
  const { user }              = useAuth();
  const [filtro, setFiltro]   = useState("todas");
  const [citas, setCitas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    getCitas(user.id)
      .then(res => setCitas(Array.isArray(res) ? res : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const citasConEstado = citas.map(c =>
    esCitaPerdida(c) ? { ...c, estado: "perdida" } : c
  );

  const lista = filtro === "todas"
    ? citasConEstado
    : citasConEstado.filter(c => c.estado === filtro);

  if (loading) return <p style={{ color: "#888" }}>Cargando citas...</p>;

  return (
    <div className={`sc-page ${seleccion ? "sc-has-panel" : ""}`}>
      <div className="sc-main">
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
          <button key={f} onClick={() => { setFiltro(f); setSeleccion(null); }} className={`sc-filtro${filtro === f ? " active" : ""}`}>
            {f === "todas" ? "Todas" : estadoLabels[f]}
          </button>
        ))}
        <span className="sc-count">{lista.length} cita{lista.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="sc-list">
        {lista.length === 0 && <div className="sc-empty">No hay citas con este estado.</div>}
        {lista.map((c, i) => (
          <button
            key={c.id ?? i}
            className={`sc-item ${seleccion?.id === c.id ? "active" : ""}`}
            data-estado={c.estado}
            onClick={() => setSeleccion(prev => prev?.id === c.id ? null : c)}
          >
            <FechaCol dia={c.dia} mes={c.mes} />
            <div className="sc-item-body">
              <div className="sc-item-title">
                {c.servicio}
                <span className="sc-item-id">#{c.id}</span>
              </div>
              <div className="sc-item-meta">
                <span><i className="bi bi-clock" /> {c.hora}</span>
                <span><i className="bi bi-car-front" /> {c.vehiculo}</span>
                <span><i className="bi bi-person-gear" /> {c.mecanico}</span>
              </div>
              {c.observaciones && <div className="sc-item-obs">"{c.observaciones}"</div>}
            </div>
            <Badge estado={c.estado} />
            <i className="bi bi-chevron-right sc-item-arrow" />
          </button>
        ))}
      </div>
      </div>

      <PanelDetalle cita={seleccion} onClose={() => setSeleccion(null)} />

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
