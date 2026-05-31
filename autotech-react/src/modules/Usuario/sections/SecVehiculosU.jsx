import { useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext';
import { getVehiculos } from '../../../services/clienteService';
import apiClient from '../../../services/apiClient';
import "./SecVehiculosU.css";

const colorMap = {
  blue:   { bg: "#dbeafe", accent: "#1d4ed8", dot: "#3b82f6" },
  orange: { bg: "#ffedd5", accent: "#c2410c", dot: "#f97316" },
  green:  { bg: "#dcfce7", accent: "#15803d", dot: "#22c55e" },
  red:    { bg: "#fee2e2", accent: "#b91c1c", dot: "#ef4444" },
  purple: { bg: "#ede9fe", accent: "#7c3aed", dot: "#a78bfa" },
};

const colorWrapOpciones = [
  { label: "Azul",    value: "blue"   },
  { label: "Naranja", value: "orange" },
  { label: "Verde",   value: "green"  },
  { label: "Rojo",    value: "red"    },
  { label: "Morado",  value: "purple" },
];

const tipoVehiculoOpciones = [
  { label: "Auto",         value: "car"   },
  { label: "Camioneta/SUV",value: "truck" },
  { label: "Moto",         value: "moto"  },
  { label: "Van/Bus",      value: "van"   },
];

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

  return (
    <>
      <div className="svu-overlay" onClick={onClose} />
      <aside className="svu-panel">
        <div className="svu-panel-head" style={{ borderColor: c.dot }}>
          <div className="svu-panel-icon" style={{ background: c.bg, color: c.accent }}>
            <i className="bi bi-car-front" style={{ fontSize: "1.3rem" }} />
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

function ModalAgregar({ idCliente, onClose, onAgregado }) {
  const [marcas,   setMarcas]   = useState([]);
  const [modelos,  setModelos]  = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error,    setError]    = useState("");

  const [form, setForm] = useState({
    IdMarca:      "",
    NombreModelo: "",
    Placa:        "",
    Anio:         new Date().getFullYear(),
    Kilometraje:  0,
    Combustible:  "Gasolina",
    Color:        "",
    TipoVehiculo: "car",
    ColorWrap:    "blue",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Cargar marcas al abrir
  useEffect(() => {
    apiClient.get("Marcas")
      .then(res => setMarcas(Array.isArray(res) ? res : []))
      .catch(console.error);
  }, []);

  // Cargar modelos al cambiar marca
  useEffect(() => {
    if (!form.IdMarca) { setModelos([]); return; }
    apiClient.get(`Marcas/${form.IdMarca}/modelos`)
      .then(res => setModelos(Array.isArray(res) ? res : []))
      .catch(console.error);
  }, [form.IdMarca]);

  const handleSubmit = async () => {
    if (!form.IdMarca || !form.NombreModelo || !form.Placa || !form.Color) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      const nuevo = await apiClient.post("Vehiculo", {
        Placa:        form.Placa.toUpperCase().trim(),
        Anio:         Number(form.Anio),
        Color:        form.Color.trim(),
        Kilometraje:  Number(form.Kilometraje),
        Combustible:  form.Combustible,
        ColorWrap:    form.ColorWrap,
        NombreModelo: form.NombreModelo.trim(),
        TipoVehiculo: form.TipoVehiculo,
        IdMarca:      Number(form.IdMarca),
        IdCliente:    idCliente,
      });
      onAgregado(nuevo);
      onClose();
    } catch (err) {
      setError(err?.data?.message ?? err?.data ?? "Error al agregar el vehículo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="svu-overlay" onClick={onClose} />
      <aside className="svu-panel svu-panel--form">
        <div className="svu-panel-head">
          <div className="svu-panel-head-info">
            <div className="svu-panel-nombre">Agregar Vehículo</div>
            <div className="svu-panel-placa">Registra un nuevo vehículo en tu cuenta</div>
          </div>
          <button className="svu-panel-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="svu-panel-body">

          {/* Marca */}
          <div className="svu-field">
            <label>Marca <span className="svu-req">*</span></label>
            <select value={form.IdMarca} onChange={e => { set("IdMarca", e.target.value); set("NombreModelo", ""); }}>
              <option value="">Selecciona marca</option>
              {marcas.map(m => (
                <option key={m.idMarca} value={m.idMarca}>{m.nombreMarca}</option>
              ))}
            </select>
          </div>

          {/* Modelo */}
          <div className="svu-field">
            <label>Modelo <span className="svu-req">*</span></label>
            {modelos.length > 0 ? (
              <select value={form.NombreModelo} onChange={e => set("NombreModelo", e.target.value)}>
                <option value="">Selecciona modelo</option>
                {modelos.map(m => (
                  <option key={m.id} value={m.nombre}>{m.nombre}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Ej: Corolla"
                value={form.NombreModelo}
                onChange={e => set("NombreModelo", e.target.value)}
              />
            )}
          </div>

          {/* Placa y Año */}
          <div className="svu-field-row">
            <div className="svu-field">
              <label>Placa <span className="svu-req">*</span></label>
              <input
                type="text"
                placeholder="ABC-123"
                value={form.Placa}
                onChange={e => set("Placa", e.target.value)}
              />
            </div>
            <div className="svu-field">
              <label>Año <span className="svu-req">*</span></label>
              <input
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                value={form.Anio}
                onChange={e => set("Anio", e.target.value)}
              />
            </div>
          </div>

          {/* Kilometraje y Combustible */}
          <div className="svu-field-row">
            <div className="svu-field">
              <label>Kilometraje <span className="svu-req">*</span></label>
              <input
                type="number"
                min="0"
                placeholder="45000"
                value={form.Kilometraje}
                onChange={e => set("Kilometraje", e.target.value)}
              />
            </div>
            <div className="svu-field">
              <label>Combustible</label>
              <select value={form.Combustible} onChange={e => set("Combustible", e.target.value)}>
                <option>Gasolina</option>
                <option>Diésel</option>
                <option>Eléctrico</option>
                <option>Híbrido</option>
                <option>Gas</option>
              </select>
            </div>
          </div>

          {/* Color */}
          <div className="svu-field">
            <label>Color <span className="svu-req">*</span></label>
            <input
              type="text"
              placeholder="Ej: Blanco"
              value={form.Color}
              onChange={e => set("Color", e.target.value)}
            />
          </div>

          {/* Tipo de vehículo */}
          <div className="svu-field">
            <label>Tipo de vehículo</label>
            <div className="svu-btn-group">
              {tipoVehiculoOpciones.map(t => (
                <button
                  key={t.value}
                  className={`svu-tipo-btn${form.TipoVehiculo === t.value ? " active" : ""}`}
                  onClick={() => set("TipoVehiculo", t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color de tarjeta */}
          <div className="svu-field">
            <label>Color de tarjeta</label>
            <div className="svu-btn-group">
              {colorWrapOpciones.map(c => (
                <button
                  key={c.value}
                  className={`svu-tipo-btn${form.ColorWrap === c.value ? " active" : ""}`}
                  style={form.ColorWrap === c.value ? { background: colorMap[c.value].dot, color: "#fff", borderColor: colorMap[c.value].dot } : {}}
                  onClick={() => set("ColorWrap", c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="svu-error">{error}</div>}
        </div>

        <div className="svu-panel-actions">
          <button className="svu-panel-btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="svu-panel-btn-primary" onClick={handleSubmit} disabled={guardando}>
            {guardando ? "Guardando..." : "Agregar vehículo"}
          </button>
        </div>
      </aside>
    </>
  );
}

function CardVehiculo({ vehiculo, onSelect, isActive }) {
  const c = colorMap[vehiculo.colorWrap] || colorMap.blue;
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
            <i className="bi bi-car-front" style={{ fontSize: "1.2rem" }} />
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
    if (!user?.id) return;
    getVehiculos(user.id)
      .then(res => setVehiculos(Array.isArray(res) ? res : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleAgregado = (nuevo) => {
    // Mapear la respuesta del POST al formato que usa el componente
    setVehiculos(prev => [...prev, {
      id:             nuevo.id,
      nombre:         `${nuevo.marca} ${nuevo.modelo}`,
      placa:          nuevo.placa,
      anio:           nuevo.anio,
      km:             nuevo.kilometraje,
      color:          nuevo.color,
      combustible:    nuevo.combustible,
      colorWrap:      nuevo.colorWrap,
      ultimoServicio: "Sin registro",
      estado:         nuevo.estado,
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
          idCliente={user.idCliente ?? user.id}
          onClose={() => setModalAgregar(false)}
          onAgregado={handleAgregado}
        />
      )}
    </div>
  );
}