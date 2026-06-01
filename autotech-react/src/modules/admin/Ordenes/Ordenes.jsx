import { useState, useEffect } from "react";
import "./Ordenes.css";
import {
  ordenService,
  mecanicoAdminService,
  clienteAdminService,
  vehiculoService,
  servicioService,
  productoService,
} from "../../../services/adminService";
import Calendario from "./Calendario";

/* ── Constantes ── */
const ESTADOS_CITA = ["pendiente", "confirmada", "cancelada"];
const ESTADOS_ORDEN = [
  "pendiente",
  "confirmada",
  "en_proceso",
  "terminada",
  "facturada",
  "cancelada",
];
const PRIORIDADES = ["baja", "normal", "alta", "urgente"];

const ESTADO_CFG = {
  pendiente: { label: "Pendiente", color: "#b45309", bg: "#fef3c7" },
  confirmada: { label: "Confirmada", color: "#1d4ed8", bg: "#dbeafe" },
  en_proceso: { label: "En proceso", color: "#6d28d9", bg: "#ede9fe" },
  terminada: { label: "Terminada", color: "#15803d", bg: "#dcfce7" },
  facturada: { label: "Facturada", color: "#0369a1", bg: "#e0f2fe" },
  cancelada: { label: "Cancelada", color: "#b91c1c", bg: "#fee2e2" },
};

const PRI_CFG = {
  baja: { color: "#6b7280", bg: "#f3f4f6" },
  normal: { color: "#1d4ed8", bg: "#dbeafe" },
  alta: { color: "#b45309", bg: "#fef3c7" },
  urgente: { color: "#b91c1c", bg: "#fee2e2" },
};

const EMPTY_FORM = {
  tipo: "orden",
  idCliente: "",
  idVehiculo: "",
  idMecanico: "",
  fechaProgramada: "",
  hora: "",
  prioridad: "normal",
  problemaReportado: "",
  costoEstimado: "",
};

