import { useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext';
import { getVehiculos, getCitas } from '../../../services/clienteService';
import "./SecInicioU.css";

const MESES_FULL = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];
const DIAS_SEMANA = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

const estadoLabels = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  perdida: "Perdida",
  completada: "Completada",
  cancelada: "Cancelada",
};

const MESES_CORTOS = {
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
  const mes = MESES_CORTOS[String(cita.mes ?? "").toUpperCase()];
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

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches";
}

function getDateLabel() {
  const d = new Date();
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES_FULL[d.getMonth()]} de ${d.getFullYear()}`;
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="si-modal-overlay" onClick={onClose}>
      <div className="si-modal" onClick={(e) => e.stopPropagation()}>
        <div className="si-modal-header">
          <h3 className="si-modal-title">{title}</h3>
          <button className="si-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="si-modal-body">{children}</div>
      </div>
    </div>
  );
}

function Badge({ estado }) {
  return (
    <span className={`si-badge si-badge-${estado}`}>
      {estadoLabels[estado] ?? estado}
    </span>
  );
}

function AlertaKm({ km }) {
  if (km < 80000) return null;
  return (
    <div className="si-alerta-km">
      <i className="bi bi-exclamation-triangle" />
      Supera 80,000 km — revisión preventiva recomendada
    </div>
  );
}

function StatCard({ icon, label, value, color, bg, onClick }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const step = Math.ceil(value / 20);
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(interval); }
      else setCount(start);
    }, 40);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="si-stat-card" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className="si-stat-icon" style={{ background: bg, color }}>
        <i className={`bi ${icon}`} style={{ fontSize: "1.2rem" }} />
      </div>
      <div className="si-stat-info">
        <span className="si-stat-value">{count}</span>
        <span className="si-stat-label">{label}</span>
      </div>
      <div className="si-stat-chevron" style={{ color }}>›</div>
    </div>
  );
}

export default function SecInicioU() {
  const { user } = useAuth();
  const [modal, setModal]         = useState(null);
  const [vehiculos, setVehiculos] = useState([]);
  const [citas, setCitas]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        const [resV, resC] = await Promise.all([
          getVehiculos(user.id),
          getCitas(user.id),
        ]);
        setVehiculos(Array.isArray(resV) ? resV : []);
        setCitas(Array.isArray(resC) ? resC : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const citasConEstado = citas.map(c =>
    esCitaPerdida(c) ? { ...c, estado: "perdida" } : c
  );
  const pendientes  = citasConEstado.filter(c => c.estado === "pendiente").length;
  const perdidas    = citasConEstado.filter(c => c.estado === "perdida").length;
  const completadas = citasConEstado.filter(c => c.estado === "completada").length;
  const proximas    = citasConEstado.filter(c => c.estado === "pendiente" || c.estado === "confirmada");

  const stats = [
    { icon: "bi-car-front",      bg: "#e8f0fe", color: "#1a6bdc", label: "Vehículos",           value: vehiculos.length },
    { icon: "bi-calendar-check", bg: "#fff3e0", color: "#e65100", label: "Citas pendientes",     value: pendientes       },
    { icon: "bi-tools",          bg: "#e8f5e9", color: "#2e7d32", label: "Servicios realizados", value: completadas      },
    { icon: "bi-calendar-x",     bg: "#fee2e2", color: "#b91c1c", label: "Servicios perdidos",   value: perdidas         },
  ];

  const acciones = [
    { icon: "bi-calendar-plus", label: "Nueva cita",    color: "#1a6bdc", bg: "#e8f0fe", action: () => setModal("nuevaCita") },
    { icon: "bi-car-front",     label: "Mis vehículos", color: "#2e7d32", bg: "#e8f5e9", action: () => {}                    },
    { icon: "bi-robot",         label: "Consultar IA",  color: "#6a1b9a", bg: "#f3e5f5", action: () => {}                    },
    { icon: "bi-clock-history", label: "Ver historial", color: "#e65100", bg: "#fff3e0", action: () => {}                    },
  ];

  if (loading) return <div className="si-wrapper"><p style={{ color: "#888" }}>Cargando...</p></div>;

  return (
    <div className="si-wrapper">

      {/* HERO */}
      <div className="si-hero">
        <div className="si-hero-bg" />
        <div className="si-hero-content">
          <p className="si-hero-sub">{getGreeting()} · {getDateLabel()}</p>
          <h1 className="si-hero-title">
            Hola, <span>{user?.nombre?.split(" ")[0] ?? "Usuario"}</span>{" "}
            <i className="bi bi-person-circle si-hero-icon" />
          </h1>
          <p className="si-hero-desc">Gestiona tus vehículos y citas desde aquí.</p>
          <button className="si-hero-btn" onClick={() => setModal("nuevaCita")}>
            <i className="bi bi-calendar-plus" /> Agendar cita
          </button>
        </div>
        <div className="si-hero-deco">
          <div className="si-hero-circle c1" />
          <div className="si-hero-circle c2" />
          <div className="si-hero-circle c3" />
        </div>
      </div>

      {/* STATS */}
      <div className="si-stats">
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} bg={s.bg} />
        ))}
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="si-section-header">
        <span className="si-section-title">Acciones rápidas</span>
      </div>
      <div className="si-acciones">
        {acciones.map((a, i) => (
          <button key={i} className="si-accion" style={{ "--c": a.color, "--bg": a.bg }} onClick={a.action}>
            <i className={`bi ${a.icon}`} style={{ fontSize: "1.4rem" }} />
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* GRID 2 COL */}
      <div className="si-grid2">

        {/* Próximas citas */}
        <div className="si-panel">
          <div className="si-panel-header">
            <span className="si-panel-title"><i className="bi bi-calendar-check" /> Próximas citas</span>
            <button className="si-ver-mas">Ver todas →</button>
          </div>
          {proximas.length === 0 ? (
            <div className="si-empty">
              <i className="bi bi-calendar-x" style={{ fontSize: "2rem", opacity: .4 }} />
              <p>Sin citas próximas</p>
              <button className="si-empty-btn" onClick={() => setModal("nuevaCita")}>Agendar ahora</button>
            </div>
          ) : (
            proximas.slice(0, 3).map((c, i) => (
              <div key={i} className="si-item">
                <div className="si-item-dot" style={{ background: c.estado === "confirmada" ? "#2e7d32" : "#1a6bdc" }} />
                <div className="si-item-body">
                  <p className="si-item-title">{c.servicio}</p>
                  <p className="si-item-meta">{c.dia} {c.mes} · {c.hora} · {c.vehiculo}</p>
                </div>
                <Badge estado={c.estado} />
              </div>
            ))
          )}
        </div>

        {/* Mis vehículos */}
        <div className="si-panel">
          <div className="si-panel-header">
            <span className="si-panel-title"><i className="bi bi-car-front" /> Mis vehículos</span>
            <button className="si-ver-mas">Ver todos →</button>
          </div>
          {vehiculos.length === 0 ? (
            <div className="si-empty">
              <i className="bi bi-car-front" style={{ fontSize: "2rem", opacity: .4 }} />
              <p>Sin vehículos registrados</p>
            </div>
          ) : (
            vehiculos.map((v, i) => (
              <div key={i} className="si-item si-item--veh">
                <div className="si-veh-icon"><i className="bi bi-car-front" /></div>
                <div className="si-item-body">
                  <p className="si-item-title">{v.nombre}</p>
                  <p className="si-item-meta">{v.placa} · {v.anio}</p>
                  <AlertaKm km={v.km} />
                </div>
                <span className="si-veh-km">{v.km?.toLocaleString("es-CO")} km</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL NUEVA CITA */}
      {modal === "nuevaCita" && (
        <Modal title="Agendar nueva cita" onClose={() => setModal(null)}>
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
            <div className="si-form-group">
              <label>Vehículo</label>
              <select>
                {vehiculos.length === 0
                  ? <option>Sin vehículos registrados</option>
                  : vehiculos.map((v, i) => <option key={i}>{v.nombre} — {v.placa}</option>)
                }
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
              <textarea rows={3} placeholder="Describe el problema o servicio requerido..." />
            </div>
            <div className="si-form-actions">
              <button className="si-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button className="si-btn-primary" onClick={() => setModal(null)}>Confirmar cita</button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
