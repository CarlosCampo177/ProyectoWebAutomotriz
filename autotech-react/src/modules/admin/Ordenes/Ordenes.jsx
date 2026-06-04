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
const ESTADOS_CITA  = ["pendiente", "confirmada", "cancelada"];
const ESTADOS_ORDEN = ["pendiente", "confirmada", "en_proceso", "terminada", "facturada", "cancelada"];
const PRIORIDADES   = ["baja", "normal", "alta", "urgente"];

const ESTADO_CFG = {
  pendiente:  { label: "Pendiente",  color: "#b45309", bg: "#fef3c7" },
  confirmada: { label: "Confirmada", color: "#1d4ed8", bg: "#dbeafe" },
  en_proceso: { label: "En proceso", color: "#6d28d9", bg: "#ede9fe" },
  terminada:  { label: "Terminada",  color: "#15803d", bg: "#dcfce7" },
  facturada:  { label: "Facturada",  color: "#0369a1", bg: "#e0f2fe" },
  cancelada:  { label: "Cancelada",  color: "#b91c1c", bg: "#fee2e2" },
};

const PRI_CFG = {
  baja:    { color: "#6b7280", bg: "#f3f4f6" },
  normal:  { color: "#1d4ed8", bg: "#dbeafe" },
  alta:    { color: "#b45309", bg: "#fef3c7" },
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

/* ══════════════════════════════════════════════════
   MODAL ASIGNAR MECÁNICO
══════════════════════════════════════════════════ */
function ModalAsignarMecanico({ mecanicos, mecForm, setMecForm, onClose, onGuardar, ordenService }) {
  const [selMec, setSelMec]           = useState(mecForm || "");
  const [agenda, setAgenda]           = useState([]);
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
      setAgenda((data || []).filter((e) => String(e.idMecanico) === String(idMec)));
    } catch {
      setAgenda([]);
    } finally {
      setLoadingAgenda(false);
    }
  };

  const confirmar = () => { onGuardar(selMec); };
  const mecSeleccionado = mecanicos.find((m) => String(m.id) === String(selMec));

  return (
    <div className="mam-overlay" onClick={onClose}>
      <div className="mam-lateral" onClick={(e) => e.stopPropagation()}>
        <div className="mam-header">
          <div>
            <h2 className="mam-title"><i className="bi bi-person-badge me-2" />Asignar Mecánico</h2>
            <p className="mam-subtitle">Selecciona quién atenderá esta orden</p>
          </div>
          <button className="ord-modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="mam-drawer-body">
          <div className="mam-section-label"><i className="bi bi-people" /> Mecánicos disponibles</div>
          <div className="mam-lista-drawer">
            {mecanicos.map((m) => (
              <button
                key={m.id}
                className={`mam-mec-card ${String(selMec) === String(m.id) ? "selected" : ""}`}
                onClick={() => setSelMec(String(m.id))}
              >
                <div className="mam-avatar">
                  {/* PROTECCIÓN AÑADIDA AQUÍ */}
                  {m.nombre?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "M"}
                </div>
                <div className="mam-mec-info">
                  <div className="mam-mec-nombre">{m.nombre || "Sin nombre"}</div>
                  <div className="mam-mec-esp">{m.especialidad}</div>
                </div>
                <div className="mam-mec-right">
                  <span className="mam-mec-activas">{m.ordenesActivas ?? 0} activas</span>
                  {String(selMec) === String(m.id) && <i className="bi bi-check-circle-fill mam-check" />}
                </div>
              </button>
            ))}
          </div>

          <div className="mam-section-label" style={{ marginTop: "1.25rem" }}>
            <i className="bi bi-calendar-day" />
            {/* PROTECCIÓN AÑADIDA AQUÍ */}
            {mecSeleccionado ? <>Agenda hoy — <strong>{mecSeleccionado.nombre?.split(" ")[0]}</strong></> : "Agenda del día"}
          </div>

          {!selMec ? (
            <div className="mam-cal-empty-drawer">
              <i className="bi bi-person-plus" />
              <p>Selecciona un mecánico para ver su disponibilidad</p>
            </div>
          ) : loadingAgenda ? (
            <div className="mam-cal-loading">
              <i className="bi bi-arrow-repeat spin" /> Cargando agenda...
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
                          <div key={ev.id} className={`mam-evento ${ev.tipo}`}>
                            <i className={`bi bi-${ev.tipo === "cita" ? "calendar-event" : "wrench"} me-1`} />
                            {/* PROTECCIÓN AÑADIDA AQUÍ */}
                            {(ev.cliente || "Cliente").split(" ")[0]} — {ev.servicio}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="ord-modal-footer">
            <button className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" onClick={confirmar} disabled={!selMec}>
              <i className="bi bi-check-lg me-1" />
              {/* PROTECCIÓN AÑADIDA AQUÍ */}
              Asignar{mecSeleccionado ? ` a ${mecSeleccionado.nombre?.split(" ")[0]}` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════ */
export default function Ordenes() {
  const [tab,        setTab]        = useState("citas");
  const [citas,      setCitas]      = useState([]);
  const [ordenes,    setOrdenes]    = useState([]);
  const [detalle,    setDetalle]    = useState(null);
  const [detalleData, setDetalleData] = useState(null);
  const [loadingDet, setLoadingDet] = useState(false);

  const [showModal,  setShowModal]  = useState(false);
  const [showMec,    setShowMec]    = useState(false);
  const [showEstado, setShowEstado] = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [editingId,  setEditingId]  = useState(null);
  const [mecTarget,  setMecTarget]  = useState(null);
  const [estadoTarget, setEstadoTarget] = useState(null);
  const [mecForm,    setMecForm]    = useState("");
  const [estadoForm, setEstadoForm] = useState("");

  const [clientes,     setClientes]     = useState([]);
  const [vehiculosCli, setVehiculosCli] = useState([]);
  const [mecanicos,    setMecanicos]    = useState([]);
  const [servicios,    setServicios]    = useState([]);
  const [productos,    setProductos]    = useState([]);
  const [detallesForm, setDetallesForm] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [errores, setErrores] = useState({});
  const [busqueda, setBusqueda] = useState("");

  // 1. EFECTO INICIAL + POLLING (REFRESCO SILENCIOSO)
  useEffect(() => {
    cargarTodo();
    cargarSelectores();
    
    // Auto-refresco cada 60 segundos
    const intervalo = setInterval(() => {
      cargarTodo(true); // true = modo silencioso (no muestra el loading de pantalla completa)
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  /* ── Carga y auto-cancelación ── */
  const cargarTodo = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [c, o] = await Promise.all([
        ordenService.getAll({ tipo: "cita" }),
        ordenService.getAll({ tipo: "orden" }),
      ]);

      const ahora = new Date();
      // Auto cancelar citas vencidas
      const citasActualizadas = await Promise.all(
        (c || []).map(async (cita) => {
          if (cita.estado === "pendiente" || cita.estado === "confirmada") {
            if (cita.fechaProgramada && cita.hora) {
              const fechaCita = new Date(`${cita.fechaProgramada}T${cita.hora}`);
              if (fechaCita < ahora) {
                try {
                  await ordenService.cambiarEstado(cita.id, { estado: "cancelada" });
                  return { ...cita, estado: "cancelada" };
                } catch (err) {
                  console.error("Error auto-cancelando", err);
                }
              }
            }
          }
          return cita;
        })
      );

      setCitas(citasActualizadas);
      setOrdenes(o || []);
    } catch {
      if (!silent) { setCitas([]); setOrdenes([]); }
    } finally {
      if (!silent) setLoading(false);
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

  const abrirDetalle = async (item) => {
    if (detalle?.id === item.id) { setDetalle(null); setDetalleData(null); return; }
    setDetalle(item);
    setDetalleData(null);
    try {
      setLoadingDet(true);
      const data = await ordenService.getById(item.id);
      setDetalleData(data);
    } catch {} finally { setLoadingDet(false); }
  };

  const handleClienteChange = async (idCliente) => {
    setForm((p) => ({ ...p, idCliente, idVehiculo: "" }));
    setVehiculosCli([]);
    limpiarError("idCliente");
    if (!idCliente) return;
    try {
      const data = await vehiculoService.getAll();
      setVehiculosCli((data || []).filter((v) => String(v.idCliente) === String(idCliente)));
    } catch {}
  };

  const limpiarError = (campo) =>
    setErrores((prev) => { const n = { ...prev }; delete n[campo]; return n; });

  const validar = () => {
    const errs = {};
    if (!form.idCliente)             errs.idCliente   = "Selecciona un cliente.";
    if (!form.idVehiculo)            errs.idVehiculo  = "Selecciona un vehículo.";
    
    if (form.tipo === "cita") {
      if (!form.fechaProgramada)     errs.fechaProgramada = "La fecha es obligatoria.";
      if (!form.hora)                errs.hora        = "La hora es obligatoria.";
      
      // Validación: que la hora seleccionada siga siendo válida/disponible
      if (form.fechaProgramada && form.hora) {
        const slotsDisponibles = generarSlotsDisponibles();
        const horaSigueDisponible = slotsDisponibles.find(s => s.value === form.hora);
        if (!horaSigueDisponible) {
          errs.hora = "Esta hora ya pasó o el mecánico acaba de ser ocupado. Selecciona otra.";
        }
      }
    }
    detallesForm.forEach((d, i) => {
      if (!d.idItem) errs[`det_${i}`] = "Selecciona un ítem.";
      if (Number(d.precio) <= 0) errs[`det_precio_${i}`] = "El precio debe ser mayor a 0.";
    });
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const abrirCrear = (tipo = tab === "citas" ? "cita" : "orden") => {
    setForm({ ...EMPTY_FORM, tipo });
    setDetallesForm([]);
    setEditingId(null);
    setErrores({});
    setShowModal(true);
  };

  const cerrarModal = () => { setShowModal(false); setErrores({}); };

  const guardar = async () => {
    if (!validar()) return;
    try {
      setSaving(true);
      const payload = {
        tipo:              form.tipo,
        idCliente:         Number(form.idCliente),
        idVehiculo:        Number(form.idVehiculo),
        idMecanico:        form.idMecanico ? Number(form.idMecanico) : null,
        fechaProgramada:   form.tipo === "orden"
          ? new Date().toISOString().split("T")[0] : form.fechaProgramada || null,
        hora:              form.tipo === "orden"
          ? new Date().toTimeString().slice(0, 5) : form.hora || null,
        prioridad:         form.prioridad,
        problemaReportado: form.problemaReportado || null,
        costoEstimado:     form.costoEstimado ? Number(form.costoEstimado) : null,
        detalles: detallesForm.map((d) => ({
          idServicio:  d.tipo === "servicio" ? Number(d.idItem) : null,
          idProducto:  d.tipo === "producto" ? Number(d.idItem) : null,
          cantidad:    Number(d.cantidad),
          precio:      Number(d.precio),
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
      setErrores({ general: err.data || "Error al guardar. Intenta de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  const addDetalle = () =>
    setDetallesForm((p) => [...p, { tipo: "servicio", idItem: "", cantidad: 1, precio: 0, descripcion: "" }]);
  const updateDetalle = (i, key, val) =>
    setDetallesForm((p) => p.map((d, idx) => (idx === i ? { ...d, [key]: val } : d)));
  const removeDetalle = (i) =>
    setDetallesForm((p) => p.filter((_, idx) => idx !== i));

  const handleItemChange = (i, idItem, tipo) => {
    const lista = tipo === "servicio" ? servicios : productos;
    const item  = lista.find((x) => String(x.id) === String(idItem));
    updateDetalle(i, "idItem", idItem);
    if (item) updateDetalle(i, "precio", tipo === "servicio" ? item.precioBase : item.precio);
    limpiarError(`det_${i}`);
  };

  const abrirAsignarMec = (item, e) => {
    e?.stopPropagation();
    setMecTarget(item);
    setMecForm(item.idMecanico ? String(item.idMecanico) : "");
    setShowMec(true);
  };

  const guardarMecanico = async (idMecanicoSeleccionado) => {
    const mecFinal = idMecanicoSeleccionado || mecForm;
    if (!mecFinal) return;
    try {
      await ordenService.asignarMecanico(mecTarget.id, { idMecanico: Number(mecFinal) });
      setShowMec(false);
      cargarTodo(true);
      if (detalle?.id === mecTarget.id) {
        const data = await ordenService.getById(mecTarget.id);
        setDetalleData(data);
      }
    } catch (err) { alert(err.data || "Error al asignar mecánico."); }
  };

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
      cargarTodo(true);
      if (detalle?.id === estadoTarget.id)
        setDetalle((prev) => ({ ...prev, estado: estadoForm }));
    } catch (err) { alert(err.data || "Error al cambiar estado."); }
  };

  const getFechaMin = () => new Date().toISOString().split("T")[0];
  const getFechaMax = (tipo) => {
    const d = new Date();
    d.setDate(d.getDate() + (tipo === "cita" ? 30 : 90));
    return d.toISOString().split("T")[0];
  };

  // 2. FUNCIÓN DE HORAS DISPONIBLES (Filtra por tiempo y mecánico)
  const generarSlotsDisponibles = () => {
    const slots = [];
    const ahora = new Date();
    const fechaSel = form.fechaProgramada || "";
    
    // Validar si el día seleccionado es el día de hoy
    const esHoy = fechaSel === ahora.toISOString().split("T")[0];
    
    // Obtener la hora actual en formato decimal (ej: 14:30 = 14.5)
    const horaActualDecimal = ahora.getHours() + (ahora.getMinutes() / 60);

    // Obtener horas que el mecánico ya tiene apartadas ese día
    const horasOcupadasMecanico = citas
      .filter(c => 
        c.fechaProgramada === fechaSel && 
        String(c.idMecanico) === String(form.idMecanico) &&
        (c.estado === "pendiente" || c.estado === "confirmada" || c.estado === "en_proceso")
      )
      .map(c => c.hora);

    for (let h = 8; h < 18; h++) {
      ["00", "30"].forEach((m) => {
        const hora24 = `${String(h).padStart(2, "0")}:${m}`;
        const horaDecimal = h + (m === "30" ? 0.5 : 0);

        // Filtro 1: Si es hoy y la hora ya pasó (o faltan minutos), no la mostramos
        if (esHoy && horaDecimal <= horaActualDecimal) return;

        // Filtro 2: Si elegiste un mecánico y él ya tiene esa hora, no la mostramos
        if (form.idMecanico && horasOcupadasMecanico.includes(hora24)) return;

        // Si pasa los filtros, la agregamos al select
        const hora12 = h < 12
          ? `${h === 0 ? 12 : h}:${m} AM`
          : `${h === 12 ? 12 : h - 12}:${m} PM`;
        slots.push({ value: hora24, label: hora12 });
      });
    }
    return slots;
  };

  const f = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    limpiarError(key);
  };

  const listaActual = tab === "citas" ? citas : ordenes;
  const filtrados = listaActual.filter((o) => {
    const q = busqueda.toLowerCase();
    return (
      (o.cliente  || "").toLowerCase().includes(q) ||
      (o.vehiculo || "").toLowerCase().includes(q) ||
      (o.placa    || "").toLowerCase().includes(q) ||
      (o.mecanico || "").toLowerCase().includes(q) ||
      String(o.id).includes(q)
    );
  });

  return (
    <div className={`ord-page ${detalle ? "ord-has-detalle" : ""}`}>
      <div className="ord-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-calendar-check" /> Órdenes y Citas
            </h1>
            <p className="page-subtitle">Gestiona citas y órdenes de servicio del taller</p>
          </div>
          
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* Botón Refresco manual */}
            <button className="btn-secondary" onClick={() => cargarTodo(false)} disabled={loading}>
              <i className={`bi bi-arrow-clockwise ${loading ? "spin" : ""}`} /> 
              {loading ? " Actualizando..." : " Refrescar"}
            </button>
            {tab !== "calendario" && (
              <button className="btn-primary" onClick={() => abrirCrear()}>
                <i className="bi bi-plus-lg" />
                {tab === "citas" ? "Nueva Cita" : "Nueva Orden"}
              </button>
            )}
          </div>
        </div>

        <div className="ord-main-tabs">
          {[
            { key: "citas",      icon: "bi-calendar-event", label: "Citas",      count: citas.length },
            { key: "ordenes",    icon: "bi-clipboard-check", label: "Órdenes",   count: ordenes.length },
            { key: "calendario", icon: "bi-calendar3",       label: "Calendario", count: null },
          ].map((t) => (
            <button
              key={t.key}
              className={`ord-main-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => { setTab(t.key); setDetalle(null); setBusqueda(""); }}
            >
              <i className={`bi ${t.icon} me-1`} />
              {t.label}
              {t.count !== null && <span className="ord-tab-badge">{t.count}</span>}
            </button>
          ))}
        </div>

        {tab === "calendario" && <Calendario />}

        {tab !== "calendario" && (
          <>
            <div className="ord-toolbar">
              <div className="search-bar">
                <i className="bi bi-search" />
                <input
                  placeholder="Buscar por cliente, vehículo o #orden..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                  <button className="ord-clear" onClick={() => setBusqueda("")}><i className="bi bi-x" /></button>
                )}
              </div>
              <span className="ord-count">
                {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
              </span>
            </div>

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
                          {busqueda ? "Sin resultados." : tab === "citas" ? "No hay citas registradas." : "No hay órdenes registradas."}
                        </td>
                      </tr>
                    ) : filtrados.map((o) => (
                      <tr
                        key={o.id}
                        className={detalle?.id === o.id ? "ord-row-active" : ""}
                        onClick={() => abrirDetalle(o)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="ord-td-id">
                          <span className="ord-badge-id">#{String(o.id).padStart(4, "0")}</span>
                        </td>
                        <td>
                          <div className="ord-nombre">{o.cliente}</div>
                          <div className="ord-sub">
                            <i className="bi bi-car-front me-1" />
                            {o.placa} — {o.vehiculo.split(" ").slice(0, 2).join(" ")}
                          </div>
                        </td>
                        <td className="ord-servicio">{o.servicio}</td>
                        <td>
                          {o.mecanico ? (
                            <div className="ord-mec-cell">
                              <div className="ord-mec-avatar">
                                {o.mecanico.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                              </div>
                              <span className="ord-sub">{o.mecanico}</span>
                            </div>
                          ) : (
                            <span className="ord-sin-mec">Sin asignar</span>
                          )}
                        </td>
                        <td className="ord-fecha">
                          {o.fechaProgramada || o.fechaCreacion}
                          {o.hora && <div className="ord-sub">{o.hora}</div>}
                        </td>
                        <td>
                          <span className="ord-badge-pri" style={{ background: PRI_CFG[o.prioridad]?.bg, color: PRI_CFG[o.prioridad]?.color }}>
                            {o.prioridad}
                          </span>
                        </td>
                        <td>
                          <span className="ord-badge-estado" style={{ background: ESTADO_CFG[o.estado]?.bg, color: ESTADO_CFG[o.estado]?.color }}>
                            {ESTADO_CFG[o.estado]?.label}
                          </span>
                        </td>
                        <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                          <button className="btn-icon edit" onClick={(e) => abrirAsignarMec(o, e)} title="Asignar mecánico">
                            <i className="bi bi-person-badge" />
                          </button>
                          <button className="btn-icon ord-btn-estado" onClick={(e) => abrirCambiarEstado(o, e)} title="Cambiar estado">
                            <i className="bi bi-arrow-repeat" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── PANEL LATERAL DETALLE ── */}
      {detalle && (
        <aside className="ord-detalle">
          <div className="ord-detalle-header">
            <div>
              <span className="ord-badge-id" style={{ fontSize: ".85rem" }}>#{String(detalle.id).padStart(4, "0")}</span>
              <div style={{ marginTop: ".35rem" }}>
                <span className="ord-badge-estado" style={{ background: ESTADO_CFG[detalle.estado]?.bg, color: ESTADO_CFG[detalle.estado]?.color }}>
                  {ESTADO_CFG[detalle.estado]?.label}
                </span>
              </div>
            </div>
            <button className="modal-close" onClick={() => { setDetalle(null); setDetalleData(null); }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="ord-detalle-body">
            {loadingDet ? (
              <div className="loading-state" style={{ padding: "2rem" }}><i className="bi bi-arrow-repeat spin" /></div>
            ) : detalleData ? (
              <>
                <div className="ord-det-section">
                  <p className="ord-det-title">Cliente</p>
                  <div className="ord-det-row"><i className="bi bi-person" /><span>{detalleData.cliente?.nombre}</span></div>
                  <div className="ord-det-row"><i className="bi bi-envelope" /><span>{detalleData.cliente?.email}</span></div>
                </div>
                <div className="ord-det-section">
                  <p className="ord-det-title">Vehículo</p>
                  <div className="ord-det-row">
                    <i className="bi bi-car-front" /><span>{detalleData.vehiculo?.nombre} {detalleData.vehiculo?.anio}</span>
                  </div>
                  <div className="ord-det-row">
                    <i className="bi bi-upc" /><span className="ord-placa-badge">{detalleData.vehiculo?.placa}</span>
                  </div>
                </div>
                <div className="ord-det-section">
                  <p className="ord-det-title">Mecánico</p>
                  {detalleData.mecanico ? (
                    <div className="ord-det-row">
                      <i className="bi bi-person-badge" /><span>{detalleData.mecanico.nombre}</span>
                    </div>
                  ) : (
                    <button className="ord-asignar-btn" onClick={(e) => abrirAsignarMec(detalle, e)}>
                      <i className="bi bi-person-plus me-1" /> Asignar mecánico
                    </button>
                  )}
                </div>
                {detalleData.problemaReportado && (
                  <div className="ord-det-section">
                    <p className="ord-det-title">Problema reportado</p>
                    <p className="ord-det-problema">{detalleData.problemaReportado}</p>
                  </div>
                )}
                {detalleData.detalles?.length > 0 && (
                  <div className="ord-det-section">
                    <p className="ord-det-title">Servicios / Productos</p>
                    {detalleData.detalles.map((d, i) => (
                      <div key={i} className="ord-det-item">
                        <div className="ord-det-item-nombre">
                          <span className={`ord-tipo-badge ${d.tipo}`}>{d.tipo === "servicio" ? "SVC" : "PRD"}</span>
                          {d.nombre}
                        </div>
                        <div className="ord-det-item-precio">
                          {d.cantidad}x ${Number(d.precio).toLocaleString("es-CO")}
                        </div>
                      </div>
                    ))}
                    <div className="ord-det-total">
                      <span>Total</span><strong>${Number(detalleData.totalDetalles).toLocaleString("es-CO")}</strong>
                    </div>
                  </div>
                )}
                {(detalleData.costoEstimado || detalleData.costoFinal) && (
                  <div className="ord-det-section">
                    <p className="ord-det-title">Costos</p>
                    {detalleData.costoEstimado && (
                      <div className="ord-costo-row">
                        <span>Estimado</span><span>${Number(detalleData.costoEstimado).toLocaleString("es-CO")}</span>
                      </div>
                    )}
                    {detalleData.costoFinal && (
                      <div className="ord-costo-row final">
                        <span>Final</span><strong>${Number(detalleData.costoFinal).toLocaleString("es-CO")}</strong>
                      </div>
                    )}
                  </div>
                )}
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
              <p style={{ textAlign: "center", color: "var(--text-3)", padding: "2rem", fontSize: ".85rem" }}>Cargando detalle...</p>
            )}
          </div>

          <div className="ord-detalle-footer">
            <button className="btn-secondary ord-w-full" onClick={(e) => abrirAsignarMec(detalle, e)}>
              <i className="bi bi-person-badge me-1" /> Asignar mecánico
            </button>
            <button className="ord-w-full ord-estado-full" onClick={(e) => abrirCambiarEstado(detalle, e)}>
              <i className="bi bi-arrow-repeat me-1" /> Cambiar estado
            </button>
          </div>
        </aside>
      )}

      {/* ══ DRAWER CREAR / EDITAR ══ */}
      {showModal && (
        <div className="ord-modal-overlay" onClick={cerrarModal}>
          <div className="ord-modal-lateral" onClick={(e) => e.stopPropagation()}>
            <div className="ord-modal-header">
              <div className="ord-modal-header-left">
                <h2 className="ord-modal-title">
                  <i className={`bi ${editingId ? "bi-pencil" : "bi-plus-lg"} me-2`} />
                  {editingId ? "Editar" : "Nueva"} {form.tipo === "cita" ? "Cita" : "Orden"}
                </h2>
                <div className="ord-tipo-toggle">
                  {["cita", "orden"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`ord-tipo-btn ${form.tipo === t ? "active" : ""}`}
                      onClick={() => { f("tipo", t); setDetallesForm([]); }}
                    >
                      {t === "cita" ? "📅 Cita" : "🔧 Orden"}
                    </button>
                  ))}
                </div>
              </div>
              <button className="ord-modal-close" onClick={cerrarModal}><i className="bi bi-x-lg" /></button>
            </div>

            <div className="ord-modal-body">
              {errores.general && (
                <div className="alert-error" style={{ marginBottom: "1.25rem" }}>
                  <i className="bi bi-exclamation-triangle me-1" />{errores.general}
                </div>
              )}

              <div className="ord-form-section">
                <div className="ord-form-label"><i className="bi bi-person" /> Propietario</div>
                <div className="form-grid-2">
                  <div className={`form-group ${errores.idCliente ? "has-error" : ""}`}>
                    <label>Cliente *</label>
                    <select value={form.idCliente} onChange={(e) => handleClienteChange(e.target.value)}>
                      <option value="">— Selecciona cliente —</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                      ))}
                    </select>
                    {errores.idCliente && <span className="field-error">{errores.idCliente}</span>}
                  </div>
                  <div className={`form-group ${errores.idVehiculo ? "has-error" : ""}`}>
                    <label>Vehículo *</label>
                    <select value={form.idVehiculo} onChange={(e) => { f("idVehiculo", e.target.value); }} disabled={!form.idCliente}>
                      <option value="">{!form.idCliente ? "— Elige cliente primero —" : "— Selecciona vehículo —"}</option>
                      {vehiculosCli.map((v) => (
                        <option key={v.id} value={String(v.id)}>{v.marca} {v.modelo} — {v.placa}</option>
                      ))}
                    </select>
                    {errores.idVehiculo && <span className="field-error">{errores.idVehiculo}</span>}
                  </div>
                </div>
              </div>

              <div className="ord-form-section">
                <div className="ord-form-label"><i className="bi bi-chat-text" /> Problema reportado (opcional)</div>
                <div className="form-group">
                  <textarea
                    rows={3} className="ord-textarea"
                    placeholder="Ej: El vehículo presenta ruido al frenar en frío..."
                    value={form.problemaReportado}
                    onChange={(e) => f("problemaReportado", e.target.value)}
                  />
                </div>
              </div>

              {form.tipo === "orden" && (
                <div className="ord-form-section">
                  <div className="ord-form-label"><i className="bi bi-sliders" /> Configuración</div>
                  <div className="form-group" style={{ marginBottom: ".75rem" }}>
                    <label>Prioridad</label>
                    <div className="ord-pri-btns">
                      {PRIORIDADES.map((p) => (
                        <button
                          key={p} type="button"
                          className={`ord-pri-btn ${form.prioridad === p ? "active" : ""}`}
                          style={form.prioridad === p ? { background: PRI_CFG[p].bg, color: PRI_CFG[p].color, borderColor: PRI_CFG[p].color } : {}}
                          onClick={() => f("prioridad", p)}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Mecánico (opcional)</label>
                    <select value={form.idMecanico} onChange={(e) => f("idMecanico", e.target.value)}>
                      <option value="">— Sin asignar —</option>
                      {mecanicos.map((m) => (
                        <option key={m.id} value={String(m.id)}>{m.nombre} ({m.especialidad})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {form.tipo === "cita" && (
                <>
                  <div className="ord-form-section">
                    <div className="ord-form-label"><i className="bi bi-calendar3" /> Programación</div>
                    <div className="form-grid-2">
                      
                      <div className={`form-group ${errores.fechaProgramada ? "has-error" : ""}`}>
                        <label>Fecha *</label>
                        <input
                          type="date"
                          value={form.fechaProgramada}
                          min={getFechaMin()}
                          max={getFechaMax("cita")}
                          onChange={(e) => f("fechaProgramada", e.target.value)}
                        />
                        {errores.fechaProgramada && <span className="field-error">{errores.fechaProgramada}</span>}
                      </div>

                      <div className="form-group">
                        <label>Mecánico (opcional)</label>
                        <select value={form.idMecanico} onChange={(e) => f("idMecanico", e.target.value)}>
                          <option value="">— Cualquiera —</option>
                          {mecanicos.map((m) => (
                            <option key={m.id} value={String(m.id)}>{m.nombre} ({m.especialidad})</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className={`form-group ${errores.hora ? "has-error" : ""}`}>
                        <label>Hora disponible *</label>
                        <select value={form.hora} onChange={(e) => f("hora", e.target.value)} disabled={!form.fechaProgramada}>
                          <option value="">{!form.fechaProgramada ? "— Elige fecha primero —" : "— Selecciona hora —"}</option>
                          {generarSlotsDisponibles().map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        {errores.hora && <span className="field-error">{errores.hora}</span>}
                      </div>

                      <div className="form-group">
                        <label>Prioridad</label>
                        <select value={form.prioridad} onChange={(e) => f("prioridad", e.target.value)}>
                          {PRIORIDADES.map((p) => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                          ))}
                        </select>
                      </div>

                    </div>
                  </div>

                  <div className="ord-form-section">
                    <div className="ord-form-label" style={{ justifyContent: "space-between" }}>
                      <span><i className="bi bi-list-check me-1" />Servicios y productos</span>
                      <button type="button" className="ord-add-det" onClick={addDetalle}><i className="bi bi-plus-lg me-1" /> Agregar</button>
                    </div>
                    {detallesForm.length === 0 ? (
                      <p className="ord-empty-det">Sin detalles. Puedes agregarlos ahora o después.</p>
                    ) : (
                      detallesForm.map((d, i) => (
                        <div key={i} className="ord-det-form-row">
                          <select className="ord-det-tipo" value={d.tipo} onChange={(e) => updateDetalle(i, "tipo", e.target.value)}>
                            <option value="servicio">Servicio</option>
                            <option value="producto">Producto</option>
                          </select>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <select
                              className={`ord-det-item-sel ${errores[`det_${i}`] ? "input-error" : ""}`}
                              value={d.idItem} onChange={(e) => handleItemChange(i, e.target.value, d.tipo)}
                            >
                              <option value="">— Selecciona —</option>
                              {(d.tipo === "servicio" ? servicios : productos).map((x) => (
                                <option key={x.id} value={x.id}>{x.nombre}</option>
                              ))}
                            </select>
                            {errores[`det_${i}`] && <span className="field-error">{errores[`det_${i}`]}</span>}
                          </div>
                          <input
                            type="number" className="ord-det-cant" min="1" value={d.cantidad} placeholder="Cant." disabled={d.tipo === "servicio"}
                            onChange={(e) => updateDetalle(i, "cantidad", e.target.value)}
                          />
                          <div>
                            <input
                              type="number" className={`ord-det-precio ${errores[`det_precio_${i}`] ? "input-error" : ""}`}
                              min="0" value={d.precio} placeholder="Precio"
                              onChange={(e) => { updateDetalle(i, "precio", e.target.value); limpiarError(`det_precio_${i}`); }}
                            />
                            {errores[`det_precio_${i}`] && <span className="field-error">{errores[`det_precio_${i}`]}</span>}
                          </div>
                          <button type="button" className="btn-icon delete" onClick={() => removeDetalle(i)}><i className="bi bi-trash" /></button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="ord-form-section">
                    <div className="ord-form-label"><i className="bi bi-cash-coin" /> Costo estimado</div>
                    <div className="form-group" style={{ maxWidth: "200px" }}>
                      <div className="prd-precio-input">
                        <span>$</span>
                        <input
                          type="number" min="0" placeholder="0" value={form.costoEstimado}
                          onChange={(e) => f("costoEstimado", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="ord-modal-footer">
                <button className="btn-secondary" onClick={cerrarModal} disabled={saving}>Cancelar</button>
                <button className="btn-primary" onClick={guardar} disabled={saving}>
                  {saving
                    ? <><i className="bi bi-arrow-repeat spin me-1" />Guardando...</>
                    : <><i className={`bi ${editingId ? "bi-check-lg" : "bi-plus-lg"} me-1`} />
                        {editingId ? "Guardar cambios" : `Crear ${form.tipo === "cita" ? "cita" : "orden"}`}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ══ DRAWER ASIGNAR MECÁNICO ══ */}
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

      {/* ══ DRAWER CAMBIAR ESTADO ══ */}
      {showEstado && (
        <div className="est-overlay" onClick={() => setShowEstado(false)}>
          <div className="est-lateral" onClick={(e) => e.stopPropagation()}>
            <div className="est-header">
              <div>
                <h2 className="est-title"><i className="bi bi-arrow-repeat me-2" />Cambiar Estado</h2>
                <p className="est-subtitle">{estadoTarget?.tipo === "cita" ? "Cita" : "Orden"} <span className="est-id">#{String(estadoTarget?.id || 0).padStart(4, "0")}</span></p>
              </div>
              <button className="ord-modal-close" onClick={() => setShowEstado(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="est-body">
              <div className="est-actual">
                <span className="est-actual-label">Estado actual</span>
                <span className="est-actual-badge" style={{ background: ESTADO_CFG[estadoTarget?.estado]?.bg, color: ESTADO_CFG[estadoTarget?.estado]?.color }}>
                  {ESTADO_CFG[estadoTarget?.estado]?.label}
                </span>
              </div>
              <div className="est-arrow"><i className="bi bi-arrow-down" /><span>Nuevo estado</span></div>
              <div className="est-opciones">
                {(estadoTarget?.tipo === "cita" ? ESTADOS_CITA : ESTADOS_ORDEN).map((est) => (
                  <button
                    key={est} type="button" className={`est-opcion ${estadoForm === est ? "selected" : ""}`}
                    style={{ background: ESTADO_CFG[est]?.bg, color: ESTADO_CFG[est]?.color, borderColor: estadoForm === est ? ESTADO_CFG[est]?.color : "transparent" }}
                    onClick={() => setEstadoForm(est)}
                  >
                    <span>{ESTADO_CFG[est]?.label}</span>
                    {estadoForm === est && <i className="bi bi-check-circle-fill" />}
                  </button>
                ))}
              </div>
              <div className="ord-modal-footer">
                <button className="btn-secondary" onClick={() => setShowEstado(false)}>Cancelar</button>
                <button className="btn-primary" onClick={guardarEstado} disabled={estadoForm === estadoTarget?.estado}>
                  <i className="bi bi-check-lg me-1" /> Confirmar cambio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}