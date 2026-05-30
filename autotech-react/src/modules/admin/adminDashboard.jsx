import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getAdminPerfil,
  getAdminVehiculos,
  getAdminMecanicos,
  getAdminServicios,
  getAdminOrdenes,
  getAdminFacturación,
  getAdminEstadisticas,
} from "../../services/adminService";
import "./adminDashboard.css";

const seccionesValidas = [
  "inicio",
  "clientes",
  "vehiculos",
  "mecanicos",
  "servicios",
  "citas",
  "facturacion",
  "estadisticas",
];

const AdminDashboard = () => {
  const adminId = 1;

  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const rawSection = pathParts[pathParts.length - 1] || "inicio";
  const activeSection = seccionesValidas.includes(rawSection)
    ? rawSection
    : "inicio";

  const [perfil, setPerfil] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    Promise.all([
      getAdminPerfil(adminId),
      getAdminVehiculos(adminId),
      getAdminMecanicos(adminId),
      getAdminServicios(adminId),
      getAdminOrdenes(adminId),
      getAdminFacturación(adminId),
      getAdminEstadisticas(adminId),
    ])
      .then(
        ([
          perfilRes,
          vehiculosRes,
          mecanicosRes,
          serviciosRes,
          ordenesRes,
          facturasRes,
          estadisticasRes,
        ]) => {
          setPerfil(perfilRes);
          setClientes(perfilRes?.clientes || []);
          setVehiculos(vehiculosRes);
          setMecanicos(mecanicosRes);
          setServicios(serviciosRes);
          setCitas(ordenesRes);
          setFacturas(facturasRes);
          setEstadisticas(estadisticasRes);
        },
      )
      .catch(console.error);
  }, [adminId]);

  // ── Renderiza la sección actual ──
  const renderSection = () => {
    switch (activeSection) {
      case "inicio":
        return (
          <div className="seccion active">
            <h6 className="seccion-subtitulo">Panel de inicio</h6>
            {perfil ? (
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="stat-card stat-card--blue">
                    <div className="stat-card-icon">
                      <i className="bi bi-people"></i>
                    </div>
                    <div>
                      <p className="stat-card-label">Clientes</p>
                      <p className="stat-card-num">{clientes.length}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-card stat-card--green">
                    <div className="stat-card-icon">
                      <i className="bi bi-car-front"></i>
                    </div>
                    <div>
                      <p className="stat-card-label">Vehículos</p>
                      <p className="stat-card-num">{vehiculos.length}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-card stat-card--orange">
                    <div className="stat-card-icon">
                      <i className="bi bi-calendar-check"></i>
                    </div>
                    <div>
                      <p className="stat-card-label">Citas pendientes</p>
                      <p className="stat-card-num">
                        {citas.filter((c) => c.estado === "pendiente").length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Cargando...</p>
            )}
          </div>
        );

      case "clientes":
        return (
          <div className="seccion active">
            <div className="seccion-toolbar">
              <h6 className="seccion-subtitulo">
                Lista de clientes registrados
              </h6>
              <button
                className="btn-admin-primary"
                onClick={() => alert("Agregar cliente")}
              >
                <i className="bi bi-person-plus"></i> Nuevo cliente
              </button>
            </div>
            <div className="buscador-wrap mb-3">
              <i className="bi bi-search buscador-icon"></i>
              <input
                type="text"
                className="buscador-input"
                placeholder="Buscar por nombre o correo..."
              />
            </div>
            <div className="panel">
              <table className="tabla-admin">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Vehículos</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c, i) => (
                    <tr key={c.id || i}>
                      <td>{i + 1}</td>
                      <td>{c.nombre}</td>
                      <td>{c.correo}</td>
                      <td>{c.telefono}</td>
                      <td>{c.vehiculos?.length || 0}</td>
                      <td>
                        <span
                          className={`badge-estado ${c.activo ? "badge-activo" : "badge-inactivo"}`}
                        >
                          {c.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "vehiculos":
        return (
          <div className="seccion active">
            <div className="seccion-toolbar">
              <h6 className="seccion-subtitulo">Vehículos registrados</h6>
              <button
                className="btn-admin-primary"
                onClick={() => alert("Registrar vehículo")}
              >
                <i className="bi bi-plus-lg"></i> Registrar vehículo
              </button>
            </div>
            <div className="row g-3">
              {vehiculos.map((v) => (
                <div className="col-md-4" key={v.id}>
                  <div className="vehiculo-card">
                    <div className="vehiculo-card-header">
                      <i className="bi bi-car-front vehiculo-icono"></i>
                      <span className="vehiculo-placa">{v.placa}</span>
                    </div>
                    <h6 className="vehiculo-nombre">
                      {v.marca} {v.modelo}
                    </h6>
                    <p className="vehiculo-anio">{v.anio}</p>
                    <p className="vehiculo-propietario">
                      <i className="bi bi-person"></i> {v.propietario}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "citas":
        return (
          <div className="seccion active">
            <div className="seccion-toolbar">
              <h6 className="seccion-subtitulo">Gestión de citas</h6>
              <button
                className="btn-admin-primary"
                onClick={() => alert("Nueva cita")}
              >
                <i className="bi bi-calendar-plus"></i> Nueva cita
              </button>
            </div>
            <div className="filtros-estado mb-3">
              <button className="filtro-btn active">Todos</button>
              <button className="filtro-btn">Pendientes</button>
              <button className="filtro-btn">En progreso</button>
              <button className="filtro-btn">Completados</button>
              <button className="filtro-btn">Cancelados</button>
            </div>
            <div className="panel">
              <table className="tabla-admin">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Vehículo</th>
                    <th>Servicio</th>
                    <th>Fecha</th>
                    <th>Mecánico</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((cita, i) => (
                    <tr key={cita.id}>
                      <td>{i + 1}</td>
                      <td>{cita.cliente}</td>
                      <td>{cita.vehiculo}</td>
                      <td>{cita.servicio}</td>
                      <td>{cita.fecha}</td>
                      <td>{cita.mecanico}</td>
                      <td>
                        <span
                          className={`badge-estado badge-${cita.estado.replace(" ", "-")}`}
                        >
                          {cita.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "mecanicos":
        return (
          <div className="seccion active">
            <div className="seccion-toolbar">
              <h6 className="seccion-subtitulo">Personal técnico</h6>
              <button
                className="btn-admin-primary"
                onClick={() => alert("Nuevo mecánico")}
              >
                <i className="bi bi-person-plus"></i> Nuevo mecánico
              </button>
            </div>
            <div className="row g-3">
              {mecanicos.map((m) => (
                <div className="col-md-3" key={m.id}>
                  <div className="mecanico-card">
                    <div className="mecanico-avatar">{m.nombre.charAt(0)}</div>
                    <h6 className="mecanico-nombre">{m.nombre}</h6>
                    <p className="mecanico-especialidad">{m.especialidad}</p>
                    <p className="mecanico-citas">
                      <i className="bi bi-tools"></i> {m.citas} citas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "facturacion":
        return (
          <div className="seccion active">
            <div className="seccion-toolbar">
              <h6 className="seccion-subtitulo">Historial de facturas</h6>
              <button
                className="btn-admin-primary"
                onClick={() => alert("Nueva factura")}
              >
                <i className="bi bi-file-earmark-plus"></i> Nueva factura
              </button>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="stat-card stat-card--green">
                  <div className="stat-card-icon">
                    <i className="bi bi-cash-stack"></i>
                  </div>
                  <div>
                    <p className="stat-card-label">Facturado hoy</p>
                    <p className="stat-card-num">$0</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="panel">
              <table className="tabla-admin">
                <thead>
                  <tr>
                    <th>N° Factura</th>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((f) => (
                    <tr key={f.id}>
                      <td>{f.numero}</td>
                      <td>{f.cliente}</td>
                      <td>{f.servicio}</td>
                      <td>{f.fecha}</td>
                      <td>{f.total}</td>
                      <td>
                        <span
                          className={`badge-estado badge-${f.estado === "pagada" ? "pagada" : "pendiente"}`}
                        >
                          {f.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "estadisticas":
        return (
          <div className="seccion active">
            <h6 className="seccion-subtitulo mb-4">Resumen de rendimiento</h6>
            {estadisticas ? (
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="panel">
                    <div className="panel-header">
                      <h6 className="panel-titulo">
                        Servicios más solicitados
                      </h6>
                    </div>
                    {estadisticas.serviciosPopulares?.map((s, i) => (
                      <div className="barra-stat" key={i}>
                        <span className="barra-stat-label">{s.nombre}</span>
                        <div className="barra-stat-bg">
                          <div
                            className={`barra-stat-fill ${i % 2 === 0 ? "barra-azul" : "barra-verde"}`}
                            style={{
                              width: `${(s.cantidad / Math.max(...estadisticas.serviciosPopulares.map((x) => x.cantidad))) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="barra-stat-valor">{s.cantidad}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="panel">
                    <div className="panel-header">
                      <h6 className="panel-titulo">Citas por estado</h6>
                    </div>
                    {estadisticas.citasPorEstado?.map((e, i) => (
                      <div className="barra-stat" key={i}>
                        <span className="barra-stat-label">{e.name}</span>
                        <div className="barra-stat-bg">
                          <div
                            className="barra-stat-fill barra-azul"
                            style={{ width: `${e.value}%` }}
                          ></div>
                        </div>
                        <span className="barra-stat-valor">{e.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p>Cargando estadísticas...</p>
            )}
          </div>
        );

      default:
        return (
          <div className="seccion active">
            <p>Sección no encontrada</p>
          </div>
        );
    }
  };

  return <>{renderSection()}</>;
};

export default AdminDashboard;
