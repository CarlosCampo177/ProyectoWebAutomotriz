/* ══════════════════════════════════════════
   AUTOTECH — MODAL AGENDAR CITA
   modals/ModalAgendarCita.jsx
══════════════════════════════════════════ */
import { useState } from "react";
import * as Icon from "../icons/Icons";
import "./ModalAgendarCita.css";

/* ── CONSTANTES ── */
const MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const MESES_LABELS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const HORAS_DISPONIBLES = [
  "8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
];

/* ── COMPONENTES INTERNOS ── */
function FieldGroup({ label, error, children, style }) {
  return (
    <div className="field-group" style={style}>
      <label>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

/* ── COMPONENTE PRINCIPAL ── */
export default function ModalAgendarCita({ vehiculos, mecanicos, citas, onClose, onSave }) {
  /* ── NOTA API ──────────────────────────────
     Props que vendrán de la API cuando se integre:

     vehiculos → GET /api/usuarios/:id/vehiculos
       [{ id, nombre, anio, placa }, ...]

     mecanicos → GET /api/mecanicos/disponibles
       [{ id, nombre }, ...]
       Actualmente se pasa hardcoded desde UsuarioApp.
       Reemplazar por un useEffect que llame a este endpoint.

     citas → ya cargadas en UsuarioApp desde
       GET /api/usuarios/:id/citas?estado=pendiente,confirmada
       Se usan para calcular horas ocupadas por mecánico.

     onSave → recibe el objeto de la nueva cita.
     UsuarioApp hace POST /api/citas con ese objeto
     y actualiza el estado local con la respuesta.
  ────────────────────────────────────────── */

  const today = new Date();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    servicio:      "",
    vehiculoId:    "",
    mecanicoId:    "",
    mecanicoNombre:"",
    dia:           String(today.getDate()).padStart(2, "0"),
    mes:           String(today.getMonth()),
    hora:          "",
    observaciones: "",
  });
  const [errors, setErrors] = useState({});

  const mesNum     = parseInt(form.mes);
  const diasEnMes  = new Date(today.getFullYear(), mesNum + 1, 0).getDate();

  /* Horas ya ocupadas para el mecánico y día seleccionados */
  const horasOcupadas = citas.filter(c =>
    c.mecanicoId === form.mecanicoId &&
    c.dia  === form.dia &&
    c.mes  === MESES[mesNum] &&
    (c.estado === "pendiente" || c.estado === "confirmada")
  ).map(c => c.hora);

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  }

  function selectMecanico(id, nombre) {
    setForm(f => ({ ...f, mecanicoId: id, mecanicoNombre: nombre, hora: "" }));
    setErrors(e => ({ ...e, mecanicoId: "" }));
  }

  function validate1() {
    const e = {};
    if (!form.servicio)   e.servicio   = "Selecciona un servicio";
    if (!form.vehiculoId) e.vehiculoId = "Selecciona un vehículo";
    if (!form.mecanicoId) e.mecanicoId = "Selecciona un mecánico";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validate2() {
    const e = {};
    if (!form.hora) e.hora = "Selecciona una hora disponible";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleGuardar() {
    if (!validate2()) return;

// ✅ Compara como string para evitar errores de tipo
  const veh = vehiculos.find(v => String(v.id) === String(form.vehiculoId));
    /* ── NOTA API ──────────────────────────────
       Aquí se construye el payload para:
         POST /api/citas
       Body:
         {
           usuarioId,        ← viene del contexto de auth
           vehiculoId:       form.vehiculoId,
           mecanicoId:       form.mecanicoId,
           servicio:         form.servicio,
           fecha:            `${anio}-${mes+1}-${dia}`,
           hora:             form.hora,
           observaciones:    form.observaciones,
         }
       Respuesta esperada: { id, ...datosCita, estado: "pendiente" }
       onSave recibe esa respuesta y UsuarioApp actualiza el estado.
    ────────────────────────────────────────── */
    onSave({
      servicio:       form.servicio,
      dia:            form.dia,
      mes:            MESES[mesNum],
      hora:           form.hora,
      vehiculoId:     form.vehiculoId,
      vehiculo:       `${veh?.nombre ?? ""} ${veh?.anio ?? ""}`.trim(),
      mecanicoId:     form.mecanicoId,
      mecanico:       form.mecanicoNombre,
      estado:         "pendiente",
      observaciones:  form.observaciones,
    });
  }

  return (
    <>
      {/* Barra de progreso */}
      <div className="mac-progress">
        {[1, 2].map(s => (
          <div key={s} className={`mac-step${s <= step ? " active" : ""}`}>
            <div className="mac-step-dot">{s <= step ? <Icon.Check /> : s}</div>
            <span>{s === 1 ? "Servicio" : "Fecha y hora"}</span>
          </div>
        ))}
        <div className={`mac-progress-line${step === 2 ? " active" : ""}`} />
      </div>

      {/* ─────────── PASO 1 ─────────── */}
      {step === 1 && (
        <div className="mac-fields">
          {/* ── NOTA API ──────────────────────────
              SERVICIOS_DISPONIBLES → GET /api/servicios
              Reemplazar el <select> por datos del endpoint.
              Estructura esperada: [{ id, nombre, duracionMin, precioBase }]
          ───────────────────────────────────────── */}
          <FieldGroup label="Servicio requerido *" error={errors.servicio}>
            <select
              className="mac-select"
              value={form.servicio}
              onChange={e => set("servicio", e.target.value)}
            >
              <option value="">Selecciona un servicio</option>
              {/* TODO API → servicios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>) */}
              <option>Cambio de aceite y filtros</option>
              <option>Revisión general de frenos</option>
              <option>Alineación y balanceo</option>
              <option>Revisión eléctrica</option>
              <option>Mantenimiento preventivo</option>
              <option>Cambio de llantas</option>
              <option>Diagnóstico computarizado</option>
              <option>Cambio de correa de distribución</option>
            </select>
          </FieldGroup>

          {/* ── NOTA API ──────────────────────────
              vehiculos → prop desde UsuarioApp.
              GET /api/usuarios/:id/vehiculos
          ───────────────────────────────────────── */}
          <FieldGroup label="Vehículo *" error={errors.vehiculoId}>
            <select
              className="mac-select"
              value={form.vehiculoId}
              onChange={e => set("vehiculoId", e.target.value)}
            >
              <option value="">Selecciona tu vehículo</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.nombre} {v.anio} — {v.placa}
                </option>
              ))}
            </select>
          </FieldGroup>

          {/* ── NOTA API ──────────────────────────
              mecanicos → prop desde UsuarioApp.
              GET /api/mecanicos/disponibles
              Estructura: [{ id, nombre }]
          ───────────────────────────────────────── */}
          <FieldGroup label="Mecánico *" error={errors.mecanicoId}>
            <select
              className="mac-select"
              value={form.mecanicoId}
              onChange={e => {
                const opt = e.target.options[e.target.selectedIndex];
                selectMecanico(e.target.value, opt.text);
              }}
            >
              <option value="">Selecciona un mecánico</option>
              {mecanicos.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="Observaciones adicionales">
            <textarea
              className="mac-textarea"
              value={form.observaciones}
              onChange={e => set("observaciones", e.target.value)}
              rows={3}
              placeholder="Describe el problema o lo que necesitas..."
            />
          </FieldGroup>

          <div className="mac-actions end">
            <button className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" onClick={() => validate1() && setStep(2)}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* ─────────── PASO 2 ─────────── */}
      {step === 2 && (
        <div className="mac-fields">
          <div className="mac-row">
            <FieldGroup label="Mes" style={{ flex: 1 }}>
              <select
                className="mac-select"
                value={form.mes}
                onChange={e => { set("mes", e.target.value); set("hora", ""); }}
              >
                {MESES_LABELS.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup label="Día" style={{ flex: 1 }}>
              <select
                className="mac-select"
                value={form.dia}
                onChange={e => { set("dia", e.target.value); set("hora", ""); }}
              >
                {Array.from({ length: diasEnMes }, (_, i) =>
                  String(i + 1).padStart(2, "0")
                ).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FieldGroup>
          </div>

          {/* ── NOTA API ──────────────────────────
              horasOcupadas se calcula localmente
              sobre las citas ya cargadas.
              Con API real: GET /api/mecanicos/:id/horario?fecha=YYYY-MM-DD
              devuelve las horas ya reservadas para esa fecha.
          ───────────────────────────────────────── */}
          <FieldGroup label="Hora disponible *" error={errors.hora}>
            <div className="mac-hora-grid">
              {HORAS_DISPONIBLES.map(h => {
                const ocupada    = horasOcupadas.includes(h);
                const seleccionada = form.hora === h;
                return (
                  <button
                    key={h}
                    disabled={ocupada}
                    onClick={() => !ocupada && set("hora", h)}
                    className={`mac-hora-btn${seleccionada ? " selected" : ""}${ocupada ? " ocupada" : ""}`}
                  >
                    {h}
                    {ocupada && <span className="mac-hora-ocupada">No disponible</span>}
                  </button>
                );
              })}
            </div>
          </FieldGroup>

          {form.mecanicoNombre && (
            <div className="mac-mecanico-info">
              <strong>Mecánico:</strong> {form.mecanicoNombre} —{" "}
              {horasOcupadas.length === 0
                ? "Disponible todo el día"
                : `${horasOcupadas.length} hora(s) reservada(s)`}
            </div>
          )}

          <div className="mac-actions between">
            <button className="btn-secondary" onClick={() => setStep(1)}>Atrás</button>
            <button className="btn-primary" onClick={handleGuardar}>Confirmar cita</button>
          </div>
        </div>
      )}
    </>
  );
}