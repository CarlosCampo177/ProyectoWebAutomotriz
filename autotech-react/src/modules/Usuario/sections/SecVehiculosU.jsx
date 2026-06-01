import { useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext';
import { getVehiculos } from '../../../services/clienteService';
import apiClient from '../../../services/apiClient';
import { marcaService } from '../../../services/adminService';
import "./SecVehiculosU.css";

const colorMap = {
  blue:   { bg: "#dbeafe", accent: "#1d4ed8", dot: "#3b82f6" },
  orange: { bg: "#ffedd5", accent: "#c2410c", dot: "#f97316" },
  green:  { bg: "#dcfce7", accent: "#15803d", dot: "#22c55e" },
  red:    { bg: "#fee2e2", accent: "#b91c1c", dot: "#ef4444" },
  purple: { bg: "#ede9fe", accent: "#7c3aed", dot: "#a78bfa" },
  yellow: { bg: "#fef9c3", accent: "#a16207", dot: "#ca8a04" },
  gray:   { bg: "#f3f4f6", accent: "#374151", dot: "#6b7280" },
  black:  { bg: "#f9fafb", accent: "#111827", dot: "#374151" },
  white:  { bg: "#f8fafc", accent: "#64748b", dot: "#cbd5e1" },
};

const colorWrapOpciones = [
  { label: "Azul",    value: "blue"   },
  { label: "Naranja", value: "orange" },
  { label: "Verde",   value: "green"  },
  { label: "Rojo",    value: "red"    },
  { label: "Morado",  value: "purple" },
];

const TIPO_ICONO_DEFAULT = 'bi-car-front';
const TIPOS_ICONO_MAP = {
  1: 'bi-car-front',
  2: 'bi-truck',
  3: 'bi-scooter',
  4: 'bi-bus-front',
  car: 'bi-car-front',
  truck: 'bi-truck',
  moto: 'bi-scooter',
  motorcycle: 'bi-scooter',
  van: 'bi-bus-front',
};

const getTipoIcono = (vehiculo = {}) => {
  const tipoKey = String(vehiculo.tipoVehiculo ?? "").trim().toLowerCase();
  return TIPOS_ICONO_MAP[vehiculo.idTipo] || TIPOS_ICONO_MAP[tipoKey] || TIPO_ICONO_DEFAULT;
};

const COMBUSTIBLES = ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido', 'Gas'];

const EMPTY_FORM = {
  idTipo:      '',
  idMarca:     '',
  idModelo:    '',
  placa:       '',
  anio:        new Date().getFullYear(),
  kilometraje: 0,
  combustible: 'Gasolina',
  color:       '',
  colorWrap:   'blue',
};

function BadgeEstado({ estado }) {
  return (
    <span className={`svu-badge ${estado === "ok" ? "ok" : "warn"}`}>
      <span className="svu-badge-dot" />
      {estado === "ok" ? "Al día" : "Revisión pendiente"}
    </span>
  );
}

function AlertaKm({ km }) {
  if (km < 80000) return null;
  return (
    <div className="svu-alerta">
      <i className="bi bi-exclamation-triangle" />
      Supera 80,000 km — revisión preventiva recomendada
    </div>
  );
}

function PanelDetalle({ vehiculo, onClose }) {
  if (!vehiculo) return null;
  const c = colorMap[vehiculo.colorWrap] || colorMap.blue;
  const icono = getTipoIcono(vehiculo);

  return (
    <>
      <div className="svu-overlay" onClick={onClose} />
      <aside className="svu-panel">
        <div className="svu-panel-head" style={{ borderColor: c.dot }}>
          <div className="svu-panel-icon" style={{ background: c.bg, color: c.accent }}>
            <i className={`bi ${icono}`} style={{ fontSize: "1.3rem" }} />
          </div>
          <div className="svu-panel-head-info">
            <div className="svu-panel-nombre">{vehiculo.nombre}</div>
            <div className="svu-panel-placa">{vehiculo.placa} · {vehiculo.anio}</div>
          </div>
          <button className="svu-panel-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="svu-panel-estado">
          <BadgeEstado estado={vehiculo.estado} />
          <AlertaKm km={vehiculo.km} />
        </div>

        <div className="svu-panel-section-label">Información del vehículo</div>
        <div className="svu-panel-stats">
          <div className="svu-panel-stat">
            <span className="svu-panel-stat-label">Kilometraje</span>
            <span className={`svu-panel-stat-val${vehiculo.km >= 80000 ? " warn" : ""}`}>
              {vehiculo.km?.toLocaleString("es-CO")} km
            </span>
          </div>
          <div className="svu-panel-stat">
            <span className="svu-panel-stat-label">Combustible</span>
            <span className="svu-panel-stat-val">{vehiculo.combustible}</span>
          </div>
          <div className="svu-panel-stat">
            <span className="svu-panel-stat-label">Color</span>
            <span className="svu-panel-stat-val">{vehiculo.color}</span>
          </div>
          <div className="svu-panel-stat">
            <span className="svu-panel-stat-label">Año</span>
            <span className="svu-panel-stat-val">{vehiculo.anio}</span>
          </div>
        </div>

        <div className="svu-panel-section-label">Último servicio</div>
        <div className="svu-panel-servicio">
          {vehiculo.ultimoServicio && vehiculo.ultimoServicio !== "Sin registro"
            ? <div className="svu-panel-servicio-nombre">{vehiculo.ultimoServicio}</div>
            : <div className="svu-panel-servicio-vacio">Sin registro de servicios</div>
          }
        </div>

        <div className="svu-panel-actions">
          <button className="svu-panel-btn-primary">
            <i className="bi bi-calendar-plus" /> Agendar servicio
          </button>
          <button className="svu-panel-btn-secondary">
            <i className="bi bi-clock-history" /> Ver historial
          </button>
        </div>
      </aside>
    </>
  );
}

function ModalAgregar({ idUsuario, onClose, onAgregado }) {
  const [tipos,      setTipos]      = useState([]);
  const [marcas,     setMarcas]     = useState([]);
  const [modelos,    setModelos]    = useState([]);
  const [loadTipos,  setLoadTipos]  = useState(false);
  const [loadMarcas, setLoadMarcas] = useState(false);
  const [loadMod,    setLoadMod]    = useState(false);
  const [guardando,  setGuardando]  = useState(false);
  const [error,      setError]      = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    setLoadTipos(true);
    marcaService.getTipos()
      .then(data => setTipos(Array.isArray(data) ? data : []))
      .catch(() => setTipos([]))
      .finally(() => setLoadTipos(false));
  }, []);

  const handleTipoChange = async (idTipo) => {
    setForm(f => ({ ...f, idTipo, idMarca: '', idModelo: '' }));
    setMarcas([]);
    setModelos([]);
    if (!idTipo) return;
    try {
      setLoadMarcas(true);
      const data = await marcaService.getMarcasPorTipo(idTipo);
      setMarcas(Array.isArray(data) ? data : []);
    } catch {
      setMarcas([]);
    } finally {
      setLoadMarcas(false);
    }
  };

  const handleMarcaChange = async (idMarca) => {
    setForm(f => ({ ...f, idMarca, idModelo: '' }));
    setModelos([]);
    if (!idMarca) return;
    try {
      setLoadMod(true);
      const data = await marcaService.getModelosPorMarcaYTipo(idMarca, form.idTipo);
      setModelos(Array.isArray(data) ? data : []);
    } catch {
      setModelos([]);
    } finally {
      setLoadMod(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.idModelo || !form.placa.trim() || !form.color.trim()) {
      setError("Completa todos los campos obligatorios (*).");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      const nuevo = await apiClient.post(`Cliente/${idUsuario}/vehiculos`, {
        Placa:       form.placa.toUpperCase().trim(),
        Anio:        Number(form.anio),
        Color:       form.color.trim(),
        Kilometraje: Number(form.kilometraje),
        Combustible: form.combustible,
        ColorWrap:   form.colorWrap,
        IdModelo:    Number(form.idModelo),
      });
      onAgregado(nuevo);
      onClose();
    } catch (err) {
      const data = err?.data;
      const mensaje =
        typeof data === "string"
          ? data
          : data?.message
          ?? data?.title
          ?? "Error al agregar el vehículo.";
      setError(typeof mensaje === "string" ? mensaje : "Error al agregar el vehículo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="svu-modal-overlay" onClick={onClose}>
      <div className="svu-modal-card" onClick={e => e.stopPropagation()}>

        <div className="svu-modal-header">
          <div className="svu-modal-header-icon">
            <i className="bi bi-car-front-fill" />
          </div>
          <div>
            <h2 className="svu-modal-title">Agregar Vehículo</h2>
            <p className="svu-modal-subtitle">Registra un nuevo vehículo en tu cuenta</p>
          </div>
          <button className="svu-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="svu-modal-body">

          <div className="svu-modal-section-label">
            <i className="bi bi-tag-fill" /> Identificación
          </div>
          <div className="svu-modal-grid-3">

            <div className="svu-field">
              <label>Tipo <span className="svu-req">*</span></label>
              <select value={form.idTipo} onChange={e => handleTipoChange(e.target.value)} disabled={loadTipos}>
                <option value="">{loadTipos ? 'Cargando...' : '— Tipo —'}</option>
                {tipos.map(t => (
                  <option key={t.idTipo} value={String(t.idTipo)}>
                    {t.nombreTipo ?? t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="svu-field">
              <label>Marca <span className="svu-req">*</span></label>
              <select
                value={form.idMarca}
                onChange={e => handleMarcaChange(e.target.value)}
                disabled={!form.idTipo || loadMarcas}
              >
                <option value="">
                  {loadMarcas ? 'Cargando...' : !form.idTipo ? '— Elige tipo —' : '— Marca —'}
                </option>
                {marcas.map(m => (
                  <option key={m.idMarca} value={String(m.idMarca)}>{m.nombreMarca}</option>
                ))}
              </select>
            </div>

            <div className="svu-field">
              <label>Modelo <span className="svu-req">*</span></label>
              <select
                value={form.idModelo}
                onChange={e => set('idModelo', e.target.value)}
                disabled={!form.idMarca || loadMod}
              >
                <option value="">
                  {loadMod ? 'Cargando...' : !form.idMarca ? '— Elige marca —' : '— Modelo —'}
                </option>
                {modelos.map(m => (
                  <option key={m.id} value={String(m.id)}>{m.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="svu-field-row">
            <div className="svu-field">
              <label>Placa <span className="svu-req">*</span></label>
              <input
                type="text"
                placeholder="Ej: ABC-123"
                value={form.placa}
                onChange={e => set('placa', e.target.value.toUpperCase())}
                className="svu-input-mono"
              />
            </div>
            <div className="svu-field">
              <label>Año <span className="svu-req">*</span></label>
              <input
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                value={form.anio}
                onChange={e => set('anio', e.target.value)}
              />
            </div>
          </div>

          <div className="svu-modal-section-label">
            <i className="bi bi-gear-fill" /> Datos técnicos
          </div>
          <div className="svu-field-row">
            <div className="svu-field">
              <label>Color <span className="svu-req">*</span></label>
              <input
                type="text"
                placeholder="Ej: Blanco perla"
                value={form.color}
                onChange={e => set('color', e.target.value)}
              />
            </div>
            <div className="svu-field">
              <label>Kilometraje</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.kilometraje}
                onChange={e => set('kilometraje', e.target.value)}
              />
            </div>
          </div>

          <div className="svu-field">
            <label>Combustible</label>
            <div className="svu-chip-group">
              {COMBUSTIBLES.map(c => (
                <button
                  key={c}
                  className={`svu-chip${form.combustible === c ? ' active' : ''}`}
                  onClick={() => set('combustible', c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="svu-field">
            <label>Color de tarjeta</label>
            <div className="svu-color-dots">
              {colorWrapOpciones.map(op => (
                <button
                  key={op.value}
                  className={`svu-color-dot${form.colorWrap === op.value ? ' active' : ''}`}
                  style={{ '--dot-color': colorMap[op.value].dot }}
                  title={op.label}
                  onClick={() => set('colorWrap', op.value)}
                />
              ))}
            </div>
          </div>

          {/* ✅ Render seguro: solo muestra el error si es un string */}
          {error && typeof error === "string" && (
            <div className="svu-error">
              <i className="bi bi-exclamation-triangle-fill me-2" />{error}
            </div>
          )}
        </div>

        <div className="svu-modal-footer">
          <button className="svu-modal-btn-cancel" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button className="svu-modal-btn-confirm" onClick={handleSubmit} disabled={guardando}>
            {guardando
              ? <><i className="bi bi-arrow-repeat svu-spin me-2" />Guardando...</>
              : <><i className="bi bi-plus-lg me-2" />Agregar vehículo</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

function CardVehiculo({ vehiculo, onSelect, isActive }) {
  const c = colorMap[vehiculo.colorWrap] || colorMap.blue;
  const icono = getTipoIcono(vehiculo);
  return (
    <div
      className={`svu-card${isActive ? " active" : ""}`}
      onClick={() => onSelect(vehiculo)}
      style={{ "--accent": c.dot, "--accent-bg": c.bg, "--accent-text": c.accent }}
    >
      <div className="svu-card-stripe" />
      <div className="svu-card-inner">
        <div className="svu-card-top">
          <div className="svu-card-icon">
            <i className={`bi ${icono}`} style={{ fontSize: "1.2rem" }} />
          </div>
          <BadgeEstado estado={vehiculo.estado} />
        </div>
        <div className="svu-card-nombre">{vehiculo.nombre}</div>
        <div className="svu-card-sub">{vehiculo.placa} · {vehiculo.anio}</div>
        <div className="svu-card-metrics">
          <div className="svu-card-metric">
            <span className="svu-metric-label">KM</span>
            <span className={`svu-metric-val${vehiculo.km >= 80000 ? " warn" : ""}`}>
              {vehiculo.km?.toLocaleString("es-CO")}
            </span>
          </div>
          <div className="svu-card-metric-sep" />
          <div className="svu-card-metric">
            <span className="svu-metric-label">Combustible</span>
            <span className="svu-metric-val">{vehiculo.combustible}</span>
          </div>
          <div className="svu-card-metric-sep" />
          <div className="svu-card-metric">
            <span className="svu-metric-label">Color</span>
            <span className="svu-metric-val">{vehiculo.color}</span>
          </div>
        </div>
        <AlertaKm km={vehiculo.km} />
        <div className="svu-card-footer">
          <span className="svu-footer-label">Último servicio</span>
          <span className="svu-footer-val">{vehiculo.ultimoServicio ?? "Sin registro"}</span>
        </div>
      </div>
      <div className="svu-card-arrow">
        <i className="bi bi-chevron-right" />
      </div>
    </div>
  );
}

export default function SecVehiculos() {
  const { user }                        = useAuth();
  const [vehiculos, setVehiculos]       = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [modalAgregar, setModalAgregar] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false); // ✅ evita loading infinito si no hay usuario
      return;
    }
    getVehiculos(user.id)
      .then(res => setVehiculos(Array.isArray(res) ? res : []))
      .catch(err => {
        console.error(err);
        setVehiculos([]); // ✅ muestra vacío en lugar de pantalla blanca
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleAgregado = (nuevo) => {
    // ✅ Compatibilidad con apiClient que puede devolver { data: {...} } o el objeto directo
    const v = nuevo?.data ?? nuevo;
    setVehiculos(prev => [...prev, {
      id:             v.id,
      nombre:         v.nombre ?? `${v.marca ?? ""} ${v.modelo ?? ""}`.trim(),
      placa:          v.placa,
      anio:           v.anio,
      km:             v.km ?? v.kilometraje,
      color:          v.color,
      combustible:    v.combustible,
      colorWrap:      v.colorWrap,
      idTipo:         v.idTipo,
      tipoVehiculo:   v.tipoVehiculo,
      ultimoServicio: v.ultimoServicio ?? "Sin registro",
      estado:         v.estado ?? "ok",
    }]);
  };

  if (loading) return <p style={{ color: "#888" }}>Cargando vehículos...</p>;

  return (
    <div className="svu-root">
      <div className="svu-header">
        <div>
          <div className="svu-title">
            <span className="svu-title-icon">
              <i className="bi bi-car-front" style={{ fontSize: "1.1rem" }} />
            </span>
            Mis Vehículos
          </div>
          <div className="svu-subtitle">
            {vehiculos.length > 0
              ? `${vehiculos.length} vehículo${vehiculos.length > 1 ? "s" : ""} registrado${vehiculos.length > 1 ? "s" : ""}`
              : "Sin vehículos en tu cuenta"}
          </div>
        </div>
        <button className="svu-btn-add" onClick={() => setModalAgregar(true)}>
          <i className="bi bi-plus-lg" /> Agregar vehículo
        </button>
      </div>

      {vehiculos.length === 0 && (
        <div className="svu-empty">
          <div className="svu-empty-icon">
            <i className="bi bi-car-front" style={{ fontSize: "1.5rem" }} />
          </div>
          <div className="svu-empty-text">No tienes vehículos registrados.</div>
          <div className="svu-empty-sub">Agrega uno para comenzar a gestionar tus servicios.</div>
        </div>
      )}

      <div className="svu-grid">
        {vehiculos.map((v, i) => (
          <CardVehiculo
            key={v.id ?? i}
            vehiculo={v}
            onSelect={v => setSeleccionado(prev => prev?.id === v.id ? null : v)}
            isActive={seleccionado?.id === v.id}
          />
        ))}
      </div>

      <PanelDetalle vehiculo={seleccionado} onClose={() => setSeleccionado(null)} />

      {modalAgregar && (
        <ModalAgregar
          idUsuario={user.id}
          onClose={() => setModalAgregar(false)}
          onAgregado={handleAgregado}
        />
      )}
    </div>
  );
}
