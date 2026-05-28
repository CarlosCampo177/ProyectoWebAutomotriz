import { useState, useEffect } from "react";
import "./Mecanicos.css";
import {
  mecanicoAdminService,
  especialidadService,
} from "../../../services/adminService";

const TABS_DETALLE = ["perfil", "ordenes", "estadisticas"];

const EMPTY_FORM = {
  primerNombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  documento: "",
  username: "",
  email: "",
  telefono: "",
  direccion: "",
  salarioBase: 0,
  idEspecialidad: "",
  password: "",
};

const PRIORIDAD_COLOR = {
  urgente: "mec-pri-urgente",
  alta: "mec-pri-alta",
  normal: "mec-pri-normal",
};

const ESTADO_COLOR = {
  pendiente: "mec-est-pendiente",
  en_proceso: "mec-est-proceso",
  completada: "mec-est-completada",
  cancelada: "mec-est-cancelada",
};

export default function Mecanicos() {
  const [mecanicos, setMecanicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEsp, setShowEsp] = useState(false);
  const [nuevaEsp, setNuevaEsp] = useState({ nombre: "", descripcion: "" });
  const [detalle, setDetalle] = useState(null);
  const [tabDetalle, setTabDetalle] = useState("perfil");
  const [ordenesDetalle, setOrdenesDetalle] = useState([]);
  const [statsDetalle, setStatsDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    cargar();
    cargarEspecialidades();
  }, []);

  /* ── Carga ── */
  const cargar = async () => {
    try {
      setLoading(true);
      const data = await mecanicoAdminService.getAll();
      setMecanicos(data || []);
    } catch {
      setMecanicos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarEspecialidades = async () => {
    try {
      const data = await especialidadService.getAll();
      setEspecialidades(data || []);
    } catch {
      setEspecialidades([]);
    }
  };

  /* ── Panel lateral ── */
  const abrirDetalle = async (m) => {
    if (detalle?.id === m.id) {
      setDetalle(null);
      return;
    }
    setDetalle(m);
    setTabDetalle("perfil");
    setOrdenesDetalle([]);
    setStatsDetalle(null);
  };

  const cargarTab = async (tab) => {
    setTabDetalle(tab);
    if (!detalle) return;
    if (tab === "ordenes" && ordenesDetalle.length === 0) {
      try {
        setLoadingDetalle(true);
        const data = await mecanicoAdminService.getOrdenes(detalle.id);
        setOrdenesDetalle(data || []);
      } catch {
        setOrdenesDetalle([]);
      } finally {
        setLoadingDetalle(false);
      }
    }
    if (tab === "estadisticas" && !statsDetalle) {
      try {
        setLoadingDetalle(true);
        const data = await mecanicoAdminService.getEstadisticas(detalle.id);
        setStatsDetalle(data);
      } catch {
        setStatsDetalle(null);
      } finally {
        setLoadingDetalle(false);
      }
    }
  };

  /* ── Modal ── */
  const abrirCrear = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowModal(true);
  };

  const abrirEditar = (m) => {
    setForm({
      primerNombre: m.primerNombre || "",
      segundoNombre: m.segundoNombre || "",
      primerApellido: m.primerApellido || "",
      segundoApellido: m.segundoApellido || "",
      documento: m.documento || "",
      username: m.username || "",
      email: m.email || "",
      telefono: m.telefono || "",
      direccion: m.direccion || "",
      salarioBase: m.salarioBase || 0,
      idEspecialidad: String(m.idEspecialidad || ""),
      password: "",
    });
    setEditingId(m.id);
    setError("");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setError("");
  };

  const guardar = async () => {
    if (
      !form.primerNombre.trim() ||
      !form.primerApellido.trim() ||
      !form.email.trim() ||
      !form.documento.trim() ||
      !form.username.trim() ||
      !form.idEspecialidad
    ) {
      setError(
        "Nombre, apellido, documento, username, email y especialidad son requeridos.",
      );
      return;
    }
    if (!editingId && !form.password.trim()) {
      setError("La contraseña es requerida al crear un mecánico.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const payload = { ...form, idEspecialidad: Number(form.idEspecialidad) };
      if (editingId) {
        await mecanicoAdminService.actualizar(editingId, payload);
      } else {
        await mecanicoAdminService.crear(payload);
      }
      cerrarModal();
      setDetalle(null);
      cargar();
    } catch (err) {
      setError(err.data || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (m, e) => {
    e?.stopPropagation();
    try {
      await mecanicoAdminService.cambiarEstado(m.id);
      cargar();
      if (detalle?.id === m.id)
        setDetalle((prev) => ({
          ...prev,
          estado: prev.estado === "activo" ? "inactivo" : "activo",
        }));
    } catch {
      alert("No se pudo cambiar el estado.");
    }
  };

  /* ── Especialidad rápida ── */
  const guardarEspRapida = async () => {
    if (!nuevaEsp.nombre.trim()) return;
    try {
      await especialidadService.crear({
        nombre: nuevaEsp.nombre.trim(),
        descripcion: nuevaEsp.descripcion.trim(),
      });
      await cargarEspecialidades();
      setNuevaEsp({ nombre: "", descripcion: "" });
      setShowEsp(false);
    } catch (err) {
      alert(err.data || "Error al crear especialidad.");
    }
  };

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const iniciales = (nombre) =>
    (nombre || "M")
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const filtrados = mecanicos.filter((m) => {
    const q = busqueda.toLowerCase();
    const matchQ =
      (m.nombre || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.documento || "").toLowerCase().includes(q) ||
      (m.especialidad || "").toLowerCase().includes(q);
    const matchE = filtroEstado === "todos" || m.estado === filtroEstado;
    return matchQ && matchE;
  });

  /* ════════════════════════════════════
     RENDER
  ════════════════════════════════════ */
  return (
    <div className={`mec-page ${detalle ? "mec-has-detalle" : ""}`}>
      {/* ── COLUMNA PRINCIPAL ── */}
      <div className={`mec-main ${detalle ? "con-panel" : ""}`}>
        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-person-badge" /> Mecánicos
            </h1>
            <p className="page-subtitle">
              Gestiona el equipo de mecánicos del taller
            </p>
          </div>
          <button className="btn-primary" onClick={abrirCrear}>
            <i className="bi bi-person-plus" /> Nuevo Mecánico
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="mec-toolbar">
          <div className="search-bar">
            <i className="bi bi-search" />
            <input
              placeholder="Buscar por nombre, email, documento o especialidad..."
              value={busqueda}
              autoComplete="one-time-code"
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="mec-clear" onClick={() => setBusqueda("")}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>
          <div className="mec-filtros">
            {["todos", "activo", "inactivo"].map((fe) => (
              <button
                key={fe}
                className={`mec-filtro-btn ${filtroEstado === fe ? "active" : ""}`}
                onClick={() => setFiltroEstado(fe)}
              >
                {fe.charAt(0).toUpperCase() + fe.slice(1)}
              </button>
            ))}
          </div>
          <span className="mec-count">
            {filtrados.length} mecánico{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* TABLA */}
        {loading ? (
          <div className="loading-state">
            <i className="bi bi-arrow-repeat spin" /> Cargando mecánicos...
          </div>
        ) : (
          <div className="table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mecánico</th>
                  <th>Especialidad</th>
                  <th>Contacto</th>
                  <th>Activas</th>
                  <th>Completadas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      <i className="bi bi-inbox me-2" />
                      {busqueda
                        ? "Sin resultados."
                        : "No hay mecánicos registrados."}
                    </td>
                  </tr>
                ) : (
                  filtrados.map((m, i) => (
                    <tr
                      key={m.id}
                      className={detalle?.id === m.id ? "mec-row-active" : ""}
                      onClick={() => abrirDetalle(m)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="mec-td-num">{i + 1}</td>
                      <td>
                        <div className="mec-cell">
                          <div
                            className="mec-avatar"
                            style={{
                              opacity: m.estado === "inactivo" ? 0.4 : 1,
                            }}
                          >
                            {iniciales(m.nombre)}
                          </div>
                          <div>
                            <div className="mec-nombre">{m.nombre}</div>
                            <div className="mec-username">@{m.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="mec-badge-esp">
                          <i className="bi bi-wrench me-1" />
                          {m.especialidad}
                        </span>
                      </td>
                      <td>
                        <div className="mec-nombre">{m.email}</div>
                        <div className="mec-username">{m.telefono}</div>
                      </td>
                      <td>
                        <span
                          className={`mec-carga ${
                            m.ordenesActivas > 3
                              ? "alta"
                              : m.ordenesActivas > 1
                                ? "media"
                                : "baja"
                          }`}
                        >
                          {m.ordenesActivas} activa
                          {m.ordenesActivas !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="mec-completadas">
                        {m.ordenesCompletadas}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className={`mec-estado-btn ${m.estado}`}
                          onClick={(e) => cambiarEstado(m, e)}
                          title={
                            m.estado === "activo" ? "Desactivar" : "Activar"
                          }
                        >
                          <i
                            className={`bi ${
                              m.estado === "activo"
                                ? "bi-toggle-on"
                                : "bi-toggle-off"
                            }`}
                          />
                          {m.estado === "activo" ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td
                        className="actions-cell"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="btn-icon edit"
                          onClick={() => abrirEditar(m)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil" />
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
        <aside className="mec-detalle">
          {/* Cabecera */}
          <div className="mec-detalle-top">
            <div className="mec-detalle-avatar">
              {iniciales(detalle.nombre)}
            </div>
            <button className="modal-close" onClick={() => setDetalle(null)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="mec-detalle-info">
            <h3 className="mec-detalle-nombre">{detalle.nombre}</h3>
            <span className="mec-badge-esp" style={{ fontSize: ".78rem" }}>
              <i className="bi bi-wrench me-1" />
              {detalle.especialidad}
            </span>
            <div style={{ marginTop: ".5rem" }}>
              <span
                className={`mec-estado-btn ${detalle.estado}`}
                style={{ fontSize: ".75rem", padding: ".2rem .6rem" }}
              >
                <i
                  className={`bi ${
                    detalle.estado === "activo"
                      ? "bi-toggle-on"
                      : "bi-toggle-off"
                  } me-1`}
                />
                {detalle.estado}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mec-tabs">
            {TABS_DETALLE.map((tab) => (
              <button
                key={tab}
                className={`mec-tab ${tabDetalle === tab ? "active" : ""}`}
                onClick={() => cargarTab(tab)}
              >
                {tab === "perfil" && (
                  <>
                    <i className="bi bi-person me-1" />
                    Perfil
                  </>
                )}
                {tab === "ordenes" && (
                  <>
                    <i className="bi bi-clipboard-check me-1" />
                    Órdenes
                  </>
                )}
                {tab === "estadisticas" && (
                  <>
                    <i className="bi bi-bar-chart me-1" />
                    Stats
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Contenido tab */}
          <div className="mec-tab-content">
            {/* ── TAB PERFIL ── */}
            {tabDetalle === "perfil" && (
              <div className="mec-perfil">
                <div className="mec-stats-row">
                  <div className="mec-stat">
                    <span className="mec-stat-num">
                      {detalle.ordenesActivas}
                    </span>
                    <span className="mec-stat-label">Activas</span>
                  </div>
                  <div className="mec-stat">
                    <span className="mec-stat-num">
                      {detalle.ordenesCompletadas}
                    </span>
                    <span className="mec-stat-label">Completadas</span>
                  </div>
                  <div className="mec-stat">
                    <span className="mec-stat-num">{detalle.totalOrdenes}</span>
                    <span className="mec-stat-label">Total</span>
                  </div>
                </div>

                <p className="mec-section-title" style={{ marginTop: "1rem" }}>
                  Información
                </p>
                <div className="mec-info-list">
                  <div className="mec-info-row">
                    <i className="bi bi-person-badge" />
                    <span>{detalle.documento}</span>
                  </div>
                  <div className="mec-info-row">
                    <i className="bi bi-at" />
                    <span>@{detalle.username}</span>
                  </div>
                  <div className="mec-info-row">
                    <i className="bi bi-envelope" />
                    <span>{detalle.email}</span>
                  </div>
                  <div className="mec-info-row">
                    <i className="bi bi-telephone" />
                    <span>{detalle.telefono || "Sin teléfono"}</span>
                  </div>
                  <div className="mec-info-row">
                    <i className="bi bi-geo-alt" />
                    <span>{detalle.direccion || "Sin dirección"}</span>
                  </div>
                  <div className="mec-info-row">
                    <i className="bi bi-currency-dollar" />
                    <span>
                      Salario: ${detalle.salarioBase?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB ÓRDENES ── */}
            {tabDetalle === "ordenes" && (
              <div className="mec-ordenes-list">
                {loadingDetalle ? (
                  <div className="loading-state" style={{ padding: "2rem" }}>
                    <i className="bi bi-arrow-repeat spin" />
                  </div>
                ) : ordenesDetalle.length === 0 ? (
                  <p
                    className="empty-row"
                    style={{ padding: "1.5rem", textAlign: "center" }}
                  >
                    Sin órdenes asignadas.
                  </p>
                ) : (
                  ordenesDetalle.map((o) => (
                    <div key={o.id} className="mec-orden-card">
                      <div className="mec-orden-top">
                        <span
                          className={`mec-badge-estado ${ESTADO_COLOR[o.estado]}`}
                        >
                          {o.estado.replace("_", " ")}
                        </span>
                        <span
                          className={`mec-badge-pri ${PRIORIDAD_COLOR[o.prioridad]}`}
                        >
                          {o.prioridad}
                        </span>
                      </div>
                      <div className="mec-orden-servicio">{o.servicio}</div>
                      <div className="mec-orden-sub">
                        <i className="bi bi-car-front me-1" />
                        {o.vehiculo}
                      </div>
                      <div className="mec-orden-sub">
                        <i className="bi bi-person me-1" />
                        {o.cliente}
                      </div>
                      <div className="mec-orden-fecha">
                        <i className="bi bi-calendar me-1" />
                        {o.fecha}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── TAB ESTADÍSTICAS ── */}
            {tabDetalle === "estadisticas" && (
              <div className="mec-stats-panel">
                {loadingDetalle ? (
                  <div className="loading-state" style={{ padding: "2rem" }}>
                    <i className="bi bi-arrow-repeat spin" />
                  </div>
                ) : !statsDetalle ? (
                  <p className="empty-row">Sin datos.</p>
                ) : (
                  <>
                    <div className="mec-stats-grid">
                      <div className="mec-stat-card">
                        <span className="msc-num">
                          {statsDetalle.totalOrdenes}
                        </span>
                        <span className="msc-label">Total órdenes</span>
                      </div>
                      <div className="mec-stat-card activas">
                        <span className="msc-num">
                          {statsDetalle.ordenesActivas}
                        </span>
                        <span className="msc-label">Activas</span>
                      </div>
                      <div className="mec-stat-card completadas">
                        <span className="msc-num">
                          {statsDetalle.ordenesCompletadas}
                        </span>
                        <span className="msc-label">Completadas</span>
                      </div>
                      <div className="mec-stat-card canceladas">
                        <span className="msc-num">
                          {statsDetalle.ordenesCanceladas}
                        </span>
                        <span className="msc-label">Canceladas</span>
                      </div>
                    </div>

                    {statsDetalle.serviciosFrecuentes?.length > 0 && (
                      <>
                        <p
                          className="mec-section-title"
                          style={{ marginTop: "1rem" }}
                        >
                          Servicios más realizados
                        </p>
                        {statsDetalle.serviciosFrecuentes.map((s, i) => (
                          <div key={i} className="mec-servicio-row">
                            <span className="mec-servicio-nombre">
                              {s.servicio}
                            </span>
                            <span className="mec-servicio-count">
                              {s.cantidad}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mec-detalle-footer">
            <button
              className="btn-secondary mec-w-full"
              onClick={() => abrirEditar(detalle)}
            >
              <i className="bi bi-pencil me-1" /> Editar
            </button>
            <button
              className={`mec-w-full mec-toggle-btn ${detalle.estado}`}
              onClick={(e) => cambiarEstado(detalle, e)}
            >
              <i
                className={`bi ${
                  detalle.estado === "activo" ? "bi-toggle-off" : "bi-toggle-on"
                } me-1`}
              />
              {detalle.estado === "activo" ? "Desactivar" : "Activar"}
            </button>
          </div>
        </aside>
      )}

      {/* ══ MODAL MECÁNICO ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div
            className="modal-card modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <i
                  className={`bi ${
                    editingId ? "bi-pencil" : "bi-person-plus"
                  } me-2`}
                />
                {editingId ? "Editar Mecánico" : "Nuevo Mecánico"}
              </h2>
              <button className="modal-close" onClick={cerrarModal}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert-error">
                  <i className="bi bi-exclamation-triangle me-1" />
                  {error}
                </div>
              )}

              {/* Datos personales */}
              <div className="mec-form-section">
                <div className="mec-form-label">
                  <i className="bi bi-person" /> Datos personales
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Primer nombre *</label>
                    <input
                      type="text"
                      placeholder="Ej: Juan"
                      value={form.primerNombre}
                      onChange={(e) => f("primerNombre", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Segundo nombre</label>
                    <input
                      type="text"
                      placeholder="Ej: Carlos"
                      value={form.segundoNombre}
                      onChange={(e) => f("segundoNombre", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Primer apellido *</label>
                    <input
                      type="text"
                      placeholder="Ej: García"
                      value={form.primerApellido}
                      onChange={(e) => f("primerApellido", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Segundo apellido</label>
                    <input
                      type="text"
                      placeholder="Ej: López"
                      value={form.segundoApellido}
                      onChange={(e) => f("segundoApellido", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Acceso */}
              <div className="mec-form-section">
                <div className="mec-form-label">
                  <i className="bi bi-shield-lock" /> Acceso al sistema
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Documento *</label>
                    <input
                      type="text"
                      placeholder="Ej: 1001234567"
                      value={form.documento}
                      onChange={(e) => f("documento", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      placeholder="Ej: jgarcia"
                      autoComplete="one-time-code"
                      value={form.username}
                      onChange={(e) => f("username", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Contraseña {editingId ? "(vacío = no cambiar)" : "*"}
                    </label>
                    <input
                      autoComplete="new-password"
                      type="password"
                      placeholder={
                        editingId
                          ? "Nueva contraseña (opcional)"
                          : "Contraseña inicial"
                      }
                      value={form.password}
                      onChange={(e) => f("password", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="mec-form-section">
                <div className="mec-form-label">
                  <i className="bi bi-telephone" /> Contacto
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      placeholder="Ej: juan@autotech.com"
                      value={form.email}
                      onChange={(e) => f("email", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      placeholder="Ej: 3001234567"
                      value={form.telefono}
                      onChange={(e) => f("telefono", e.target.value)}
                    />
                  </div>
                  <div className="form-group form-span-2">
                    <label>Dirección</label>
                    <input
                      type="text"
                      placeholder="Ej: Calle 45 # 23-10"
                      value={form.direccion}
                      onChange={(e) => f("direccion", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Datos laborales */}
              <div className="mec-form-section">
                <div className="mec-form-label">
                  <i className="bi bi-briefcase" /> Datos laborales
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Especialidad *</label>
                    <div className="input-with-btn">
                      <select
                        value={form.idEspecialidad}
                        onChange={(e) => f("idEspecialidad", e.target.value)}
                      >
                        <option value="">— Selecciona especialidad —</option>
                        {especialidades.map((e) => (
                          <option
                            key={e.idEspecialidad}
                            value={String(e.idEspecialidad)}
                          >
                            {e.nombreEspecialidad}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn-icon edit"
                        type="button"
                        title="Nueva especialidad"
                        onClick={() => setShowEsp(true)}
                      >
                        <i className="bi bi-plus-lg" />
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Salario base</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ej: 1500000"
                      value={form.salarioBase}
                      onChange={(e) => f("salarioBase", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={cerrarModal}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={guardar}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <i className="bi bi-arrow-repeat spin me-1" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <i
                      className={`bi ${
                        editingId ? "bi-check-lg" : "bi-person-plus"
                      } me-1`}
                    />
                    {editingId ? "Guardar cambios" : "Registrar mecánico"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MINI-MODAL ESPECIALIDAD ══ */}
      {showEsp && (
        <div className="modal-overlay" onClick={() => setShowEsp(false)}>
          <div
            className="modal-card modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Nueva Especialidad</h2>
              <button className="modal-close" onClick={() => setShowEsp(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: ".75rem" }}>
                <label>Nombre *</label>
                <input
                  type="text"
                  placeholder="Ej: Electricidad Automotriz"
                  value={nuevaEsp.nombre}
                  onChange={(e) =>
                    setNuevaEsp((p) => ({ ...p, nombre: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && guardarEspRapida()}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input
                  type="text"
                  placeholder="Descripción breve..."
                  value={nuevaEsp.descripcion}
                  onChange={(e) =>
                    setNuevaEsp((p) => ({
                      ...p,
                      descripcion: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowEsp(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={guardarEspRapida}>
                <i className="bi bi-check-lg me-1" /> Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
