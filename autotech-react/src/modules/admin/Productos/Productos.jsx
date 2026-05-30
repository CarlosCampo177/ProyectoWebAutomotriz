import { useState, useEffect } from "react";
import "./Productos.css";
import { productoService } from "../../../services/adminService";

const CATEGORIAS = [
  "General",
  "Repuesto",
  "Consumible",
  "Herramienta",
  "Eléctrico",
  "Lubricante",
  "Filtro",
  "Frenos",
  "Suspensión",
  "Motor",
];

const CATEGORIA_COLOR = {
  General: { bg: "#f3f4f6", color: "#374151" },
  Repuesto: { bg: "#dbeafe", color: "#1d4ed8" },
  Consumible: { bg: "#fef3c7", color: "#b45309" },
  Herramienta: { bg: "#ede9fe", color: "#6d28d9" },
  Eléctrico: { bg: "#fef9c3", color: "#a16207" },
  Lubricante: { bg: "#dcfce7", color: "#15803d" },
  Filtro: { bg: "#e0f2fe", color: "#0369a1" },
  Frenos: { bg: "#fee2e2", color: "#b91c1c" },
  Suspensión: { bg: "#fce7f3", color: "#be185d" },
  Motor: { bg: "#ffedd5", color: "#c2410c" },
};

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  precioBase: "",
  stock: "",
  categoria: "General",
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroCat, setFiltroCat] = useState("todas");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await productoService.getAll();
      setProductos(data || []);
    } catch {
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Modal ── */
  const abrirCrear = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowModal(true);
  };

  const abrirEditar = (p) => {
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precioBase: p.precioBase,
      stock: p.stock ?? "",
      categoria: p.categoria || "General",
    });
    setEditingId(p.id);
    setError("");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setError("");
  };

  const guardar = async () => {
    if (!form.nombre.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    if (!form.precioBase || Number(form.precioBase) < 0) {
      setError("El precio base debe ser un número válido.");
      return;
    }
    if (form.stock === "" || Number(form.stock) < 0) {
      setError("El stock debe ser un número mayor o igual a 0.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precioBase: Number(form.precioBase),
        stock: Number(form.stock),
        categoria: form.categoria,
      };
      if (editingId) {
        await productoService.actualizar(editingId, payload);
      } else {
        await productoService.crear(payload);
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

  const cambiarEstado = async (p, e) => {
    e?.stopPropagation();
    try {
      await productoService.cambiarEstado(p.id);
      cargar();
      if (detalle?.id === p.id)
        setDetalle((prev) => ({
          ...prev,
          estado: prev.estado === "activo" ? "inactivo" : "activo",
        }));
    } catch {
      alert("No se pudo cambiar el estado.");
    }
  };

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const catColor = (cat) => CATEGORIA_COLOR[cat] || CATEGORIA_COLOR["General"];

  const stockTag = (stock) => {
    const n = Number(stock);
    if (n === 0) return { label: "Sin stock", cls: "stock-empty" };
    if (n <= 5) return { label: "Stock bajo", cls: "stock-low" };
    return { label: "En stock", cls: "stock-ok" };
  };
  s;
  const categoriasUsadas = [
    "todas",
    ...new Set(productos.map((p) => p.categoria).filter(Boolean)),
  ];

  const filtrados = productos.filter((p) => {
    const q = busqueda.toLowerCase();
    const matchQ =
      (p.nombre || "").toLowerCase().includes(q) ||
      (p.descripcion || "").toLowerCase().includes(q) ||
      (p.categoria || "").toLowerCase().includes(q);
    const matchE = filtroEstado === "todos" || p.estado === filtroEstado;
    const matchC = filtroCat === "todas" || p.categoria === filtroCat;
    return matchQ && matchE && matchC;
  });

  /* ════════════════════════════════
      RENDER
     ════════════════════════════════ */
  return (
    <div className={`prd-page ${detalle ? "prd-has-detalle" : ""}`}>
      {/* ── COLUMNA PRINCIPAL ── */}
      <div className="prd-main">
        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-box-seam" /> Productos
            </h1>
            <p className="page-subtitle">
              Gestiona el catálogo de productos e inventario del taller
            </p>
          </div>
          <button className="btn-primary" onClick={abrirCrear}>
            <i className="bi bi-plus-lg" /> Nuevo Producto
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="prd-toolbar">
          <div className="search-bar">
            <i className="bi bi-search" />
            <input
              placeholder="Buscar por nombre, descripción o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="prd-clear" onClick={() => setBusqueda("")}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>
          <div className="prd-filtros">
            {["todos", "activo", "inactivo"].map((fe) => (
              <button
                key={fe}
                className={`prd-filtro-btn ${filtroEstado === fe ? "active" : ""}`}
                onClick={() => setFiltroEstado(fe)}
              >
                {fe.charAt(0).toUpperCase() + fe.slice(1)}
              </button>
            ))}
          </div>
          <span className="prd-count">
            {filtrados.length} producto{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* FILTRO CATEGORÍAS */}
        <div className="prd-cats">
          {categoriasUsadas.map((cat) => (
            <button
              key={cat}
              className={`prd-cat-btn ${filtroCat === cat ? "active" : ""}`}
              style={
                filtroCat === cat && cat !== "todas"
                  ? {
                      background: catColor(cat).bg,
                      color: catColor(cat).color,
                      borderColor: catColor(cat).color,
                    }
                  : {}
              }
              onClick={() => setFiltroCat(cat)}
            >
              {cat === "todas" ? "Todas las categorías" : cat}
            </button>
          ))}
        </div>

        {/* TABLA */}
        {loading ? (
          <div className="loading-state">
            <i className="bi bi-arrow-repeat spin" /> Cargando productos...
          </div>
        ) : (
          <div className="table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio base</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-row">
                      <i className="bi bi-inbox me-2" />
                      {busqueda
                        ? "Sin resultados."
                        : "No hay productos registrados."}
                    </td>
                  </tr>
                ) : (
                  filtrados.map((p, i) => {
                    const st = stockTag(p.stock);
                    return (
                      <tr
                        key={p.id}
                        className={detalle?.id === p.id ? "prd-row-active" : ""}
                        onClick={() =>
                          setDetalle(detalle?.id === p.id ? null : p)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <td className="prd-td-num">{i + 1}</td>
                        <td>
                          <div className="prd-nombre">{p.nombre}</div>
                          <div className="prd-desc">{p.descripcion || "—"}</div>
                        </td>
                        <td>
                          <span
                            className="prd-badge-cat"
                            style={{
                              background: catColor(p.categoria).bg,
                              color: catColor(p.categoria).color,
                            }}
                          >
                            {p.categoria}
                          </span>
                        </td>
                        <td className="prd-precio">
                          ${Number(p.precioBase).toLocaleString("es-CO")}
                        </td>
                        <td>
                          <span className={`prd-stock-badge ${st.cls}`}>
                            {Number(p.stock).toLocaleString("es-CO")} —{" "}
                            {st.label}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button
                            className={`prd-estado-btn ${p.estado}`}
                            onClick={(e) => cambiarEstado(p, e)}
                          >
                            <i
                              className={`bi ${
                                p.estado === "activo"
                                  ? "bi-toggle-on"
                                  : "bi-toggle-off"
                              }`}
                            />
                            {p.estado === "activo" ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td
                          className="actions-cell"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="btn-icon edit"
                            onClick={() => abrirEditar(p)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── PANEL LATERAL ── */}
      {detalle &&
        (() => {
          const st = stockTag(detalle.stock);
          return (
            <aside className="prd-detalle">
              <div className="prd-detalle-header">
                <div
                  className="prd-detalle-icon"
                  style={{
                    background: catColor(detalle.categoria).bg,
                    color: catColor(detalle.categoria).color,
                  }}
                >
                  <i className="bi bi-box-seam" />
                </div>
                <button
                  className="modal-close"
                  onClick={() => setDetalle(null)}
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>

              <div className="prd-detalle-body">
                <h3 className="prd-detalle-nombre">{detalle.nombre}</h3>

                <span
                  className="prd-badge-cat"
                  style={{
                    background: catColor(detalle.categoria).bg,
                    color: catColor(detalle.categoria).color,
                  }}
                >
                  {detalle.categoria}
                </span>

                <div style={{ marginTop: ".6rem" }}>
                  <span
                    className={`prd-estado-btn ${detalle.estado}`}
                    style={{ fontSize: ".75rem" }}
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

                <div className="prd-detalle-precio">
                  <span className="prd-precio-label">Precio base</span>
                  <span className="prd-precio-val">
                    ${Number(detalle.precioBase).toLocaleString("es-CO")}
                  </span>
                </div>

                <div className="prd-detalle-stock">
                  <span className="prd-precio-label">Inventario</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".6rem",
                      marginTop: ".2rem",
                    }}
                  >
                    <span className="prd-precio-val">
                      {Number(detalle.stock).toLocaleString("es-CO")}
                    </span>
                    <span className={`prd-stock-badge ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                </div>

                <div className="prd-detalle-section">
                  <p className="prd-section-title">Descripción</p>
                  <p className="prd-desc-full">
                    {detalle.descripcion || "Sin descripción registrada."}
                  </p>
                </div>
              </div>

              <div className="prd-detalle-footer">
                <button
                  className="btn-secondary prd-w-full"
                  onClick={() => abrirEditar(detalle)}
                >
                  <i className="bi bi-pencil me-1" /> Editar producto
                </button>
                <button
                  className={`prd-w-full prd-toggle-btn ${detalle.estado}`}
                  onClick={(e) => cambiarEstado(detalle, e)}
                >
                  <i
                    className={`bi ${
                      detalle.estado === "activo"
                        ? "bi-toggle-off"
                        : "bi-toggle-on"
                    } me-1`}
                  />
                  {detalle.estado === "activo" ? "Desactivar" : "Activar"}
                </button>
              </div>
            </aside>
          );
        })()}

      {/* ══ MODAL PRODUCTO ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div
            className="modal-card modal-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <i
                  className={`bi ${
                    editingId ? "bi-pencil" : "bi-plus-circle"
                  } me-2`}
                />
                {editingId ? "Editar Producto" : "Nuevo Producto"}
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

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Nombre *</label>
                <input
                  type="text"
                  placeholder="Ej: Filtro de aire"
                  value={form.nombre}
                  onChange={(e) => f("nombre", e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Describe brevemente el producto..."
                  value={form.descripcion}
                  onChange={(e) => f("descripcion", e.target.value)}
                  className="prd-textarea"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Precio base *</label>
                  <div className="prd-precio-input">
                    <span>$</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.precioBase}
                      onChange={(e) => f("precioBase", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Stock *</label>
                  <div className="prd-precio-input">
                    <span>
                      <i className="bi bi-boxes" />
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.stock}
                      onChange={(e) => f("stock", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label>Categoría</label>
                <select
                  value={form.categoria}
                  onChange={(e) => f("categoria", e.target.value)}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview categoría */}
              <div className="prd-cat-preview">
                <span
                  className="prd-badge-cat"
                  style={{
                    background: catColor(form.categoria).bg,
                    color: catColor(form.categoria).color,
                  }}
                >
                  {form.categoria}
                </span>
                <span className="prd-preview-label">
                  Vista previa de categoría
                </span>
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
                        editingId ? "bi-check-lg" : "bi-plus-lg"
                      } me-1`}
                    />
                    {editingId ? "Guardar cambios" : "Crear producto"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
