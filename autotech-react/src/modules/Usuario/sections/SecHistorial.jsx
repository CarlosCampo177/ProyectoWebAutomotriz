import { useMemo, useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext';
import { getCitas } from '../../../services/clienteService';
import "./SecHistorial.css";

const filtrosEstado = ["todas", "pendiente", "confirmada", "perdida", "completada", "cancelada"];

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

const MES_LABEL = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

function fechaCita(cita) {
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
}

function toISODate(fecha) {
  if (!fecha) return "";
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function enriquecerCita(cita) {
  const fecha = fechaCita(cita);
  const estado = cita.estado === "pendiente" && fecha && fecha < new Date()
    ? "perdida"
    : cita.estado;

  return {
    ...cita,
    estado,
    fecha,
    fechaISO: toISODate(fecha),
    mesLabel: fecha ? MES_LABEL[fecha.getMonth()] : cita.mes,
  };
}

function FechaCol({ fecha, dia, mes }) {
  return (
    <div className="sh-fecha">
      <span className="sh-fecha-dia">{fecha ? String(fecha.getDate()).padStart(2, "0") : dia}</span>
      <span className="sh-fecha-mes">{fecha ? MES_LABEL[fecha.getMonth()] : mes}</span>
    </div>
  );
}

function Badge({ estado }) {
  return (
    <span className={`sh-badge sh-badge-${estado}`}>
      {estadoLabels[estado] ?? estado}
    </span>
  );
}

export default function SecHistorial() {
  const { user } = useAuth();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState("todas");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [query, setQuery] = useState("");
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getCitas(user.id)
      .then(res => setHistorial(Array.isArray(res) ? res.map(enriquecerCita) : []))
      .catch(err => {
        console.error(err);
        setHistorial([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const filtrado = useMemo(() => {
    const q = query.trim().toLowerCase();
    return historial
      .filter(c => estado === "todas" || c.estado === estado)
      .filter(c => !desde || c.fechaISO >= desde)
      .filter(c => !hasta || c.fechaISO <= hasta)
      .filter(c => {
        if (!q) return true;
        return [c.servicio, c.vehiculo, c.mecanico, c.estado]
          .some(v => String(v ?? "").toLowerCase().includes(q));
      })
      .sort((a, b) => (b.fecha?.getTime() ?? 0) - (a.fecha?.getTime() ?? 0));
  }, [historial, estado, desde, hasta, query]);

  const resumen = useMemo(() => ({
    total: historial.length,
    completadas: historial.filter(c => c.estado === "completada").length,
    perdidas: historial.filter(c => c.estado === "perdida").length,
    proximas: historial.filter(c => c.estado === "pendiente" || c.estado === "confirmada").length,
  }), [historial]);

  const limpiarFiltros = () => {
    setEstado("todas");
    setDesde("");
    setHasta("");
    setQuery("");
    setSeleccion(null);
  };

  if (loading) return <p style={{ color: "#888" }}>Cargando historial...</p>;

  return (
    <div className={`sh-page ${seleccion ? "sh-has-detail" : ""}`}>
      <div className="sh-main">
        <div className="sh-hero">
          <div>
            <div className="sh-kicker"><i className="bi bi-clock-history" /> Historial completo</div>
            <h2 className="sh-title">Historial de citas</h2>
            <p className="sh-subtitle">Todas tus citas registradas, organizadas por fecha, vehiculo y estado.</p>
          </div>
          <div className="sh-hero-icon">
            <i className="bi bi-calendar2-week" />
          </div>
        </div>

        <div className="sh-stats">
          <div className="sh-stat">
            <i className="bi bi-list-check" />
            <span>{resumen.total}</span>
            <small>Total</small>
          </div>
          <div className="sh-stat ok">
            <i className="bi bi-check2-circle" />
            <span>{resumen.completadas}</span>
            <small>Completadas</small>
          </div>
          <div className="sh-stat warn">
            <i className="bi bi-calendar-x" />
            <span>{resumen.perdidas}</span>
            <small>Perdidas</small>
          </div>
          <div className="sh-stat next">
            <i className="bi bi-calendar-event" />
            <span>{resumen.proximas}</span>
            <small>Activas</small>
          </div>
        </div>

        <div className="sh-toolbar">
          <div className="sh-search">
            <i className="bi bi-search" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por servicio, vehiculo o mecanico"
            />
          </div>
          <label className="sh-date">
            <span>Desde</span>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
          </label>
          <label className="sh-date">
            <span>Hasta</span>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
          </label>
          <button className="sh-clear" onClick={limpiarFiltros}>
            <i className="bi bi-eraser" /> Limpiar
          </button>
        </div>

        <div className="sh-filtros">
          {filtrosEstado.map(f => (
            <button
              key={f}
              className={`sh-filter ${estado === f ? "active" : ""}`}
              onClick={() => { setEstado(f); setSeleccion(null); }}
            >
              {f === "todas" ? "Todas" : estadoLabels[f]}
            </button>
          ))}
        </div>

        <div className="sh-list">
          {filtrado.length === 0 && (
            <div className="sh-empty">
              <i className="bi bi-calendar2-x" />
              <strong>No hay citas con estos filtros.</strong>
              <span>Ajusta la fecha, el estado o la busqueda para ver mas resultados.</span>
            </div>
          )}

          {filtrado.map((h, i) => (
            <button
              key={h.id ?? i}
              className={`sh-item ${seleccion?.id === h.id ? "active" : ""}`}
              data-estado={h.estado}
              onClick={() => setSeleccion(prev => prev?.id === h.id ? null : h)}
            >
              <FechaCol fecha={h.fecha} dia={h.dia} mes={h.mesLabel} />
              <div className="sh-item-body">
                <div className="sh-item-top">
                  <span className="sh-item-title">{h.servicio}</span>
                  <span className="sh-id">#{h.id}</span>
                </div>
                <div className="sh-item-meta">
                  <span><i className="bi bi-clock" /> {h.hora}</span>
                  <span><i className="bi bi-car-front" /> {h.vehiculo}</span>
                  <span><i className="bi bi-person-gear" /> {h.mecanico ?? "Sin mecanico"}</span>
                </div>
              </div>
              <Badge estado={h.estado} />
              <i className="bi bi-chevron-right sh-arrow" />
            </button>
          ))}
        </div>
      </div>

      {seleccion && (
        <aside className="sh-detail">
          <button className="sh-detail-close" onClick={() => setSeleccion(null)}>
            <i className="bi bi-x-lg" />
          </button>
          <div className="sh-detail-head">
            <div className="sh-detail-icon" data-estado={seleccion.estado}>
              <i className="bi bi-wrench-adjustable-circle" />
            </div>
            <div>
              <h3>{seleccion.servicio}</h3>
              <p>Cita #{seleccion.id}</p>
            </div>
          </div>
          <Badge estado={seleccion.estado} />

          <div className="sh-detail-grid">
            <div>
              <i className="bi bi-calendar3" />
              <span>Fecha</span>
              <strong>{seleccion.fechaISO || `${seleccion.dia} ${seleccion.mes}`}</strong>
            </div>
            <div>
              <i className="bi bi-clock" />
              <span>Hora</span>
              <strong>{seleccion.hora}</strong>
            </div>
            <div>
              <i className="bi bi-car-front" />
              <span>Vehiculo</span>
              <strong>{seleccion.vehiculo}</strong>
            </div>
            <div>
              <i className="bi bi-person-gear" />
              <span>Mecanico</span>
              <strong>{seleccion.mecanico ?? "Sin mecanico"}</strong>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
