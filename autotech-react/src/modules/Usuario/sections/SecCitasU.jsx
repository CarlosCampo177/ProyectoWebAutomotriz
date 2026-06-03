import { useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext';
import { getCitas, getVehiculos, postCita, getMecanicos } from '../../../services/clienteService';
import "./SecCitasU.css";

const filtros = ["todas", "pendiente", "confirmada", "perdida", "completada", "cancelada"];

const estadoLabels = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  perdida: "Perdida",
  completada: "Completada",
  cancelada: "Cancelada",
};

const SERVICIOS_DISPONIBLES = [
  "Cambio de aceite",
  "Revisión general",
  "Frenos",
  "Diagnóstico electrónico",
  "Alineación y balanceo",
  "Cambio de llantas",
  "Sistema eléctrico",
  "Aire acondicionado",
  "Suspensión",
  "Transmisión",
];

const SLOTS_HORA = Array.from({ length: 20 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  const h24 = `${String(h).padStart(2, "0")}:${m}`;
  const ap = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const label = `${h12}:${m} ${ap}`;
  return { value: h24, label };
});

const MESES = {
  ENE: 0, JAN: 0, FEB: 1, MAR: 2, ABR: 3, APR: 3,
  MAY: 4, JUN: 5, JUL: 6, AGO: 7, AUG: 7,
  SEP: 8, OCT: 9, NOV: 10, DIC: 11, DEC: 11,
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

/* ──────────────────────────────────────────
   MODAL AGENDAR CITA — export nombrado para reusar en SecInicioU
────────────────────────────────────────── */
const FORM_VACIO = {
  servicio: "",
  idVehiculo: "",
  mecanicoId: "",
  fecha: "",
  hora: "",
  observaciones: "",
};

export function ModalAgendarCita({ vehiculos = [], mecanicos = [], onClose, onConfirmar }) {
  const [form, setForm] = useState(FORM_VACIO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const hoy = new Date().toISOString().split("T")[0];
  const maxFecha = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  })();

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleConfirmar = async () => {
    if (!form.idVehiculo) { setError("Selecciona un vehículo."); return; }
    if (!form.servicio)   { setError("Selecciona el servicio."); return; }
    if (!form.fecha)      { setError("Elige una fecha."); return; }
    if (!form.hora)       { setError("Elige una hora."); return; }
    try {
      setSaving(true);
      setError("");
      await onConfirmar(form);
      onClose();
    } catch (err) {
      setError(err?.message || "Error al agendar la cita.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="si-modal-overlay" onClick={onClose}>
      <div className="si-modal sc-modal-agenda" onClick={e => e.stopPropagation()}>

        <div className="si-modal-header">
          <div className="sc-modal-header-inner">
            <div className="sc-modal-icon">
              <i className="bi bi-calendar-plus" />
            </div>
            <div>
              <h3 className="si-modal-title">Agendar nueva cita</h3>
              <p className="sc-modal-sub">Completa los datos y el taller confirmará tu cita</p>
            </div>
          </div>
          <button className="si-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="si-modal-body">
          {error && (
            <div className="sc-modal-error">
              <i className="bi bi-exclamation-circle me-1" />
              {error}
            </div>
          )}

          <div className="si-form-group">
            <label><i className="bi bi-car-front me-1" />Vehículo</label>
            <select value={form.idVehiculo} onChange={e => f("idVehiculo", e.target.value)}>
              <option value="">— Selecciona tu vehículo —</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.nombre} ({v.anio}) — {v.placa}</option>
              ))}
            </select>
          </div>

          <div className="si-form-group">
            <label><i className="bi bi-wrench me-1" />Servicio solicitado</label>
            <select value={form.servicio} onChange={e => f("servicio", e.target.value)}>
              <option value="">— ¿Qué necesitas? —</option>
              {SERVICIOS_DISPONIBLES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="si-form-row">
            <div className="si-form-group">
              <label><i className="bi bi-calendar3 me-1" />Fecha</label>
              <input
                type="date"
                value={form.fecha}
                min={hoy}
                max={maxFecha}
                onChange={e => f("fecha", e.target.value)}
              />
            </div>
            <div className="si-form-group">
              <label><i className="bi bi-clock me-1" />Hora</label>
              <select value={form.hora} onChange={e => f("hora", e.target.value)}>
                <option value="">— Selecciona —</option>
                {SLOTS_HORA.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="si-form-group">
            <label>
              <i className="bi bi-chat-left-text me-1" />
              Observaciones <span className="sc-opcional">(opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe el problema o lo que notas en tu vehículo..."
              value={form.observaciones}
              onChange={e => f("observaciones", e.target.value)}
            />
          </div>

          <div className="si-form-group">
            <label>
              <i className="bi bi-person-badge me-1" />
              Mecánico <span className="sc-opcional">(opcional)</span>
            </label>
            <select value={form.mecanicoId} onChange={e => f("mecanicoId", e.target.value)}>
              <option value="">— Sin preferencia —</option>
              {mecanicos.map(m => (
                <option key={m.id} value={m.id}>{m.nombre} — {m.especialidad}</option>
              ))}
            </select>
          </div>

          <div className="sc-modal-aviso">
            <i className="bi bi-info-circle" />
            <span>Si no eliges mecánico, el taller asignará uno disponible.</span>
          </div>
        </div>

        <div className="si-form-actions">
          <button className="si-btn-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="si-btn-primary" onClick={handleConfirmar} disabled={saving}>
            {saving
              ? <><i className="bi bi-arrow-repeat spin me-1" />Agendando...</>
              : <><i className="bi bi-check-lg me-1" />Confirmar cita</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════ */
export default function SecCitas() {
  const { user }                    = useAuth();
  const [filtro, setFiltro]         = useState("todas");
  const [citas, setCitas]           = useState([]);
  const [vehiculos, setVehiculos]   = useState([]);
  const [mecanicos, setMecanicos]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [seleccion, setSeleccion]   = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    getCitas(user.id)
      .then(res => setCitas(Array.isArray(res) ? res : []))
      .catch(console.error)
      .finally(() => setLoading(false));

    getVehiculos(user.id)
      .then(res => setVehiculos(Array.isArray(res) ? res : []))
      .catch(console.error);

    getMecanicos()
      .then(res => setMecanicos(Array.isArray(res) ? res : []))
      .catch(console.error);
  }, [user]);

  const citasConEstado = citas.map(c =>
    esCitaPerdida(c) ? { ...c, estado: "perdida" } : c
  );

  const lista = filtro === "todas"
    ? citasConEstado
    : citasConEstado.filter(c => c.estado === filtro);

  const handleConfirmarCita = async (form) => {
    const [, mesNum, diaNum] = form.fecha.split("-").map(Number);
    await postCita(user.id, {
      servicio:      form.servicio,
      vehiculoId:    Number(form.idVehiculo),
      mecanicoId:    form.mecanicoId ? Number(form.mecanicoId) : 0,
      dia:           diaNum,
      mes:           mesNum,
      hora:          form.hora,
      observaciones: form.observaciones || "",
    });
    const res = await getCitas(user.id);
    setCitas(Array.isArray(res) ? res : []);
  };

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
            <button
              key={f}
              onClick={() => { setFiltro(f); setSeleccion(null); }}
              className={`sc-filtro${filtro === f ? " active" : ""}`}
            >
              {f === "todas" ? "Todas" : estadoLabels[f]}
            </button>
          ))}
          <span className="sc-count">{lista.length} cita{lista.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="sc-list">
          {lista.length === 0 && (
            <div className="sc-empty">No hay citas con este estado.</div>
          )}
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
                {c.observaciones && (
                  <div className="sc-item-obs">"{c.observaciones}"</div>
                )}
              </div>
              <Badge estado={c.estado} />
              <i className="bi bi-chevron-right sc-item-arrow" />
            </button>
          ))}
        </div>
      </div>

      <PanelDetalle cita={seleccion} onClose={() => setSeleccion(null)} />

      {modal && (
        <ModalAgendarCita
          vehiculos={vehiculos}
          mecanicos={mecanicos}
          onClose={() => setModal(false)}
          onConfirmar={handleConfirmarCita}
        />
      )}
    </div>
  );
}