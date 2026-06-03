import { useState, useEffect } from "react";
import "./Vehiculos.css";
import {
  vehiculoService,
  marcaService,
  clienteAdminService,
} from "../../../services/adminService";

const COMBUSTIBLES = ["Gasolina", "Diésel", "Eléctrico", "Híbrido", "GLP"];

const COLORES_WRAP = [
  { value: "blue", label: "Azul", hex: "#2563eb" },
  { value: "red", label: "Rojo", hex: "#dc2626" },
  { value: "green", label: "Verde", hex: "#16a34a" },
  { value: "yellow", label: "Amarillo", hex: "#ca8a04" },
  { value: "gray", label: "Gris", hex: "#6b7280" },
  { value: "black", label: "Negro", hex: "#111827" },
  { value: "white", label: "Blanco", hex: "#d1d5db" },
  { value: "orange", label: "Naranja", hex: "#ea580c" },
];

const TIPOS_ICONO = {
  car: "bi-car-front",
  truck: "bi-truck",
  moto: "bi-bicycle",
  van: "bi-bus-front",
};

const EMPTY_FORM = {
  placa: "",
  anio: new Date().getFullYear(),
  color: "",
  kilometraje: 0,
  combustible: "Gasolina",
  colorWrap: "blue",
  idTipo: "",
  idMarca: "",
  idModelo: "",
  idCliente: "",
};

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadMarcas, setLoadMarcas] = useState(false);
  const [loadMod, setLoadMod] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    Promise.all([cargarVehiculos(), cargarTipos(), cargarClientes()]);
  }, []);

  const cargarVehiculos = async () => {
    try {
      setLoading(true);
      const data = await vehiculoService.getAll();
      setVehiculos(data || []);
    } catch {
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarTipos = async () => {
    try {
      const data = await marcaService.getTipos();
      setTipos(data || []);
    } catch {
      setTipos([]);
    }
  };

  const cargarClientes = async () => {
    try {
      const data = await clienteAdminService.getAll();
      setClientes(data || []);
    } catch {
      setClientes([]);
    }
  };

  const handleTipoChange = async (idTipo) => {
    setForm((f) => ({ ...f, idTipo, idMarca: "", idModelo: "" }));
    setFieldErrors((p) => ({ ...p, idTipo: "", idMarca: "", idModelo: "" }));
    setMarcas([]);
    setModelos([]);
    if (!idTipo) return;
    try {
      setLoadMarcas(true);
      const data = await marcaService.getMarcasPorTipo(idTipo);
      setMarcas(data || []);
    } catch {
      setMarcas([]);
    } finally {
      setLoadMarcas(false);
    }
  };

  const handleMarcaChange = async (idMarca) => {
    setForm((f) => ({ ...f, idMarca, idModelo: "" }));
    setFieldErrors((p) => ({ ...p, idMarca: "", idModelo: "" }));
    setModelos([]);
    if (!idMarca || !form.idTipo) return;
    try {
      setLoadMod(true);
      const data = await marcaService.getModelosPorMarcaYTipo(
        idMarca,
        form.idTipo,
      );
      setModelos(data || []);
    } catch {
      setModelos([]);
    } finally {
      setLoadMod(false);
    }
  };

  const abrirCrear = () => {
    setForm(EMPTY_FORM);
    setMarcas([]);
    setModelos([]);
    setEditingId(null);
    setError("");
    setShowModal(true);
  };

  const abrirEditar = async (v) => {
    setForm({
      placa: v.placa,
      anio: v.anio,
      color: v.color,
      kilometraje: v.kilometraje,
      combustible: v.combustible,
      colorWrap: v.colorWrap || "blue",
      idTipo: String(v.idTipo),
      idMarca: String(v.idMarca),
      idModelo: String(v.idModelo),
      idCliente: String(v.idCliente),
    });
    try {
      setLoadMarcas(true);
      const dataMarcas = await marcaService.getMarcasPorTipo(v.idTipo);
      setMarcas(dataMarcas || []);
      setLoadMarcas(false);

      setLoadMod(true);
      const dataModelos = await marcaService.getModelosPorMarcaYTipo(
        v.idMarca,
        v.idTipo,
      );
      setModelos(dataModelos || []);
    } catch {
      setMarcas([]);
      setModelos([]);
    } finally {
      setLoadMarcas(false);
      setLoadMod(false);
    }
    setEditingId(v.id);
    setError("");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setError("");
    setFieldErrors({});
  };

  const validar = () => {
    const errs = {};
    const placaRegex = /^[A-Z]{3}-\d{3}$/;
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    const anioActual = new Date().getFullYear();

    if (!form.idCliente) errs.idCliente = "Debes seleccionar un cliente.";

    if (!form.idTipo) errs.idTipo = "Debes seleccionar el tipo de vehículo.";

    if (!form.idMarca) errs.idMarca = "Debes seleccionar una marca.";

    if (!form.idModelo) errs.idModelo = "Debes seleccionar un modelo.";

    if (!form.placa.trim()) errs.placa = "La placa es requerida.";
    else if (!placaRegex.test(form.placa.trim()))
      errs.placa =
        "Formato inválido. Debe ser ABC-123 (3 letras, guion, 3 números).";

    const anio = Number(form.anio);
    if (!form.anio) errs.anio = "El año es requerido.";
    else if (anio < 1990 || anio > anioActual + 1)
      errs.anio = `El año debe estar entre 1990 y ${anioActual + 1}.`;

    if (!form.color.trim()) errs.color = "El color es requerido.";
    else if (!soloLetras.test(form.color.trim()))
      errs.color = "El color solo debe contener letras.";

    const km = Number(form.kilometraje);
    if (form.kilometraje === "" || form.kilometraje === null)
      errs.kilometraje = "El kilometraje es requerido.";
    else if (isNaN(km) || km < 0)
      errs.kilometraje = "El kilometraje no puede ser negativo.";
    else if (km > 900000)
      errs.kilometraje = "El kilometraje no puede superar 900.000 km.";

    return errs;
  };

  const guardar = async () => {
    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Corrige los errores antes de continuar.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setFieldErrors({});
      const payload = {
        placa: form.placa.trim().toUpperCase(),
        anio: Number(form.anio),
        color: form.color.trim(),
        kilometraje: Number(form.kilometraje),
        combustible: form.combustible,
        colorWrap: form.colorWrap,
        idModelo: Number(form.idModelo),
        idCliente: Number(form.idCliente),
      };
      if (editingId) {
        await vehiculoService.actualizar(editingId, payload);
      } else {
        await vehiculoService.crear(payload);
      }
      cerrarModal();
      if (detalle) setDetalle(null);
      cargarVehiculos();
    } catch (err) {
      setError(err.response?.data || err.data || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este vehículo?")) return;
    try {
      await vehiculoService.eliminar(id);
      if (detalle?.id === id) setDetalle(null);
      cargarVehiculos();
    } catch (err) {
      alert(err.response?.data || err.data || "No se pudo eliminar.");
    }
  };

  const f = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setFieldErrors((p) => ({ ...p, [key]: "" }));
  };
  const colorInfo = (val) =>
    COLORES_WRAP.find((c) => c.value === val) || COLORES_WRAP[0];
  const tipoIcon = (icono) => TIPOS_ICONO[icono] || "bi-car-front";

  const filtrados = vehiculos.filter(
    (v) =>
      (v.placa || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (v.cliente || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (v.marca || "").toLowerCase().includes(busqueda.toLowerCase()),
  );

  /* ════════════════════════════════════
      RENDER
   ════════════════════════════════════ */
  return (
    <div className={`veh-page ${detalle ? "veh-has-detalle" : ""}`}>
      {/* ── COLUMNA PRINCIPAL ── */}
      <div className={`veh-main ${detalle ? "con-panel" : ""}`}>
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-car-front" /> Vehículos
            </h1>
            <p className="page-subtitle">
              Gestiona todos los vehículos registrados en el sistema
            </p>
          </div>
          <button className="btn-primary" type="button" onClick={abrirCrear}>
            <i className="bi bi-plus-lg" /> Nuevo Vehículo
          </button>
        </div>

        <div className="veh-toolbar">
          <div className="search-bar">
            <i className="bi bi-search" />
            <input
              placeholder="Buscar por placa, cliente o marca..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                className="veh-search-clear"
                type="button"
                onClick={() => setBusqueda("")}
              >
                <i className="bi bi-x" />
              </button>
            )}
          </div>
          <span className="veh-count">
            {filtrados.length} vehículo{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            <i className="bi bi-arrow-repeat spin" /> Cargando vehículos...
          </div>
        ) : (
          <div className="table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Placa</th>
                  <th>Vehículo</th>
                  <th>Cliente</th>
                  <th>Año</th>
                  <th>Km</th>
                  <th>Combustible</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty-row">
                      <i className="bi bi-inbox me-2" />
                      {busqueda
                        ? "Sin resultados."
                        : "No hay vehículos registrados."}
                    </td>
                  </tr>
                ) : (
                  filtrados.map((v, i) => (
                    <tr
                      key={v.id}
                      className={detalle?.id === v.id ? "veh-row-active" : ""}
                      onClick={() =>
                        setDetalle(detalle?.id === v.id ? null : v)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <td className="veh-td-num">{i + 1}</td>
                      <td>
                        <span
                          className="badge-placa"
                          style={{
                            borderLeft: `3px solid ${colorInfo(v.colorWrap).hex}`,
                          }}
                        >
                          {v.placa}
                        </span>
                      </td>
                      <td>
                        <div className="mec-cell">
                          <i
                            className={`bi ${tipoIcon(v.tipoVehiculo)}`}
                            style={{
                              fontSize: "1.1rem",
                              color: "var(--accent)",
                            }}
                          />
                          <div>
                            <div className="veh-nombre">
                              {v.marca} {v.modelo}
                            </div>
                            <div className="veh-sub">{v.color}</div>
                          </div>
                        </div>
                      </td>
                      <td>{v.cliente}</td>
                      <td>{v.anio}</td>
                      <td className="veh-td-km">
                        {v.kilometraje?.toLocaleString()} km
                      </td>
                      <td>
                        <span className="veh-badge-comb">{v.combustible}</span>
                      </td>
                      <td>
                        <span
                          className={`badge-estado ${v.estado === "warn" ? "warn" : "ok"}`}
                        >
                          {v.estado === "warn" ? "⚠ Alto km" : "✓ OK"}
                        </span>
                      </td>
                      <td
                        className="actions-cell"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="btn-icon edit"
                          type="button"
                          onClick={() => abrirEditar(v)}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn-icon delete"
                          type="button"
                          onClick={() => eliminar(v.id)}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── PANEL LATERAL ── */}
      {detalle && (
        <aside className="veh-detalle">
          <div className="veh-detalle-header">
            <div>
              <h3 className="veh-detalle-title">
                {detalle.marca} {detalle.modelo}
              </h3>
              <span
                className="badge-placa"
                style={{
                  borderLeft: `3px solid ${colorInfo(detalle.colorWrap).hex}`,
                }}
              >
                {detalle.placa}
              </span>
            </div>
            <button
              className="modal-close"
              type="button"
              onClick={() => setDetalle(null)}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div
            className="veh-color-strip"
            style={{ background: colorInfo(detalle.colorWrap).hex }}
          />

          <div className="veh-detalle-body">
            <p className="veh-section-title">Información del vehículo</p>
            <div className="veh-info-grid">
              <div className="veh-info-item">
                <span className="veh-info-label">Tipo</span>
                <span className="veh-info-val">
                  <i className={`bi ${tipoIcon(detalle.tipoVehiculo)} me-1`} />
                  {detalle.tipoNombre}
                </span>
              </div>
              <div className="veh-info-item">
                <span className="veh-info-label">Año</span>
                <span className="veh-info-val">{detalle.anio}</span>
              </div>
              <div className="veh-info-item">
                <span className="veh-info-label">Color</span>
                <span className="veh-info-val">{detalle.color}</span>
              </div>
              <div className="veh-info-item">
                <span className="veh-info-label">Kilometraje</span>
                <span className="veh-info-val">
                  {detalle.kilometraje?.toLocaleString()} km
                </span>
              </div>
              <div className="veh-info-item">
                <span className="veh-info-label">Combustible</span>
                <span className="veh-info-val">{detalle.combustible}</span>
              </div>
            </div>

            <p className="veh-section-title" style={{ marginTop: "1.25rem" }}>
              Propietario
            </p>
            <div className="veh-cliente-card">
              <div className="veh-avatar">
                {(detalle.cliente || "C").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="veh-cliente-nombre">{detalle.cliente}</div>
              </div>
            </div>
          </div>

          <div className="veh-detalle-footer">
            <button
              className="btn-secondary veh-w-full"
              type="button"
              onClick={() => abrirEditar(detalle)}
            >
              <i className="bi bi-pencil me-1" /> Editar vehículo
            </button>
            <button
              className="btn-danger veh-w-full"
              type="button"
              onClick={() => eliminar(detalle.id)}
            >
              <i className="bi bi-trash me-1" /> Eliminar
            </button>
          </div>
        </aside>
      )}

      {/* ══ MODAL DRAWER LATERAL ══ */}
      {showModal && (
        <div className="veh-modal-overlay" onClick={cerrarModal}>
          <div
            className="veh-modal-lateral"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado */}
            <div className="veh-modal-header">
              <h2 className="veh-modal-title">
                <i
                  className={`bi ${editingId ? "bi-pencil" : "bi-plus-lg"} me-2`}
                />
                {editingId ? "Editar Vehículo" : "Nuevo Vehículo"}
              </h2>
              <button
                className="veh-modal-close"
                type="button"
                onClick={cerrarModal}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="veh-modal-body">
              {error && (
                <div
                  className="alert-error"
                  style={{ marginBottom: "1.25rem" }}
                >
                  <i className="bi bi-exclamation-triangle me-1" />
                  {error}
                </div>
              )}

              {/* Sección: Propietario */}
              <div className="veh-form-section">
                <div className="veh-form-section-label">
                  <i className="bi bi-person" /> Propietario
                </div>
                <div className="form-group">
                  <label>Cliente *</label>
                  <select
                    value={form.idCliente}
                    onChange={(e) => {
                      f("idCliente", e.target.value);
                    }}
                    className={fieldErrors.idCliente ? "input-error" : ""}
                  >
                    <option value="">— Selecciona un cliente —</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.nombre} — {c.email}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.idCliente && (
                    <span className="field-error-msg">
                      {fieldErrors.idCliente}
                    </span>
                  )}
                </div>
              </div>

              {/* Sección: Identificación */}
              <div className="veh-form-section">
                <div className="veh-form-section-label">
                  <i className="bi bi-tag" /> Identificación
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Tipo de vehículo *</label>
                    <select
                      value={form.idTipo}
                      onChange={(e) => handleTipoChange(e.target.value)}
                      className={fieldErrors.idTipo ? "input-error" : ""}
                    >
                      <option value="">— Selecciona tipo —</option>
                      {tipos.map((t) => (
                        <option key={t.idTipo} value={String(t.idTipo)}>
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.idTipo && (
                      <span className="field-error-msg">
                        {fieldErrors.idTipo}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Marca *</label>
                    <select
                      value={form.idMarca}
                      onChange={(e) => handleMarcaChange(e.target.value)}
                      disabled={!form.idTipo || loadMarcas}
                      className={fieldErrors.idMarca ? "input-error" : ""}
                    >
                      <option value="">
                        {loadMarcas
                          ? "Cargando..."
                          : !form.idTipo
                            ? "— Elige tipo primero —"
                            : "— Selecciona marca —"}
                      </option>
                      {marcas.map((m) => (
                        <option key={m.idMarca} value={String(m.idMarca)}>
                          {m.nombreMarca}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.idMarca && (
                      <span className="field-error-msg">
                        {fieldErrors.idMarca}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Modelo *</label>
                    <select
                      value={form.idModelo}
                      onChange={(e) => f("idModelo", e.target.value)}
                      disabled={!form.idMarca || loadMod}
                      className={fieldErrors.idModelo ? "input-error" : ""}
                    >
                      <option value="">
                        {loadMod
                          ? "Cargando..."
                          : !form.idMarca
                            ? "— Elige marca primero —"
                            : "— Selecciona modelo —"}
                      </option>
                      {modelos.map((m) => (
                        <option key={m.id} value={String(m.id)}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.idModelo && (
                      <span className="field-error-msg">
                        {fieldErrors.idModelo}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Placa *</label>
                    <input
                      type="text"
                      placeholder="Ej: ABC-123"
                      value={form.placa}
                      onChange={(e) => f("placa", e.target.value.toUpperCase())}
                      className={`veh-mono${fieldErrors.placa ? " input-error" : ""}`}
                    />
                    {fieldErrors.placa && (
                      <span className="field-error-msg">
                        {fieldErrors.placa}
                      </span>
                    )}
                  </div>

                  <div className="form-group form-span-2">
                    <label>Año *</label>
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      value={form.anio}
                      onChange={(e) => f("anio", e.target.value)}
                      className={fieldErrors.anio ? "input-error" : ""}
                    />
                    {fieldErrors.anio && (
                      <span className="field-error-msg">
                        {fieldErrors.anio}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección: Datos técnicos */}
              <div className="veh-form-section">
                <div className="veh-form-section-label">
                  <i className="bi bi-gear" /> Datos técnicos
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Color *</label>
                    <input
                      type="text"
                      placeholder="Ej: Blanco perla"
                      value={form.color}
                      onChange={(e) => f("color", e.target.value)}
                      className={fieldErrors.color ? "input-error" : ""}
                    />
                    {fieldErrors.color && (
                      <span className="field-error-msg">
                        {fieldErrors.color}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Kilometraje</label>
                    <input
                      type="number"
                      min="0"
                      max="900000"
                      value={form.kilometraje}
                      onChange={(e) => f("kilometraje", e.target.value)}
                      className={fieldErrors.kilometraje ? "input-error" : ""}
                    />
                    {fieldErrors.kilometraje && (
                      <span className="field-error-msg">
                        {fieldErrors.kilometraje}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Combustible</label>
                    <select
                      value={form.combustible}
                      onChange={(e) => f("combustible", e.target.value)}
                    >
                      {COMBUSTIBLES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Color de tarjeta</label>
                    <div className="veh-color-picker">
                      {COLORES_WRAP.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          className={`veh-color-dot ${form.colorWrap === c.value ? "active" : ""}`}
                          style={{ background: c.hex }}
                          title={c.label}
                          onClick={() => f("colorWrap", c.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer dentro del drawer */}
              <div className="veh-modal-footer">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={cerrarModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  type="button"
                  onClick={guardar}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="bi bi-arrow-repeat spin me-1" />{" "}
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i
                        className={`bi ${editingId ? "bi-check-lg" : "bi-plus-lg"} me-1`}
                      />
                      {editingId ? "Guardar cambios" : "Registrar vehículo"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