/* ══════════════════════════════════════════════════
   MODAL ASIGNAR MECÁNICO — con calendario del día
══════════════════════════════════════════════════ */
const HORAS_DIA = Array.from({ length: 20 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const fmt12 = (h24) => {
  if (!h24) return "";
  const [h, m] = h24.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
};

function ModalAsignarMecanico({
  mecanicos,
  mecForm,
  setMecForm,
  onClose,
  onGuardar,
  ordenService,
}) {
  const [selMec, setSelMec] = useState(mecForm || "");
  const [agenda, setAgenda] = useState([]);
  const [loadingAgenda, setLoadingAgenda] = useState(false);

  const hoy = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!selMec) { setAgenda([]); return; }
    cargarAgenda(selMec);
  }, [selMec]);

  const cargarAgenda = async (idMec) => {
    try {
      setLoadingAgenda(true);
      const data = await ordenService.getCalendario(hoy, hoy);
      setAgenda(
        (data || []).filter((e) => String(e.idMecanico) === String(idMec))
      );
    } catch {
      setAgenda([]);
    } finally {
      setLoadingAgenda(false);
    }
  };

  const confirmar = () => {
    setMecForm(selMec);
    onGuardar();
  };

  const mecSeleccionado = mecanicos.find((m) => String(m.id) === String(selMec));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card mam-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <i className="bi bi-person-badge me-2" />
            Asignar Mecánico
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="mam-body">
          {/* Lista de mecánicos */}
          <div className="mam-lista">
            <p className="mam-lista-titulo">Mecánicos disponibles</p>
            {mecanicos.map((m) => (
              <button
                key={m.id}
                className={`mam-mec-card ${String(selMec) === String(m.id) ? "selected" : ""}`}
                onClick={() => setSelMec(String(m.id))}
              >
                <div className="mam-avatar">
                  {m.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="mam-mec-info">
                  <div className="mam-mec-nombre">{m.nombre}</div>
                  <div className="mam-mec-esp">{m.especialidad}</div>
                </div>
                <span className="mam-mec-activas">
                  {m.ordenesActivas ?? 0} activas
                </span>
              </button>
            ))}
          </div>

          {/* Calendario del día del mecánico seleccionado */}
          <div className="mam-cal">
            {!selMec ? (
              <div className="mam-cal-empty">
                <i className="bi bi-person-plus" />
                <p>Selecciona un mecánico para ver su agenda de hoy</p>
              </div>
            ) : (
              <>
                <p className="mam-lista-titulo">
                  Agenda de hoy —{" "}
                  <strong>{mecSeleccionado?.nombre}</strong>
                </p>
                {loadingAgenda ? (
                  <div className="mam-cal-loading">
                    <i className="bi bi-arrow-repeat spin" /> Cargando...
                  </div>
                ) : (
                  <div className="mam-cal-grid">
                    {HORAS_DIA.map((hora) => {
                      const eventos = agenda.filter((e) => e.hora === hora);
                      return (
                        <div key={hora} className="mam-slot">
                          <span className="mam-slot-hora">{fmt12(hora)}</span>
                          <div className="mam-slot-contenido">
                            {eventos.length === 0 ? (
                              <span className="mam-slot-libre">Libre</span>
                            ) : (
                              eventos.map((ev) => (
                                <div
                                  key={ev.id}
                                  className={`mam-evento ${ev.tipo}`}
                                >
                                  <i
                                    className={`bi bi-${ev.tipo === "cita" ? "calendar-event" : "wrench"} me-1`}
                                  />
                                  {ev.cliente.split(" ")[0]} — {ev.servicio}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={confirmar}
            disabled={!selMec}
          >
            <i className="bi bi-check-lg me-1" />
            Asignar{mecSeleccionado ? ` a ${mecSeleccionado.nombre.split(" ")[0]}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Ordenes() {
  const [tab, setTab] = useState("citas");
  const [citas, setCitas] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [detalleData, setDetalleData] = useState(null);
  const [loadingDet, setLoadingDet] = useState(false);

  // modales
  const [showModal, setShowModal] = useState(false);
  const [showMec, setShowMec] = useState(false);
  const [showEstado, setShowEstado] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [mecTarget, setMecTarget] = useState(null);
  const [estadoTarget, setEstadoTarget] = useState(null);
  const [mecForm, setMecForm] = useState("");
  const [estadoForm, setEstadoForm] = useState("");

  // datos para selectores
  const [clientes, setClientes] = useState([]);
  const [vehiculosCli, setVehiculosCli] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [detallesForm, setDetallesForm] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarTodo();
    cargarSelectores();
  }, []);

  /* ── Carga ── */
  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [c, o] = await Promise.all([
        ordenService.getAll({ tipo: "cita" }),
        ordenService.getAll({ tipo: "orden" }),
      ]);
      setCitas(c || []);
      setOrdenes(o || []);
    } catch {
      setCitas([]);
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarSelectores = async () => {
    try {
      const [cli, mec, srv, prd] = await Promise.all([
        clienteAdminService.getTodos(),
        mecanicoAdminService.getDisponibles(),
        servicioService.getActivos(),
        productoService.getActivos(),
      ]);
      setClientes(cli || []);
      setMecanicos(mec || []);
      setServicios(srv || []);
      setProductos(prd || []);
    } catch {}
  };

  /* ── Detalle panel ── */
  const abrirDetalle = async (item) => {
    if (detalle?.id === item.id) {
      setDetalle(null);
      setDetalleData(null);
      return;
    }
    setDetalle(item);
    setDetalleData(null);
    try {
      setLoadingDet(true);
      const data = await ordenService.getById(item.id);
      setDetalleData(data);
    } catch {
    } finally {
      setLoadingDet(false);
    }
  };

  /* ── Cargar vehículos cuando cambia cliente ── */
  const handleClienteChange = async (idCliente) => {
    setForm((p) => ({ ...p, idCliente, idVehiculo: "" }));
    setVehiculosCli([]);
    if (!idCliente) return;
    try {
      const data = await vehiculoService.getAll();
      setVehiculosCli(
        (data || []).filter((v) => String(v.idCliente) === String(idCliente)),
      );
    } catch {}
  };

  /* ── Modal crear/editar ── */
  const abrirCrear = (tipo = tab === "citas" ? "cita" : "orden") => {
    setForm({ ...EMPTY_FORM, tipo });
    setDetallesForm([]);
    setEditingId(null);
    setError("");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setError("");
  };

  const guardar = async () => {
    if (!form.idCliente || !form.idVehiculo) {
      setError("Cliente y vehículo son requeridos.");
      return;
    }
    if (form.tipo === "cita" && (!form.fechaProgramada || !form.hora)) {
      setError("Las citas requieren fecha y hora.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const payload = {
        tipo: form.tipo,
        idCliente: Number(form.idCliente),
        idVehiculo: Number(form.idVehiculo),
        idMecanico: form.idMecanico ? Number(form.idMecanico) : null,
        fechaProgramada: form.tipo === "orden"
          ? new Date().toISOString().split("T")[0]
          : form.fechaProgramada || null,
        hora: form.tipo === "orden"
          ? new Date().toTimeString().slice(0, 5)
          : form.hora || null,
        prioridad: form.prioridad,
        problemaReportado: form.problemaReportado || null,
        costoEstimado: form.costoEstimado ? Number(form.costoEstimado) : null,
        detalles: detallesForm.map((d) => ({
          idServicio: d.tipo === "servicio" ? Number(d.idItem) : null,
          idProducto: d.tipo === "producto" ? Number(d.idItem) : null,
          cantidad: Number(d.cantidad),
          precio: Number(d.precio),
          descripcion: d.descripcion || "",
        })),
      };
      if (editingId) {
        await ordenService.actualizar(editingId, payload);
      } else {
        await ordenService.crear(payload);
      }
      cerrarModal();
      setDetalle(null);
      cargarTodo();
    } catch (err) {
      setError(err.data || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Detalles del form ── */
  const addDetalle = () =>
    setDetallesForm((p) => [
      ...p,
      { tipo: "servicio", idItem: "", cantidad: 1, precio: 0, descripcion: "" },
    ]);

  const updateDetalle = (i, key, val) =>
    setDetallesForm((p) =>
      p.map((d, idx) => (idx === i ? { ...d, [key]: val } : d)),
    );

  const removeDetalle = (i) =>
    setDetallesForm((p) => p.filter((_, idx) => idx !== i));

  const handleItemChange = (i, idItem, tipo) => {
    const lista = tipo === "servicio" ? servicios : productos;
    const item = lista.find((x) => String(x.id) === String(idItem));
    updateDetalle(i, "idItem", idItem);
    if (item)
      updateDetalle(
        i,
        "precio",
        tipo === "servicio" ? item.precioBase : item.precio,
      );
  };

  /* ── Modal mecánico ── */
  const abrirAsignarMec = (item, e) => {
    e?.stopPropagation();
    setMecTarget(item);
    setMecForm(item.idMecanico ? String(item.idMecanico) : "");
    setShowMec(true);
  };

  const guardarMecanico = async () => {
    if (!mecForm) return;
    try {
      await ordenService.asignarMecanico(mecTarget.id, {
        idMecanico: Number(mecForm),
      });
      setShowMec(false);
      cargarTodo();
      if (detalle?.id === mecTarget.id) {
        const data = await ordenService.getById(mecTarget.id);
        setDetalleData(data);
      }
    } catch (err) {
      alert(err.data || "Error al asignar mecánico.");
    }
  };

  /* ── Modal estado ── */
  const abrirCambiarEstado = (item, e) => {
    e?.stopPropagation();
    setEstadoTarget(item);
    setEstadoForm(item.estado);
    setShowEstado(true);
  };

  const guardarEstado = async () => {
    try {
      await ordenService.cambiarEstado(estadoTarget.id, { estado: estadoForm });
      setShowEstado(false);
      cargarTodo();
      if (detalle?.id === estadoTarget.id)
        setDetalle((prev) => ({ ...prev, estado: estadoForm }));
    } catch (err) {
      alert(err.data || "Error al cambiar estado.");
    }
  };

  /* ── Convertir cita ── */
  const convertir = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("¿Convertir esta cita en orden de servicio?")) return;
    try {
      await ordenService.convertir(id);
      cargarTodo();
      if (detalle?.id === id) setDetalle(null);
    } catch (err) {
      alert(err.data || "Error.");
    }
  };

  /* ── Validación fechas ── */
  const getFechaMin = () => new Date().toISOString().split("T")[0];

  const getFechaMax = (tipo) => {
    const d = new Date();
    d.setDate(d.getDate() + (tipo === "cita" ? 30 : 90));
    return d.toISOString().split("T")[0];
  };

  /* ── Slots de hora para citas (cada 30 min, 8 AM – 6 PM) ── */
  const generarSlotsHora = () => {
    const slots = [];
    for (let h = 8; h < 18; h++) {
      ["00", "30"].forEach((m) => {
        const hora24 = `${String(h).padStart(2, "0")}:${m}`;
        const hora12 =
          h < 12
            ? `${h === 0 ? 12 : h}:${m} AM`
            : `${h === 12 ? 12 : h - 12}:${m} PM`;
        slots.push({ value: hora24, label: hora12 });
      });
    }
    return slots;
  };

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const listaActual = tab === "citas" ? citas : ordenes;

  const filtrados = listaActual.filter((o) => {
    const q = busqueda.toLowerCase();
    return (
      (o.cliente || "").toLowerCase().includes(q) ||
      (o.vehiculo || "").toLowerCase().includes(q) ||
      (o.placa || "").toLowerCase().includes(q) ||
      (o.mecanico || "").toLowerCase().includes(q) ||
      String(o.id).includes(q)
    );
  });

  /* ════════════════════════════════════
     RENDER
  ════════════════════════════════════ */
  return (
    <div className={`ord-page ${detalle ? "ord-has-detalle" : ""}`}>
      <div className="ord-main">
        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-calendar-check" /> Órdenes y Citas
            </h1>
            <p className="page-subtitle">
              Gestiona citas y órdenes de servicio del taller
            </p>
          </div>
          {tab !== "calendario" && (
            <button className="btn-primary" onClick={() => abrirCrear()}>
              <i className="bi bi-plus-lg" />
              {tab === "citas" ? "Nueva Cita" : "Nueva Orden"}
            </button>
          )}
        </div>

        {/* TABS PRINCIPALES */}
        <div className="ord-main-tabs">
          <button
            className={`ord-main-tab ${tab === "citas" ? "active" : ""}`}
            onClick={() => {
              setTab("citas");
              setDetalle(null);
              setBusqueda("");
            }}
          >
            <i className="bi bi-calendar-event me-1" />
            Citas
            <span className="ord-tab-badge">{citas.length}</span>
          </button>
          <button
            className={`ord-main-tab ${tab === "ordenes" ? "active" : ""}`}
            onClick={() => {
              setTab("ordenes");
              setDetalle(null);
              setBusqueda("");
            }}
          >
            <i className="bi bi-clipboard-check me-1" />
            Órdenes
            <span className="ord-tab-badge">{ordenes.length}</span>
          </button>
          <button
            className={`ord-main-tab ${tab === "calendario" ? "active" : ""}`}
            onClick={() => {
              setTab("calendario");
              setDetalle(null);
              setBusqueda("");
            }}
          >
            <i className="bi bi-calendar3 me-1" />
            Calendario
          </button>
        </div>

        {/* TAB CALENDARIO */}
        {tab === "calendario" && <Calendario />}

        {/* TOOLBAR + TABLA (solo en citas/ordenes) */}
        {tab !== "calendario" && (
          <>
            {/* TOOLBAR */}
            <div className="ord-toolbar">
              <div className="search-bar">
                <i className="bi bi-search" />
                <input
                  placeholder="Buscar por cliente, vehículo, placa o #orden..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                  <button
                    className="ord-clear"
                    onClick={() => setBusqueda("")}
                  >
                    <i className="bi bi-x" />
                  </button>
                )}
              </div>
              <span className="ord-count">
                {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* TABLA */}
            {loading ? (
              <div className="loading-state">
                <i className="bi bi-arrow-repeat spin" /> Cargando...
              </div>
            ) : (
              <div className="table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente / Vehículo</th>
                      <th>Servicio</th>
                      <th>Mecánico</th>
                      <th>Fecha</th>
                      <th>Prioridad</th>
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
                            : tab === "citas"
                              ? "No hay citas registradas."
                              : "No hay órdenes registradas."}
                        </td>
                      </tr>
                    ) : (
                      filtrados.map((o) => (
                        <tr
                          key={o.id}
                          className={
                            detalle?.id === o.id ? "ord-row-active" : ""
                          }
                          onClick={() => abrirDetalle(o)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="ord-td-id">
                            <span className="ord-badge-id">
                              #{String(o.id).padStart(4, "0")}
                            </span>
                          </td>
                          <td>
                            <div className="ord-nombre">{o.cliente}</div>
                            <div className="ord-sub">
                              <i className="bi bi-car-front me-1" />
                              {o.placa} —{" "}
                              {o.vehiculo.split(" ").slice(0, 2).join(" ")}
                            </div>
                          </td>
                          <td className="ord-servicio">{o.servicio}</td>
                          <td>
                            {o.mecanico ? (
                              <div className="ord-mec-cell">
                                <div className="ord-mec-avatar">
                                  {o.mecanico
                                    .split(" ")
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")}
                                </div>
                                <span className="ord-sub">{o.mecanico}</span>
                              </div>
                            ) : (
                              <span className="ord-sin-mec">Sin asignar</span>
                            )}
                          </td>
                          <td className="ord-fecha">
                            {o.fechaProgramada || o.fechaCreacion}
                            {o.hora && (
                              <div className="ord-sub">{o.hora}</div>
                            )}
                          </td>
                          <td>
                            <span
                              className="ord-badge-pri"
                              style={{
                                background: PRI_CFG[o.prioridad]?.bg,
                                color: PRI_CFG[o.prioridad]?.color,
                              }}
                            >
                              {o.prioridad}
                            </span>
                          </td>
                          <td>
                            <span
                              className="ord-badge-estado"
                              style={{
                                background: ESTADO_CFG[o.estado]?.bg,
                                color: ESTADO_CFG[o.estado]?.color,
                              }}
                            >
                              {ESTADO_CFG[o.estado]?.label}
                            </span>
                          </td>
                          <td
                            className="actions-cell"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="btn-icon edit"
                              onClick={(e) => abrirAsignarMec(o, e)}
                              title="Asignar mecánico"
                            >
                              <i className="bi bi-person-badge" />
                            </button>
                            <button
                              className="btn-icon ord-btn-estado"
                              onClick={(e) => abrirCambiarEstado(o, e)}
                              title="Cambiar estado"
                            >
                              <i className="bi bi-arrow-repeat" />
                            </button>
                            {tab === "citas" && o.estado !== "cancelada" && (
                              <button
                                className="btn-icon ord-btn-convertir"
                                onClick={(e) => convertir(o.id, e)}
                                title="Convertir a orden"
                              >
                                <i className="bi bi-arrow-right-circle" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── PANEL LATERAL ── */}
      {detalle && (
        <aside className="ord-detalle">
          <div className="ord-detalle-header">
            <div>
              <span className="ord-badge-id" style={{ fontSize: ".85rem" }}>
                #{String(detalle.id).padStart(4, "0")}
              </span>
              <div style={{ marginTop: ".35rem" }}>
                <span
                  className="ord-badge-estado"
                  style={{
                    background: ESTADO_CFG[detalle.estado]?.bg,
                    color: ESTADO_CFG[detalle.estado]?.color,
                  }}
                >
                  {ESTADO_CFG[detalle.estado]?.label}
                </span>
              </div>
            </div>
            <button
              className="modal-close"
              onClick={() => {
                setDetalle(null);
                setDetalleData(null);
              }}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="ord-detalle-body">
            {loadingDet ? (
              <div className="loading-state" style={{ padding: "2rem" }}>
                <i className="bi bi-arrow-repeat spin" />
              </div>
            ) : detalleData ? (
              <>
                {/* Cliente */}
                <div className="ord-det-section">
                  <p className="ord-det-title">Cliente</p>
                  <div className="ord-det-row">
                    <i className="bi bi-person" />
                    <span>{detalleData.cliente?.nombre}</span>
                  </div>
                  <div className="ord-det-row">
                    <i className="bi bi-envelope" />
                    <span>{detalleData.cliente?.email}</span>
                  </div>
                </div>

                {/* Vehículo */}
                <div className="ord-det-section">
                  <p className="ord-det-title">Vehículo</p>
                  <div className="ord-det-row">
                    <i className="bi bi-car-front" />
                    <span>
                      {detalleData.vehiculo?.nombre}{" "}
                      {detalleData.vehiculo?.anio}
                    </span>
                  </div>
                  <div className="ord-det-row">
                    <i className="bi bi-upc" />
                    <span className="ord-placa-badge">
                      {detalleData.vehiculo?.placa}
                    </span>
                  </div>
                </div>

                {/* Mecánico */}
                <div className="ord-det-section">
                  <p className="ord-det-title">Mecánico</p>
                  {detalleData.mecanico ? (
                    <div className="ord-det-row">
                      <i className="bi bi-person-badge" />
                      <span>{detalleData.mecanico.nombre}</span>
                    </div>
                  ) : (
                    <button
                      className="ord-asignar-btn"
                      onClick={(e) => abrirAsignarMec(detalle, e)}
                    >
                      <i className="bi bi-person-plus me-1" />
                      Asignar mecánico
                    </button>
                  )}
                </div>

                {/* Problema */}
                {detalleData.problemaReportado && (
                  <div className="ord-det-section">
                    <p className="ord-det-title">Problema reportado</p>
                    <p className="ord-det-problema">
                      {detalleData.problemaReportado}
                    </p>
                  </div>
                )}

                {/* Detalles */}
                {detalleData.detalles?.length > 0 && (
                  <div className="ord-det-section">
                    <p className="ord-det-title">Servicios / Productos</p>
                    {detalleData.detalles.map((d, i) => (
                      <div key={i} className="ord-det-item">
                        <div className="ord-det-item-nombre">
                          <span className={`ord-tipo-badge ${d.tipo}`}>
                            {d.tipo === "servicio" ? "SVC" : "PRD"}
                          </span>
                          {d.nombre}
                        </div>
                        <div className="ord-det-item-precio">
                          {d.cantidad}x $
                          {Number(d.precio).toLocaleString("es-CO")}
                        </div>
                      </div>
                    ))}
                    <div className="ord-det-total">
                      <span>Total</span>
                      <strong>
                        $
                        {Number(detalleData.totalDetalles).toLocaleString(
                          "es-CO",
                        )}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Costos */}
                {(detalleData.costoEstimado || detalleData.costoFinal) && (
                  <div className="ord-det-section">
                    <p className="ord-det-title">Costos</p>
                    {detalleData.costoEstimado && (
                      <div className="ord-costo-row">
                        <span>Estimado</span>
                        <span>
                          $
                          {Number(detalleData.costoEstimado).toLocaleString(
                            "es-CO",
                          )}
                        </span>
                      </div>
                    )}
                    {detalleData.costoFinal && (
                      <div className="ord-costo-row final">
                        <span>Final</span>
                        <strong>
                          $
                          {Number(detalleData.costoFinal).toLocaleString(
                            "es-CO",
                          )}
                        </strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Observaciones */}
                {detalleData.observaciones?.length > 0 && (
                  <div className="ord-det-section">
                    <p className="ord-det-title">Observaciones</p>
                    {detalleData.observaciones.map((ob, i) => (
                      <div key={i} className="ord-obs-card">
                        <div className="ord-obs-top">
                          <span className="ord-obs-mec">{ob.mecanico}</span>
                          <span className="ord-obs-fecha">{ob.fecha}</span>
                        </div>
                        <p className="ord-obs-texto">{ob.texto}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-3)",
                  padding: "2rem",
                  fontSize: ".85rem",
                }}
              >
                Cargando detalle...
              </p>
            )}
          </div>

          <div className="ord-detalle-footer">
            <button
              className="btn-secondary ord-w-full"
              onClick={(e) => abrirAsignarMec(detalle, e)}
            >
              <i className="bi bi-person-badge me-1" />
              Asignar mecánico
            </button>
            <button
              className="ord-w-full ord-estado-full"
              onClick={(e) => abrirCambiarEstado(detalle, e)}
            >
              <i className="bi bi-arrow-repeat me-1" />
              Cambiar estado
            </button>
            {detalle.tipo === "cita" && detalle.estado !== "cancelada" && (
              <button
                className="btn-primary ord-w-full"
                onClick={(e) => convertir(detalle.id, e)}
              >
                <i className="bi bi-arrow-right-circle me-1" />
                Convertir a orden
              </button>
            )}
          </div>
        </aside>
      )}

      {/* ══ MODAL CREAR/EDITAR ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div
            className="modal-card modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <i className="bi bi-plus-circle me-2" />
                {editingId ? "Editar" : "Nueva"}
                {form.tipo === "cita" ? " Cita" : " Orden"}
              </h2>
              <div
                style={{ display: "flex", gap: ".5rem", alignItems: "center" }}
              >
                {/* Toggle tipo */}
                <div className="ord-tipo-toggle">
                  {["cita", "orden"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`ord-tipo-btn ${form.tipo === t ? "active" : ""}`}
                      onClick={() => f("tipo", t)}
                    >
                      {t === "cita" ? "📅 Cita" : "🔧 Orden"}
                    </button>
                  ))}
                </div>
                <button className="modal-close" onClick={cerrarModal}>
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert-error">
                  <i className="bi bi-exclamation-triangle me-1" />
                  {error}
                </div>
              )}

              {/* ── Fila 1: Cliente + Vehículo (igual para cita y orden) ── */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Cliente *</label>
                  <select
                    value={form.idCliente}
                    onChange={(e) => handleClienteChange(e.target.value)}
                  >
                    <option value="">— Selecciona cliente —</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Vehículo *</label>
                  <select
                    value={form.idVehiculo}
                    onChange={(e) => f("idVehiculo", e.target.value)}
                    disabled={!form.idCliente}
                  >
                    <option value="">
                      {!form.idCliente ? "— Primero elige cliente —" : "— Selecciona vehículo —"}
                    </option>
                    {vehiculosCli.map((v) => (
                      <option key={v.id} value={String(v.id)}>
                        {v.marca} {v.modelo} — {v.placa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Problema (igual para ambos) ── */}
              <div className="form-group" style={{ marginTop: ".75rem" }}>
                <label>Problema reportado</label>
                <textarea
                  rows={2}
                  className="ord-textarea"
                  placeholder="Ej: El vehículo presenta ruido al frenar..."
                  value={form.problemaReportado}
                  onChange={(e) => f("problemaReportado", e.target.value)}
                />
              </div>

              {/* ── ORDEN: solo prioridad visual + mecánico ── */}
              {form.tipo === "orden" && (
                <>
                  <div className="form-group" style={{ marginTop: ".75rem" }}>
                    <label>Prioridad</label>
                    <div className="ord-pri-btns">
                      {PRIORIDADES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`ord-pri-btn ${form.prioridad === p ? "active" : ""}`}
                          style={form.prioridad === p ? {
                            background: PRI_CFG[p].bg,
                            color: PRI_CFG[p].color,
                            borderColor: PRI_CFG[p].color,
                          } : {}}
                          onClick={() => f("prioridad", p)}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: ".75rem" }}>
                    <label>Mecánico (opcional)</label>
                    <select
                      value={form.idMecanico}
                      onChange={(e) => f("idMecanico", e.target.value)}
                    >
                      <option value="">— Sin asignar —</option>
                      {mecanicos.map((m) => (
                        <option key={m.id} value={String(m.id)}>
                          {m.nombre} ({m.especialidad})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* ── CITA: fecha, hora, prioridad, mecánico, detalles, costo ── */}
              {form.tipo === "cita" && (
                <>
                  <div className="form-grid-2" style={{ marginTop: ".75rem" }}>
                    <div className="form-group">
                      <label>Fecha *</label>
                      <input
                        type="date"
                        value={form.fechaProgramada}
                        min={getFechaMin()}
                        max={getFechaMax("cita")}
                        onChange={(e) => f("fechaProgramada", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Hora (cada 30 min) *</label>
                      <select
                        value={form.hora}
                        onChange={(e) => f("hora", e.target.value)}
                      >
                        <option value="">— Selecciona hora —</option>
                        {generarSlotsHora().map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Prioridad</label>
                      <select
                        value={form.prioridad}
                        onChange={(e) => f("prioridad", e.target.value)}
                      >
                        {PRIORIDADES.map((p) => (
                          <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Mecánico (opcional)</label>
                      <select
                        value={form.idMecanico}
                        onChange={(e) => f("idMecanico", e.target.value)}
                      >
                        <option value="">— Sin asignar —</option>
                        {mecanicos.map((m) => (
                          <option key={m.id} value={String(m.id)}>
                            {m.nombre} ({m.especialidad})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="ord-form-section" style={{ marginTop: ".75rem" }}>
                    <div className="ord-form-label" style={{ justifyContent: "space-between" }}>
                      <span><i className="bi bi-list-check me-1" />Servicios y productos</span>
                      <button type="button" className="ord-add-det" onClick={addDetalle}>
                        <i className="bi bi-plus-lg me-1" /> Agregar
                      </button>
                    </div>
                    {detallesForm.length === 0 ? (
                      <p className="ord-empty-det">Sin detalles. Puedes agregarlos ahora o después.</p>
                    ) : (
                      detallesForm.map((d, i) => (
                        <div key={i} className="ord-det-form-row">
                          <select
                            className="ord-det-tipo"
                            value={d.tipo}
                            onChange={(e) => updateDetalle(i, "tipo", e.target.value)}
                          >
                            <option value="servicio">Servicio</option>
                            <option value="producto">Producto</option>
                          </select>
                          <select
                            className="ord-det-item"
                            value={d.idItem}
                            onChange={(e) => handleItemChange(i, e.target.value, d.tipo)}
                          >
                            <option value="">— Selecciona —</option>
                            {(d.tipo === "servicio" ? servicios : productos).map((x) => (
                              <option key={x.id} value={x.id}>{x.nombre}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="ord-det-cant"
                            min="1"
                            value={d.cantidad}
                            placeholder="Cant."
                            disabled={d.tipo === "servicio"}
                            onChange={(e) => updateDetalle(i, "cantidad", e.target.value)}
                          />
                          <input
                            type="number"
                            className="ord-det-precio"
                            min="0"
                            value={d.precio}
                            placeholder="Precio"
                            onChange={(e) => updateDetalle(i, "precio", e.target.value)}
                          />
                          <button type="button" className="btn-icon delete" onClick={() => removeDetalle(i)}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="form-group" style={{ maxWidth: "200px", marginTop: ".75rem" }}>
                    <label>Costo estimado</label>
                    <div className="prd-precio-input">
                      <span>$</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form.costoEstimado}
                        onChange={(e) => f("costoEstimado", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
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
                    <i className="bi bi-check-lg me-1" />
                    {editingId ? "Guardar cambios" : "Crear"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL ASIGNAR MECÁNICO CON CALENDARIO ══ */}
      {showMec && (
        <ModalAsignarMecanico
          mecanicos={mecanicos}
          mecForm={mecForm}
          setMecForm={setMecForm}
          onClose={() => setShowMec(false)}
          onGuardar={guardarMecanico}
          ordenService={ordenService}
        />
      )}

      {/* ══ MODAL CAMBIAR ESTADO ══ */}
      {showEstado && (
        <div className="modal-overlay" onClick={() => setShowEstado(false)}>
          <div
            className="modal-card modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <i className="bi bi-arrow-repeat me-2" />
                Cambiar Estado
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowEstado(false)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              <div className="ord-estados-grid">
                {(estadoTarget?.tipo === "cita"
                  ? ESTADOS_CITA
                  : ESTADOS_ORDEN
                ).map((est) => (
                  <button
                    key={est}
                    type="button"
                    className={`ord-estado-option ${estadoForm === est ? "selected" : ""}`}
                    style={{
                      background: ESTADO_CFG[est]?.bg,
                      color: ESTADO_CFG[est]?.color,
                      borderColor:
                        estadoForm === est
                          ? ESTADO_CFG[est]?.color
                          : "transparent",
                    }}
                    onClick={() => setEstadoForm(est)}
                  >
                    {ESTADO_CFG[est]?.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowEstado(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={guardarEstado}>
                <i className="bi bi-check-lg me-1" /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}