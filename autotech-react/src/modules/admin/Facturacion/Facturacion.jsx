import { useState, useEffect, useRef } from "react";
import "./Facturacion.css";
import {
  facturaService,
  ordenService,
  clienteService,
  servicioService,
  productoService,
} from "../../../services/adminService";

const ESTADO_COLOR = {
  pendiente: { bg: "#fef3c7", color: "#b45309", label: "Pendiente" },
  pagada: { bg: "#dcfce7", color: "#15803d", label: "Pagada" },
  anulada: { bg: "#fee2e2", color: "#b91c1c", label: "Anulada" },
};

const METODOS_PAGO = [
  "Efectivo",
  "Tarjeta débito",
  "Tarjeta crédito",
  "Transferencia",
  "Nequi",
  "Daviplata",
];

const EMPTY_FORM = {
  clienteId: "",
  ordenId: "",
  metodoPago: "Efectivo",
  notas: "",
  items: [],
};

const fmtCOP = (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function Facturacion() {
  const [facturas, setFacturas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modoOrigen, setModoOrigen] = useState("manual"); // 'manual' | 'orden'
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [showPrint, setShowPrint] = useState(false);
  const [printData, setPrintData] = useState(null);

  /* catálogos */
  const [clientes, setClientes] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);

  const printRef = useRef();

  useEffect(() => {
    cargar();
    cargarCatalogos();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await facturaService.getAll();
      setFacturas(data || []);
    } catch {
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [c, o, s, p] = await Promise.all([
        clienteService.getAll(),
        ordenService.getAll(),
        servicioService.getAll(),
        productoService.getAll(),
      ]);
      setClientes(c || []);
      setOrdenes(o || []);
      setServicios(s || []);
      setProductos(p || []);
    } catch {}
  };

  /* ── Modal ── */
  const abrirCrear = () => {
    setForm(EMPTY_FORM);
    setModoOrigen("manual");
    setError("");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setError("");
  };

  /* Al elegir una orden, pre-cargar sus ítems */
  const elegirOrden = (ordenId) => {
    const orden = ordenes.find((o) => String(o.id) === String(ordenId));
    if (!orden) {
      setForm((p) => ({ ...p, ordenId, items: [] }));
      return;
    }
    const items = [
      ...(orden.servicios || []).map((s) => ({
        tipo: "servicio",
        refId: s.id,
        nombre: s.nombre,
        cantidad: 1,
        precioUnit: Number(s.precioBase || 0),
      })),
      ...(orden.productos || []).map((p) => ({
        tipo: "producto",
        refId: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad || 1,
        precioUnit: Number(p.precioBase || 0),
      })),
    ];
    setForm((prev) => ({
      ...prev,
      ordenId,
      clienteId: orden.clienteId || prev.clienteId,
      items,
    }));
  };

  /* Ítems manuales */
  const agregarItem = (tipo, ref) => {
    if (!ref) return;
    const existe = form.items.find(
      (i) => i.tipo === tipo && String(i.refId) === String(ref.id),
    );
    if (existe) return;
    setForm((p) => ({
      ...p,
      items: [
        ...p.items,
        {
          tipo,
          refId: ref.id,
          nombre: ref.nombre,
          cantidad: 1,
          precioUnit: Number(ref.precioBase || 0),
        },
      ],
    }));
  };

  const actualizarItem = (idx, key, val) => {
    setForm((p) => {
      const items = [...p.items];
      items[idx] = { ...items[idx], [key]: val };
      return { ...p, items };
    });
  };

  const eliminarItem = (idx) =>
    setForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const subtotal = form.items.reduce(
    (acc, i) => acc + Number(i.cantidad || 0) * Number(i.precioUnit || 0),
    0,
  );

  /* Guardar */
  const guardar = async () => {
    if (!form.clienteId) {
      setError("Selecciona un cliente.");
      return;
    }
    if (form.items.length === 0) {
      setError("Agrega al menos un ítem.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const payload = {
        clienteId: form.clienteId,
        ordenId: form.ordenId || null,
        metodoPago: form.metodoPago,
        notas: form.notas.trim(),
        items: form.items.map((i) => ({
          tipo: i.tipo,
          refId: i.refId,
          nombre: i.nombre,
          cantidad: Number(i.cantidad),
          precioUnit: Number(i.precioUnit),
        })),
      };
      await facturaService.crear(payload);
      cerrarModal();
      cargar();
    } catch (err) {
      setError(err.data || "Error al guardar la factura.");
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (factura, nuevoEstado, e) => {
    e?.stopPropagation();
    try {
      await facturaService.cambiarEstado(factura.id, nuevoEstado);
      cargar();
      if (detalle?.id === factura.id)
        setDetalle((prev) => ({ ...prev, estado: nuevoEstado }));
    } catch {
      alert("No se pudo cambiar el estado.");
    }
  };

  /* Imprimir */
  const verImpresion = (factura, e) => {
    e?.stopPropagation();
    setPrintData(factura);
    setShowPrint(true);
  };

  const imprimir = () => window.print();

  /* Filtros */
  const filtrados = facturas.filter((f) => {
    const q = busqueda.toLowerCase();
    const matchQ =
      (f.numeroFactura || "").toLowerCase().includes(q) ||
      (f.clienteNombre || "").toLowerCase().includes(q);
    const matchE = filtroEstado === "todos" || f.estado === filtroEstado;
    return matchQ && matchE;
  });

  const estadoColor = (est) => ESTADO_COLOR[est] || ESTADO_COLOR["pendiente"];

  /* ════════════════════════════════
      RENDER
     ════════════════════════════════ */
  return (
    <div className={`fac-page ${detalle ? "fac-has-detalle" : ""}`}>
      {/* ── COLUMNA PRINCIPAL ── */}
      <div className="fac-main">
        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-receipt" /> Facturación
            </h1>
            <p className="page-subtitle">Gestiona las facturas del taller</p>
          </div>
          <button className="btn-primary" onClick={abrirCrear}>
            <i className="bi bi-plus-lg" /> Nueva Factura
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="fac-toolbar">
          <div className="search-bar">
            <i className="bi bi-search" />
            <input
              placeholder="Buscar por N° factura o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="fac-clear" onClick={() => setBusqueda("")}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>
          <div className="fac-filtros">
            {["todos", "pendiente", "pagada", "anulada"].map((fe) => (
              <button
                key={fe}
                className={`fac-filtro-btn ${filtroEstado === fe ? "active" : ""}`}
                onClick={() => setFiltroEstado(fe)}
              >
                {fe.charAt(0).toUpperCase() + fe.slice(1)}
              </button>
            ))}
          </div>
          <span className="fac-count">
            {filtrados.length} factura{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* TABLA */}
        {loading ? (
          <div className="loading-state">
            <i className="bi bi-arrow-repeat spin" /> Cargando facturas...
          </div>
        ) : (
          <div className="table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>N° Factura</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Método pago</th>
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
                        : "No hay facturas registradas."}
                    </td>
                  </tr>
                ) : (
                  filtrados.map((f, i) => {
                    const ec = estadoColor(f.estado);
                    return (
                      <tr
                        key={f.id}
                        className={detalle?.id === f.id ? "fac-row-active" : ""}
                        onClick={() =>
                          setDetalle(detalle?.id === f.id ? null : f)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <td className="fac-td-num">{i + 1}</td>
                        <td>
                          <span className="fac-numero">
                            <i className="bi bi-receipt me-1" />
                            {f.numeroFactura ||
                              `FAC-${String(f.id).padStart(4, "0")}`}
                          </span>
                        </td>
                        <td>
                          <div className="fac-cliente">
                            {f.clienteNombre || "—"}
                          </div>
                          {f.ordenId && (
                            <div className="fac-orden-ref">
                              <i className="bi bi-clipboard me-1" />
                              Orden #{f.ordenId}
                            </div>
                          )}
                        </td>
                        <td className="fac-fecha">
                          {fmtDate(f.fechaEmision || f.createdAt)}
                        </td>
                        <td className="fac-total">{fmtCOP(f.total)}</td>
                        <td>
                          <span className="fac-metodo">
                            <i className="bi bi-credit-card me-1" />
                            {f.metodoPago || "—"}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <span
                            className="fac-estado-badge"
                            style={{ background: ec.bg, color: ec.color }}
                          >
                            {ec.label}
                          </span>
                        </td>
                        <td
                          className="actions-cell"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="btn-icon"
                            title="Ver / Imprimir"
                            onClick={(e) => verImpresion(f, e)}
                          >
                            <i className="bi bi-printer" />
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
          const ec = estadoColor(detalle.estado);
          const items = detalle.items || [];
          const total = items.reduce(
            (a, i) => a + Number(i.cantidad) * Number(i.precioUnit),
            0,
          );
          return (
            <aside className="fac-detalle">
              <div className="fac-detalle-header">
                <div className="fac-detalle-icon">
                  <i className="bi bi-receipt" />
                </div>
                <button
                  className="modal-close"
                  onClick={() => setDetalle(null)}
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>

              <div className="fac-detalle-body">
                <h3 className="fac-detalle-numero">
                  {detalle.numeroFactura ||
                    `FAC-${String(detalle.id).padStart(4, "0")}`}
                </h3>

                <span
                  className="fac-estado-badge"
                  style={{ background: ec.bg, color: ec.color }}
                >
                  {ec.label}
                </span>

                <div className="fac-detalle-info">
                  <div className="fac-info-row">
                    <span className="fac-info-label">
                      <i className="bi bi-person me-1" />
                      Cliente
                    </span>
                    <span className="fac-info-val">
                      {detalle.clienteNombre || "—"}
                    </span>
                  </div>
                  <div className="fac-info-row">
                    <span className="fac-info-label">
                      <i className="bi bi-calendar me-1" />
                      Fecha
                    </span>
                    <span className="fac-info-val">
                      {fmtDate(detalle.fechaEmision || detalle.createdAt)}
                    </span>
                  </div>
                  <div className="fac-info-row">
                    <span className="fac-info-label">
                      <i className="bi bi-credit-card me-1" />
                      Pago
                    </span>
                    <span className="fac-info-val">
                      {detalle.metodoPago || "—"}
                    </span>
                  </div>
                  {detalle.ordenId && (
                    <div className="fac-info-row">
                      <span className="fac-info-label">
                        <i className="bi bi-clipboard me-1" />
                        Orden
                      </span>
                      <span className="fac-info-val">#{detalle.ordenId}</span>
                    </div>
                  )}
                </div>

                {/* Ítems */}
                <p className="fac-section-title" style={{ marginTop: "1rem" }}>
                  Ítems
                </p>
                <div className="fac-items-list">
                  {items.length === 0 ? (
                    <p className="fac-empty-items">Sin ítems registrados.</p>
                  ) : (
                    items.map((it, idx) => (
                      <div key={idx} className="fac-item-row">
                        <span className={`fac-item-tipo ${it.tipo}`}>
                          <i
                            className={`bi ${it.tipo === "servicio" ? "bi-tools" : "bi-box-seam"}`}
                          />
                        </span>
                        <div className="fac-item-info">
                          <span className="fac-item-nombre">{it.nombre}</span>
                          <span className="fac-item-sub">
                            {it.cantidad} × {fmtCOP(it.precioUnit)}
                          </span>
                        </div>
                        <span className="fac-item-total">
                          {fmtCOP(Number(it.cantidad) * Number(it.precioUnit))}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="fac-detalle-total">
                  <span>Total</span>
                  <span className="fac-total-val">
                    {fmtCOP(detalle.total || total)}
                  </span>
                </div>

                {detalle.notas && (
                  <div className="fac-detalle-section">
                    <p className="fac-section-title">Notas</p>
                    <p className="fac-desc-full">{detalle.notas}</p>
                  </div>
                )}
              </div>

              <div className="fac-detalle-footer">
                <button
                  className="btn-secondary fac-w-full"
                  onClick={(e) => verImpresion(detalle, e)}
                >
                  <i className="bi bi-printer me-1" /> Ver / Imprimir
                </button>
                {detalle.estado === "pendiente" && (
                  <button
                    className="fac-w-full fac-pagar-btn"
                    onClick={(e) => cambiarEstado(detalle, "pagada", e)}
                  >
                    <i className="bi bi-check-circle me-1" /> Marcar como pagada
                  </button>
                )}
                {detalle.estado !== "anulada" && (
                  <button
                    className="fac-w-full fac-anular-btn"
                    onClick={(e) => cambiarEstado(detalle, "anulada", e)}
                  >
                    <i className="bi bi-x-circle me-1" /> Anular factura
                  </button>
                )}
              </div>
            </aside>
          );
        })()}

      {/* ══ MODAL NUEVA FACTURA ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div
            className="modal-card modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <i className="bi bi-plus-circle me-2" />
                Nueva Factura
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

              {/* Selector de modo */}
              <div className="fac-modo-tabs">
                <button
                  className={`fac-modo-tab ${modoOrigen === "manual" ? "active" : ""}`}
                  onClick={() => {
                    setModoOrigen("manual");
                    setForm((p) => ({ ...p, ordenId: "", items: [] }));
                  }}
                >
                  <i className="bi bi-pencil-square me-1" /> Manual
                </button>
                <button
                  className={`fac-modo-tab ${modoOrigen === "orden" ? "active" : ""}`}
                  onClick={() => setModoOrigen("orden")}
                >
                  <i className="bi bi-clipboard-check me-1" /> Desde orden
                </button>
              </div>

              <div className="form-grid-2" style={{ marginTop: "1rem" }}>
                {/* Cliente */}
                <div className="form-group">
                  <label>Cliente *</label>
                  <select
                    value={form.clienteId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, clienteId: e.target.value }))
                    }
                  >
                    <option value="">— Seleccionar cliente —</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellido || ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Método de pago */}
                <div className="form-group">
                  <label>Método de pago</label>
                  <select
                    value={form.metodoPago}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, metodoPago: e.target.value }))
                    }
                  >
                    {METODOS_PAGO.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Orden (si modo orden) */}
              {modoOrigen === "orden" && (
                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label>Orden de servicio</label>
                  <select
                    value={form.ordenId}
                    onChange={(e) => elegirOrden(e.target.value)}
                  >
                    <option value="">— Seleccionar orden —</option>
                    {ordenes.map((o) => (
                      <option key={o.id} value={o.id}>
                        #{o.id} — {o.clienteNombre || "Sin cliente"} (
                        {fmtDate(o.createdAt)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Agregar ítems manuales */}
              {modoOrigen === "manual" && (
                <div className="fac-agregar-items">
                  <p
                    className="fac-section-title"
                    style={{ marginBottom: ".5rem" }}
                  >
                    Agregar ítems
                  </p>
                  <div className="fac-add-row">
                    <div
                      className="form-group"
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <label style={{ fontSize: ".75rem" }}>Servicio</label>
                      <select
                        onChange={(e) => {
                          const s = servicios.find(
                            (x) => String(x.id) === e.target.value,
                          );
                          agregarItem("servicio", s);
                          e.target.value = "";
                        }}
                      >
                        <option value="">— Agregar servicio —</option>
                        {servicios
                          .filter((s) => s.estado === "activo")
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nombre} — {fmtCOP(s.precioBase)}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div
                      className="form-group"
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <label style={{ fontSize: ".75rem" }}>Producto</label>
                      <select
                        onChange={(e) => {
                          const p = productos.find(
                            (x) => String(x.id) === e.target.value,
                          );
                          agregarItem("producto", p);
                          e.target.value = "";
                        }}
                      >
                        <option value="">— Agregar producto —</option>
                        {productos
                          .filter((p) => p.estado === "activo")
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre} — {fmtCOP(p.precioBase)}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabla de ítems */}
              <div className="fac-items-editor">
                <p className="fac-section-title">
                  Ítems de la factura
                  <span className="fac-items-count">{form.items.length}</span>
                </p>
                {form.items.length === 0 ? (
                  <div className="fac-items-empty">
                    <i className="bi bi-cart-x" />
                    <span>Sin ítems aún</span>
                  </div>
                ) : (
                  <table className="fac-items-table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Nombre</th>
                        <th>Cant.</th>
                        <th>Precio unit.</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((it, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className={`fac-item-tipo ${it.tipo}`}>
                              <i
                                className={`bi ${it.tipo === "servicio" ? "bi-tools" : "bi-box-seam"}`}
                              />
                              {it.tipo}
                            </span>
                          </td>
                          <td className="fac-item-nombre-td">{it.nombre}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="fac-item-input"
                              value={it.cantidad}
                              onChange={(e) =>
                                actualizarItem(idx, "cantidad", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <div className="fac-item-precio-wrap">
                              <span>$</span>
                              <input
                                type="number"
                                min="0"
                                className="fac-item-input"
                                value={it.precioUnit}
                                onChange={(e) =>
                                  actualizarItem(
                                    idx,
                                    "precioUnit",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </td>
                          <td className="fac-item-sub-total">
                            {fmtCOP(
                              Number(it.cantidad) * Number(it.precioUnit),
                            )}
                          </td>
                          <td>
                            <button
                              className="btn-icon danger"
                              onClick={() => eliminarItem(idx)}
                              title="Eliminar"
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Total */}
                {form.items.length > 0 && (
                  <div className="fac-modal-total">
                    <span>Total factura</span>
                    <span className="fac-total-val">{fmtCOP(subtotal)}</span>
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label>Notas (opcional)</label>
                <textarea
                  rows={2}
                  className="fac-textarea"
                  placeholder="Observaciones, términos de pago, etc."
                  value={form.notas}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notas: e.target.value }))
                  }
                />
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
                    <i className="bi bi-receipt me-1" />
                    Crear factura
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ VISTA DE IMPRESIÓN ══ */}
      {showPrint &&
        printData &&
        (() => {
          const ec = estadoColor(printData.estado);
          const items = printData.items || [];
          const total =
            printData.total ||
            items.reduce(
              (a, i) => a + Number(i.cantidad) * Number(i.precioUnit),
              0,
            );
          return (
            <div
              className="modal-overlay fac-print-overlay"
              onClick={() => setShowPrint(false)}
            >
              <div
                className="fac-print-card"
                onClick={(e) => e.stopPropagation()}
                ref={printRef}
              >
                {/* Botones (solo pantalla) */}
                <div className="fac-print-actions no-print">
                  <button className="btn-primary" onClick={imprimir}>
                    <i className="bi bi-printer me-1" /> Imprimir
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowPrint(false)}
                  >
                    <i className="bi bi-x me-1" /> Cerrar
                  </button>
                </div>

                {/* Factura imprimible */}
                <div className="fac-doc">
                  <div className="fac-doc-header">
                    <div className="fac-doc-empresa">
                      <h2 className="fac-doc-nombre-empresa">
                        Taller Mecánico
                      </h2>
                      <p className="fac-doc-slogan">
                        Servicio automotriz profesional
                      </p>
                    </div>
                    <div className="fac-doc-meta">
                      <h3 className="fac-doc-titulo">FACTURA</h3>
                      <p className="fac-doc-numero">
                        {printData.numeroFactura ||
                          `FAC-${String(printData.id).padStart(4, "0")}`}
                      </p>
                      <span
                        className="fac-doc-estado"
                        style={{ background: ec.bg, color: ec.color }}
                      >
                        {ec.label}
                      </span>
                    </div>
                  </div>

                  <div className="fac-doc-info">
                    <div>
                      <p className="fac-doc-label">Cliente</p>
                      <p className="fac-doc-value">
                        {printData.clienteNombre || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="fac-doc-label">Fecha de emisión</p>
                      <p className="fac-doc-value">
                        {fmtDate(printData.fechaEmision || printData.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="fac-doc-label">Método de pago</p>
                      <p className="fac-doc-value">
                        {printData.metodoPago || "—"}
                      </p>
                    </div>
                    {printData.ordenId && (
                      <div>
                        <p className="fac-doc-label">Orden de servicio</p>
                        <p className="fac-doc-value">#{printData.ordenId}</p>
                      </div>
                    )}
                  </div>

                  <table className="fac-doc-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Descripción</th>
                        <th>Tipo</th>
                        <th>Cant.</th>
                        <th>Precio unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{it.nombre}</td>
                          <td style={{ textTransform: "capitalize" }}>
                            {it.tipo}
                          </td>
                          <td>{it.cantidad}</td>
                          <td>{fmtCOP(it.precioUnit)}</td>
                          <td>
                            {fmtCOP(
                              Number(it.cantidad) * Number(it.precioUnit),
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="fac-doc-total-row">
                    <span>TOTAL</span>
                    <span>{fmtCOP(total)}</span>
                  </div>

                  {printData.notas && (
                    <div className="fac-doc-notas">
                      <p className="fac-doc-label">Notas</p>
                      <p>{printData.notas}</p>
                    </div>
                  )}

                  <div className="fac-doc-footer">
                    <p>
                      Gracias por su confianza. Este documento sirve como
                      comprobante de pago.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
