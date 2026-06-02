import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  getMecanicoOrdenes,
  cambiarEstadoOrden,
} from "../../../services/mecanicoService";
import {
  servicioService,
  productoService,
} from "../../../services/adminService";
import { estadoConfig, prioridadConfig } from "../mecanicoHelpers.jsx";
import "./SecOrdenes.css";

/* ══════════════════════════════════════
   Modal inline — Completar orden
══════════════════════════════════════ */
function ModalCompletar({ orden, onConfirm, onCancel }) {
  const [detalles,    setDetalles]    = useState([
    { id: Date.now(), tipo: "servicio", idItem: "", cantidad: 1, precio: 0, descripcion: "" },
  ]);
  const [observacion, setObservacion] = useState("");
  const [enviando,    setEnviando]    = useState(false);
  const [servicios,   setServicios]   = useState([]);
  const [productos,   setProductos]   = useState([]);
  const [loadingCat,  setLoadingCat]  = useState(true);

  /* Cargar catálogos al montar */
  useEffect(() => {
    Promise.all([
      servicioService.getActivos(),
      productoService.getActivos(),
    ])
      .then(([svcs, prds]) => {
        setServicios(svcs || []);
        setProductos(prds || []);
      })
      .catch(() => {})
      .finally(() => setLoadingCat(false));
  }, []);

  /* ── Detalles ── */
  const addDetalle = () =>
    setDetalles(prev => [
      ...prev,
      { id: Date.now(), tipo: "servicio", idItem: "", cantidad: 1, precio: 0, descripcion: "" },
    ]);

  const removeDetalle = (id) =>
    setDetalles(prev => prev.filter(d => d.id !== id));

  const updateDetalle = (id, key, val) =>
    setDetalles(prev => prev.map(d => d.id === id ? { ...d, [key]: val } : d));

  /* Cuando cambia el item seleccionado, auto-rellena el precio */
  const handleItemChange = (id, idItem, tipo) => {
    const lista = tipo === "servicio" ? servicios : productos;
    const item  = lista.find(x => String(x.id) === String(idItem));
    updateDetalle(id, "idItem", idItem);
    if (item) {
      updateDetalle(id, "precio", tipo === "servicio" ? item.precioBase : item.precio);
    }
  };

  /* Cuando cambia el tipo, resetea item y precio */
  const handleTipoChange = (id, tipo) => {
    updateDetalle(id, "tipo",   tipo);
    updateDetalle(id, "idItem", "");
    updateDetalle(id, "precio", 0);
  };

  /* Total calculado */
  const total = detalles.reduce(
    (acc, d) => acc + Number(d.precio) * Number(d.cantidad),
    0,
  );

  /* ── Submit ── */
  const handleConfirm = async () => {
    setEnviando(true);
    const detallesLimpios = detalles
      .filter(d => d.idItem !== "")
      .map(d => ({
        idServicio:  d.tipo === "servicio" ? Number(d.idItem) : null,
        idProducto:  d.tipo === "producto" ? Number(d.idItem) : null,
        cantidad:    Number(d.cantidad),
        precio:      Number(d.precio),
        descripcion: d.descripcion || "",
      }));
    await onConfirm(detallesLimpios, observacion.trim());
    setEnviando(false);
  };

  return (
    <div
      className="mc-overlay"
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div className="mc-modal">

        {/* ── Header ── */}
        <div className="mc-header">
          <div className="mc-header-icon">
            <i className="bi bi-check-circle-fill" />
          </div>
          <div>
            <h3 className="mc-title">Completar orden</h3>
            <p className="mc-subtitle">
              {orden.servicio}&nbsp;·&nbsp;#{orden.id}
            </p>
          </div>
          <button className="mc-close" onClick={onCancel}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="mc-body">

          {/* ── Servicios y productos ── */}
          <section className="mc-section">
            <div className="mc-section-head">
              <span className="mc-section-title">
                <i className="bi bi-list-check" />
                Servicios y productos utilizados
              </span>
              <button
                className="mc-add-btn"
                onClick={addDetalle}
                disabled={loadingCat}
              >
                <i className="bi bi-plus" /> Agregar
              </button>
            </div>

            {loadingCat ? (
              <p className="mc-hint">
                <i className="bi bi-arrow-repeat mc-spin-icon" /> Cargando catálogo...
              </p>
            ) : (
              <>
                <div className="mc-det-header-row">
                  <span style={{ width: 90 }}>Tipo</span>
                  <span style={{ flex: 1 }}>Ítem</span>
                  <span style={{ width: 60 }}>Cant.</span>
                  <span style={{ width: 90 }}>Precio</span>
                  <span style={{ width: 32 }} />
                </div>

                <div className="mc-detalles-list">
                  {detalles.map((d, idx) => (
                    <div key={d.id} className="mc-det-row">
                      <span className="mc-det-num">{idx + 1}</span>

                      {/* Tipo */}
                      <select
                        className="mc-select mc-sel-tipo"
                        value={d.tipo}
                        onChange={e => handleTipoChange(d.id, e.target.value)}
                      >
                        <option value="servicio">Servicio</option>
                        <option value="producto">Producto</option>
                      </select>

                      {/* Ítem */}
                      <select
                        className="mc-select mc-sel-item"
                        value={d.idItem}
                        onChange={e => handleItemChange(d.id, e.target.value, d.tipo)}
                      >
                        <option value="">— Selecciona —</option>
                        {(d.tipo === "servicio" ? servicios : productos).map(x => (
                          <option key={x.id} value={x.id}>{x.nombre}</option>
                        ))}
                      </select>

                      {/* Cantidad */}
                      <input
                        className="mc-input mc-input-cant"
                        type="number"
                        min="1"
                        value={d.cantidad}
                        disabled={d.tipo === "servicio"}
                        onChange={e => updateDetalle(d.id, "cantidad", e.target.value)}
                      />

                      {/* Precio */}
                      <div className="mc-precio-wrap">
                        <span className="mc-precio-sym">$</span>
                        <input
                          className="mc-input mc-input-precio"
                          type="number"
                          min="0"
                          value={d.precio}
                          onChange={e => updateDetalle(d.id, "precio", e.target.value)}
                        />
                      </div>

                      {/* Eliminar */}
                      <button
                        className="mc-remove-btn"
                        onClick={() => removeDetalle(d.id)}
                        disabled={detalles.length === 1}
                        title="Eliminar"
                      >
                        <i className="bi bi-trash3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total */}
                {detalles.some(d => d.idItem) && (
                  <div className="mc-total-row">
                    <span>Total</span>
                    <strong>${total.toLocaleString("es-CO")}</strong>
                  </div>
                )}

                {detalles.every(d => !d.idItem) && (
                  <p className="mc-hint">
                    <i className="bi bi-info-circle" /> Sin ítems seleccionados — puedes dejarlo vacío.
                  </p>
                )}
              </>
            )}
          </section>

          {/* ── Observación ── */}
          <section className="mc-section">
            <div className="mc-section-head">
              <span className="mc-section-title">
                <i className="bi bi-chat-square-text" />
                Observación final del vehículo
              </span>
            </div>
            <textarea
              className="mc-textarea"
              placeholder="Ej: Se reemplazó el alternador. Vehículo en óptimas condiciones. Se recomienda revisión de batería en próxima visita."
              rows={4}
              value={observacion}
              onChange={e => setObservacion(e.target.value)}
            />
            <span className="mc-char-count">{observacion.length} / 500</span>
          </section>

        </div>

        {/* ── Footer ── */}
        <div className="mc-footer">
          <button
            className="mc-btn mc-btn-cancel"
            onClick={onCancel}
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            className="mc-btn mc-btn-confirm"
            onClick={handleConfirm}
            disabled={enviando}
          >
            {enviando
              ? <><span className="mc-spinner" /> Guardando...</>
              : <><i className="bi bi-check-lg" /> Confirmar como completada</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   SecOrdenes — componente principal
══════════════════════════════════════ */
export default function SecOrdenes() {
  const { user }  = useAuth();
  const idUsuario = user?.id;

  const [ordenes,   setOrdenes]   = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState("");
  const [filtro,    setFiltro]    = useState("todas");
  const [seleccion, setSeleccion] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!idUsuario) return;
    setCargando(true);
    getMecanicoOrdenes(idUsuario)
      .then(data => setOrdenes(data))
      .catch(e => { console.error(e); setError("No se pudieron cargar las órdenes."); })
      .finally(() => setCargando(false));
  }, [idUsuario]);

  const FILTROS = [
    { key: "todas",      label: "Todas"      },
    { key: "pendiente",  label: "Pendiente"  },
    { key: "en_proceso", label: "En proceso" },
    { key: "perdida",    label: "Perdida"    },
    { key: "completada", label: "Completada" },
  ];

  const esPerdida = (o) => {
    if (o.estado === "completada") return false;
    const MESES = { JAN:0, FEB:1, MAR:2, APR:3, MAY:4, JUN:5,
                    JUL:6, AUG:7, SEP:8, OCT:9, NOV:10, DEC:11 };
    const mes = MESES[o.fecha?.mes?.toUpperCase()];
    if (mes === undefined) return false;
    const [horaStr, periodo] = (o.hora ?? "").split(" ");
    let [h, m] = horaStr.split(":").map(Number);
    if (periodo === "PM" && h !== 12) h += 12;
    if (periodo === "AM" && h === 12) h = 0;
    const fechaOrden = new Date(2026, mes, Number(o.fecha.dia), h, m);
    return fechaOrden < new Date();
  };

  const ORDEN_ESTADO = { pendiente: 1, en_proceso: 2, perdida: 3, completada: 4 };

  const lista = (filtro === "todas"
    ? [...ordenes]
    : ordenes.filter(o => {
        const estado = esPerdida(o) ? "perdida" : o.estado;
        return estado === filtro;
      })
  ).map(o => esPerdida(o) ? { ...o, estado: "perdida" } : o)
   .sort((a, b) => (ORDEN_ESTADO[a.estado] ?? 99) - (ORDEN_ESTADO[b.estado] ?? 99));

  const iniciales = (nombre = "") =>
    nombre.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  const seleccionar = (orden) =>
    setSeleccion(prev => prev?.id === orden.id ? null : orden);

  const cerrar = () => { setSeleccion(null); setModalOpen(false); };

  const iniciarOrden = async () => {
    if (!seleccion || seleccion.estado !== "pendiente") return;
    try {
      const res = await cambiarEstadoOrden(idUsuario, seleccion.id);
      setOrdenes(prev => prev.map(o => o.id === seleccion.id ? { ...o, estado: res.estado } : o));
      setSeleccion(prev => ({ ...prev, estado: res.estado }));
    } catch {
      alert("No se pudo cambiar el estado.");
    }
  };

  const confirmarCompletar = async (detalles, observacion) => {
    try {
      const res = await cambiarEstadoOrden(idUsuario, seleccion.id, {
        detalles,
        observacion,
      });
      setOrdenes(prev => prev.map(o => o.id === seleccion.id ? { ...o, estado: res.estado } : o));
      setSeleccion(prev => ({ ...prev, estado: res.estado }));
      setModalOpen(false);
    } catch {
      alert("No se pudo completar la orden.");
    }
  };

  if (cargando) return <p className="sec-empty">Cargando órdenes...</p>;
  if (error)    return <p className="sec-empty sec-error">{error}</p>;

  return (
    <>
      <div className={`sec-page ${seleccion ? "sec-has-panel" : ""}`}>

        {/* ── COLUMNA PRINCIPAL ── */}
        <div className="sec-main">
          <div className="sec-header">
            <div>
              <h2 className="sec-title">
                <i className="bi bi-clipboard-check me-2" />
                Mis órdenes
              </h2>
              <p className="sec-sub">Órdenes de trabajo asignadas a ti</p>
            </div>
          </div>

          <div className="sec-filtros">
            {FILTROS.map(f => (
              <button
                key={f.key}
                className={`sec-filtro-btn ${filtro === f.key ? "active" : ""}`}
                onClick={() => { setFiltro(f.key); setSeleccion(null); }}
              >
                {f.label}
              </button>
            ))}
            <span className="sec-count">
              {lista.length} orden{lista.length !== 1 ? "es" : ""}
            </span>
          </div>

          <div className="sec-lista">
            {lista.length === 0 && (
              <p className="sec-empty">No hay órdenes con este estado.</p>
            )}
            {lista.map(o => (
              <div
                key={o.id}
                className={`orden-card ${seleccion?.id === o.id ? "orden-selected" : ""}`}
                data-estado={o.estado}
                onClick={() => seleccionar(o)}
              >
                <div className="orden-fecha">
                  <span className="fecha-dia">{o.fecha?.dia ?? "--"}</span>
                  <span className="fecha-mes">{o.fecha?.mes ?? "---"}</span>
                </div>
                <div className="orden-info">
                  <div className="orden-titulo">{o.servicio}</div>
                  <div className="orden-meta">
                    <span><i className="bi bi-tag" /> #{o.id}</span>
                    <span><i className="bi bi-clock" /> {o.hora}</span>
                    <span><i className="bi bi-car-front" /> {o.vehiculo} — {o.placa}</span>
                    <span><i className="bi bi-person" /> {o.cliente}</span>
                  </div>
                </div>
                <div className="orden-badges">
                  <span className={`sec-badge prioridad-${o.prioridad}`}>
                    {prioridadConfig[o.prioridad]?.label ?? o.prioridad}
                  </span>
                  <span className={`sec-badge estado-${o.estado}`}>
                    {estadoConfig[o.estado]?.label ?? o.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PANEL LATERAL ── */}
        {seleccion && (
          <aside className="sec-panel">
            <div className="panel-top">
              <div>
                <div className="panel-servicio">{seleccion.servicio}</div>
                <div className="panel-id">Orden #{seleccion.id}</div>
              </div>
              <button className="panel-close" onClick={cerrar}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="panel-body">
              <div className="panel-section">
                <p className="panel-section-title">Fecha y hora</p>
                <div className="panel-row">
                  <i className="bi bi-calendar3" />
                  <span>{seleccion.fecha?.dia} {seleccion.fecha?.mes}</span>
                </div>
                <div className="panel-row">
                  <i className="bi bi-clock" />
                  <span>{seleccion.hora}</span>
                </div>
              </div>

              <div className="panel-section">
                <p className="panel-section-title">Vehículo</p>
                <div className="panel-row">
                  <i className="bi bi-car-front" />
                  <span>{seleccion.vehiculo}</span>
                </div>
                <div className="panel-row">
                  <i className="bi bi-upc-scan" />
                  <span className="panel-placa">{seleccion.placa}</span>
                </div>
              </div>

              <div className="panel-section">
                <p className="panel-section-title">Cliente</p>
                <div className="panel-row">
                  <div className="panel-avatar">{iniciales(seleccion.cliente)}</div>
                  <span style={{ fontWeight: 500 }}>{seleccion.cliente}</span>
                </div>
              </div>

              <div className="panel-section">
                <p className="panel-section-title">Estado actual</p>
                <div className="panel-row" style={{ gap: "6px" }}>
                  <span className={`sec-badge prioridad-${seleccion.prioridad}`}>
                    {prioridadConfig[seleccion.prioridad]?.label ?? seleccion.prioridad}
                  </span>
                  <span className={`sec-badge estado-${seleccion.estado}`}>
                    {estadoConfig[seleccion.estado]?.label ?? seleccion.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="panel-footer">
              <button
                className="panel-btn panel-btn-primary"
                onClick={iniciarOrden}
                disabled={seleccion.estado !== "pendiente"}
                style={{ opacity: seleccion.estado !== "pendiente" ? 0.45 : 1 }}
              >
                <i className="bi bi-play-fill me-1" /> Iniciar orden
              </button>
              <button
                className="panel-btn"
                onClick={() => setModalOpen(true)}
                disabled={seleccion.estado !== "en_proceso"}
                style={{ opacity: seleccion.estado !== "en_proceso" ? 0.45 : 1 }}
              >
                <i className="bi bi-check-lg me-1" /> Marcar completada
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ── MODAL DE COMPLETAR ── */}
      {modalOpen && seleccion && (
        <ModalCompletar
          orden={seleccion}
          onConfirm={confirmarCompletar}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </>
  );
}