/* 1. DATOS SIMULADOS*/
const citas = [
  { id: 1, cliente: "Carlos Rodríguez", vehiculo: "Toyota Corolla", placa: "ABC-123", servicio: "Cambio de aceite",    fecha: "2025-06-23 10:30", mecanico: "Juan Pérez",    estado: "pendiente",    monto: 85000  },
  { id: 2, cliente: "Ana González",     vehiculo: "Mazda CX-5",     placa: "DEF-456", servicio: "Alineación y balanceo", fecha: "2025-06-23 11:00", mecanico: "Luis Torres",   estado: "pendiente",    monto: 120000 },
  { id: 3, cliente: "Pedro Martínez",   vehiculo: "Chevrolet Spark", placa: "GHI-789", servicio: "Diagnóstico eléctrico", fecha: "2025-06-23 09:00", mecanico: "Juan Pérez",   estado: "en progreso",  monto: 150000 },
  { id: 4, cliente: "Laura Díaz",       vehiculo: "Renault Logan",   placa: "JKL-012", servicio: "Cambio de frenos",    fecha: "2025-06-23 08:00", mecanico: "Carlos Ríos",   estado: "completado",   monto: 200000 },
  { id: 5, cliente: "Miguel Torres",    vehiculo: "Kia Picanto",     placa: "MNO-345", servicio: "Mantenimiento 10.000 km", fecha: "2025-06-23 07:30", mecanico: "Luis Torres", estado: "completado",   monto: 180000 },
];

const clientes = [
  { id: 1, nombre: "Carlos Rodríguez", correo: "carlos@email.com", telefono: "300-111-2222", vehiculos: 1, estado: "activo"   },
  { id: 2, nombre: "Ana González",     correo: "ana@email.com",     telefono: "301-222-3333", vehiculos: 2, estado: "activo"   },
  { id: 3, nombre: "Pedro Martínez",   correo: "pedro@email.com",   telefono: "302-333-4444", vehiculos: 1, estado: "activo"   },
  { id: 4, nombre: "Laura Díaz",       correo: "laura@email.com",   telefono: "303-444-5555", vehiculos: 3, estado: "inactivo" },
  { id: 5, nombre: "Miguel Torres",    correo: "miguel@email.com",  telefono: "304-555-6666", vehiculos: 1, estado: "activo"   },
];

const vehiculos = [
  { id: 1, placa: "ABC-123", marca: "Toyota",    modelo: "Corolla",  anio: 2020, propietario: "Carlos Rodríguez", estado: "En taller"  },
  { id: 2, placa: "DEF-456", marca: "Mazda",     modelo: "CX-5",     anio: 2021, propietario: "Ana González",     estado: "En taller"  },
  { id: 3, placa: "GHI-789", marca: "Chevrolet", modelo: "Spark",    anio: 2019, propietario: "Pedro Martínez",   estado: "En taller"  },
  { id: 4, placa: "JKL-012", marca: "Renault",   modelo: "Logan",    anio: 2018, propietario: "Laura Díaz",       estado: "Entregado"  },
  { id: 5, placa: "MNO-345", marca: "Kia",       modelo: "Picanto",  anio: 2022, propietario: "Miguel Torres",    estado: "Entregado"  },
];

const mecanicos = [
  { id: 1, nombre: "Juan Pérez",   especialidad: "Motor y electricidad", citas: 4, estado: "disponible" },
  { id: 2, nombre: "Luis Torres",  especialidad: "Suspensión y frenos",  citas: 3, estado: "ocupado"     },
  { id: 3, nombre: "Carlos Ríos",  especialidad: "Aire acondicionado",   citas: 2, estado: "disponible" },
  { id: 4, nombre: "Mario Salcedo",especialidad: "Diagnóstico general",  citas: 1, estado: "libre"       },
];

const facturas = [
  { numero: "F-001", cliente: "Laura Díaz",    servicio: "Cambio de frenos",        fecha: "2025-06-23", total: 200000, estado: "pagada"   },
  { numero: "F-002", cliente: "Miguel Torres", servicio: "Mantenimiento 10.000 km", fecha: "2025-06-23", total: 180000, estado: "pagada"   },
];

function mostrar(id, el) {
  // Ocultar TODAS las secciones quitando la clase "active"
  document.querySelectorAll(".seccion").forEach(function(s) {
    s.classList.remove("active");
  });

  // Quitar "active" de todos los links del menú
  document.querySelectorAll(".sidebar-nav a").forEach(function(a) {
    a.classList.remove("active");
  });

  // Mostrar solo la sección que corresponde
  document.getElementById("sec-" + id).classList.add("active");

  // Marcar el link del menú como activo
  el.classList.add("active");

  // Actualizar el título de la topbar
  document.getElementById("titulo-pagina").textContent = el.textContent.trim();

  // Evitar que el navegador navegue al hacer clic en <a href="#">
  event.preventDefault();
}

// --- DASHBOARD (inicio) ---
function renderDashboard() {

  // Calcular ganancia del día sumando montos de citas completadas de hoy
  let gananciaHoy = 0;
  let citasHoy = citas.filter(function(c) {
    return c.fecha.startsWith("2025-06-23");
  });

  citasHoy.forEach(function(c) {
    if (c.estado === "completado") {
      gananciaHoy = gananciaHoy + c.monto;
    }
  });

  // Calcular ganancia de la semana (todas las completadas)
  let gananciaSemana = 0;
  citas.forEach(function(c) {
    if (c.estado === "completado") {
      gananciaSemana = gananciaSemana + c.monto;
    }
  });

  // Contar vehículos en taller ahora
  let enTaller = vehiculos.filter(function(v) {
    return v.estado === "En taller" || v.estado === "Diagnóstico";
  });

  // Encontrar el último servicio completado
  let completados = citas.filter(function(c) { return c.estado === "completado"; });
  let ultimoServicio = completados[completados.length - 1];

  // Encontrar citas pendientes de hoy (alertas)
  let citasPendientesHoy = citasHoy.filter(function(c) {
    return c.estado === "pendiente";
  });

  // Contar estados para la barra de progreso
  let totalHoy    = citasHoy.length;
  let compHoy     = citasHoy.filter(function(c){ return c.estado === "completado"; }).length;
  let progHoy     = citasHoy.filter(function(c){ return c.estado === "en progreso"; }).length;
  let pendHoy     = citasHoy.filter(function(c){ return c.estado === "pendiente"; }).length;
  let porcentaje  = totalHoy > 0 ? Math.round((compHoy / totalHoy) * 100) : 0;

  // Construir el HTML de la sección dashboard
  // Usamos template literals: texto con ${variable} adentro
  let html = `
    <p class="bienvenida-texto">Buen día, Admin. Aquí está el resumen de hoy.</p>

    <div class="row g-3 mb-3">

      <!-- HERO CARD: Ganancia del día -->
      <div class="col-lg-5">
        <div class="hero-card">
          <p class="hero-card-label">Ganancia del día</p>
          <h2 class="hero-card-monto">$${gananciaHoy.toLocaleString("es-CO")}</h2>
          <p class="hero-card-sub">Esta semana: $${gananciaSemana.toLocaleString("es-CO")}</p>
          <div class="hero-card-divider"></div>
          <p class="hero-card-hint">
            <i class="bi bi-arrow-up-circle-fill"></i>
            ${compHoy} servicio(s) completados hoy
          </p>
        </div>
      </div>

      <!-- Columna derecha: alerta + último servicio -->
      <div class="col-lg-7">
        <div class="row g-3 h-100">

          <!-- ALERTA citas próximas -->
          <div class="col-12">
            <div class="alerta-card ${citasPendientesHoy.length > 0 ? "alerta-card--activa" : "alerta-card--ok"}">
              <div class="alerta-icono">
                <i class="bi ${citasPendientesHoy.length > 0 ? "bi-exclamation-triangle-fill" : "bi-check-circle-fill"}"></i>
              </div>
              <div>
                <p class="alerta-titulo">
                  ${citasPendientesHoy.length > 0
                    ? `${citasPendientesHoy.length} cita(s) pendiente(s) hoy`
                    : "Sin citas pendientes — todo al día"}
                </p>
                <p class="alerta-detalle">
                  ${citasPendientesHoy.length > 0
                    ? `Próxima: ${citasPendientesHoy[0].cliente} — ${citasPendientesHoy[0].servicio} — ${citasPendientesHoy[0].fecha.split(" ")[1]}`
                    : "No hay citas pendientes para el resto del día"}
                </p>
              </div>
            </div>
          </div>

          <!-- Último servicio registrado -->
          <div class="col-12">
            <div class="ultimo-servicio-card">
              <p class="ultimo-servicio-label">
                <i class="bi bi-clock-history"></i> Último servicio registrado
              </p>
              <p class="ultimo-servicio-nombre">${ultimoServicio.servicio}</p>
              <p class="ultimo-servicio-detalle">
                ${ultimoServicio.vehiculo} — ${ultimoServicio.cliente}
              </p>
              <span class="badge-estado badge-completado">Completado</span>
            </div>
          </div>

          <!-- Vehículos en taller -->
          <div class="col-12">
            <div class="vehiculos-card">
              <div class="vehiculos-num">${enTaller.length}</div>
              <div>
                <p class="vehiculos-label">Vehículos en taller</p>
                <p class="vehiculos-marcas">${enTaller.slice(0,3).map(function(v){ return v.marca; }).join(", ")}${enTaller.length > 3 ? "..." : ""}</p>
              </div>
              <i class="bi bi-car-front vehiculos-icono"></i>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- BARRA DE PROGRESO DE CITAS DEL DÍA -->
    <div class="progreso-card mb-3">
      <div class="progreso-header">
        <span class="progreso-titulo">Citas de hoy</span>
        <span class="progreso-fraccion">${compHoy} de ${totalHoy} completadas</span>
      </div>
      <div class="progreso-barra-bg">
        <div class="progreso-barra-fill" style="width: ${porcentaje}%"></div>
      </div>
      <div class="progreso-leyenda">
        <span class="leyenda-item leyenda-completado">Completadas: ${compHoy}</span>
        <span class="leyenda-item leyenda-progreso">En progreso: ${progHoy}</span>
        <span class="leyenda-item leyenda-pendiente">Pendientes: ${pendHoy}</span>
      </div>
    </div>

    <!-- TABLA PRÓXIMAS CITAS -->
    <div class="panel">
      <div class="panel-header">
        <h6 class="panel-titulo">Próximas citas del día</h6>
      </div>
      <table class="tabla-admin">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Cliente</th>
            <th>Vehículo</th>
            <th>Servicio</th>
            <th>Mecánico</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${citasHoy.map(function(c) {
            return `<tr>
              <td>${c.fecha.split(" ")[1]}</td>
              <td>${c.cliente}</td>
              <td>${c.vehiculo}</td>
              <td>${c.servicio}</td>
              <td>${c.mecanico}</td>
              <td><span class="badge-estado badge-${c.estado.replace(" ", "-")}">${c.estado}</span></td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;

  // Insertar el HTML construido dentro del div de la sección
  document.getElementById("sec-dashboard").innerHTML = html;
}


/* ==============================================
   4. FUNCIÓN: renderizar tabla de clientes
=============================================== */
function renderClientes() {
  let filas = "";

  // for clásico — recorre el array de clientes
  for (let i = 0; i < clientes.length; i++) {
    let c = clientes[i];
    filas += `
      <tr>
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.correo}</td>
        <td>${c.telefono}</td>
        <td>${c.vehiculos}</td>
        <td><span class="badge-estado badge-${c.estado}">${c.estado}</span></td>
      </tr>
    `;
  }

  document.getElementById("tabla-clientes").innerHTML = filas;
}


/* ==============================================
   5. FUNCIÓN: renderizar tarjetas de vehículos
=============================================== */
function renderVehiculos() {
  let tarjetas = "";

  for (let i = 0; i < vehiculos.length; i++) {
    let v = vehiculos[i];
    let badgeClass = "";

    // if/else para asignar el color del badge según el estado
    if (v.estado === "En taller") {
      badgeClass = "badge-en-progreso";
    } else if (v.estado === "Diagnóstico") {
      badgeClass = "badge-pendiente";
    } else {
      badgeClass = "badge-completado";
    }

    tarjetas += `
      <div class="col-md-4 col-sm-6">
        <div class="vehiculo-card">
          <div class="vehiculo-card-header">
            <i class="bi bi-car-front-fill vehiculo-icono"></i>
            <span class="vehiculo-placa">${v.placa}</span>
          </div>
          <h6 class="vehiculo-nombre">${v.marca} ${v.modelo}</h6>
          <p class="vehiculo-anio">Año ${v.anio}</p>
          <p class="vehiculo-propietario">
            <i class="bi bi-person"></i> ${v.propietario}
          </p>
          <span class="badge-estado ${badgeClass}">${v.estado}</span>
        </div>
      </div>
    `;
  }

  document.getElementById("grid-vehiculos").innerHTML = tarjetas;
}


/* ==============================================
   6. FUNCIÓN: renderizar tabla de citas
   (con posibilidad de filtrar por estado)
=============================================== */
function renderCitas(filtro) {
  // Si no se pasa filtro, mostrar todas
  let lista = citas;

  if (filtro && filtro !== "todos") {
    lista = citas.filter(function(c) {
      return c.estado === filtro;
    });
  }

  let filas = "";
  for (let i = 0; i < lista.length; i++) {
    let c = lista[i];
    filas += `
      <tr>
        <td>${c.id}</td>
        <td>${c.cliente}</td>
        <td>${c.vehiculo} (${c.placa})</td>
        <td>${c.servicio}</td>
        <td>${c.fecha}</td>
        <td>${c.mecanico}</td>
        <td><span class="badge-estado badge-${c.estado.replace(" ", "-")}">${c.estado}</span></td>
      </tr>
    `;
  }

  document.getElementById("tabla-citas").innerHTML = filas;
}

// Esta función se llama cuando el usuario hace clic en los botones de filtro
function filtrarCitas(estado, boton) {
  // Quitar "active" de todos los botones
  document.querySelectorAll(".filtro-btn").forEach(function(btn) {
    btn.classList.remove("active");
  });
  // Poner "active" solo en el botón presionado
  boton.classList.add("active");
  // Re-renderizar la tabla con el filtro
  renderCitas(estado);
}


/* ==============================================
   7. FUNCIÓN: renderizar tarjetas de mecánicos
=============================================== */
function renderMecanicos() {
  let tarjetas = "";

  for (let i = 0; i < mecanicos.length; i++) {
    let m = mecanicos[i];
    let estadoClass = m.estado === "disponible" ? "badge-completado"
                    : m.estado === "ocupado"     ? "badge-en-progreso"
                    : "badge-cancelado";

    tarjetas += `
      <div class="col-md-3 col-sm-6">
        <div class="mecanico-card">
          <div class="mecanico-avatar">${m.nombre.charAt(0)}</div>
          <h6 class="mecanico-nombre">${m.nombre}</h6>
          <p class="mecanico-especialidad">${m.especialidad}</p>
          <p class="mecanico-citas">
            <i class="bi bi-calendar-check"></i> ${m.citas} citas hoy
          </p>
          <span class="badge-estado ${estadoClass}">${m.estado}</span>
        </div>
      </div>
    `;
  }

  document.getElementById("grid-mecanicos").innerHTML = tarjetas;
}


/* ==============================================
   8. FUNCIÓN: renderizar tabla de facturación
=============================================== */
function renderFacturacion() {
  // Calcular totales para las tarjetas de resumen
  let totalPagado = 0;
  let totalPendiente = 0;

  facturas.forEach(function(f) {
    if (f.estado === "pagada") {
      totalPagado += f.total;
    } else {
      totalPendiente += f.total;
    }
  });

  // Tarjetas de resumen de facturación
  document.getElementById("resumen-facturas").innerHTML = `
    <div class="col-md-4">
      <div class="stat-card stat-card--blue">
        <div class="stat-card-icon"><i class="bi bi-cash-stack"></i></div>
        <div>
          <p class="stat-card-label">Total cobrado</p>
          <h3 class="stat-card-num">$${totalPagado.toLocaleString("es-CO")}</h3>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="stat-card stat-card--orange">
        <div class="stat-card-icon"><i class="bi bi-hourglass-split"></i></div>
        <div>
          <p class="stat-card-label">Por cobrar</p>
          <h3 class="stat-card-num">$${totalPendiente.toLocaleString("es-CO")}</h3>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="stat-card stat-card--green">
        <div class="stat-card-icon"><i class="bi bi-file-earmark-text"></i></div>
        <div>
          <p class="stat-card-label">Total facturas</p>
          <h3 class="stat-card-num">${facturas.length}</h3>
        </div>
      </div>
    </div>
  `;

  // Tabla de facturas
  let filas = "";
  for (let i = 0; i < facturas.length; i++) {
    let f = facturas[i];
    filas += `
      <tr>
        <td><strong>${f.numero}</strong></td>
        <td>${f.cliente}</td>
        <td>${f.servicio}</td>
        <td>${f.fecha}</td>
        <td>$${f.total.toLocaleString("es-CO")}</td>
        <td><span class="badge-estado badge-${f.estado}">${f.estado}</span></td>
      </tr>
    `;
  }
  document.getElementById("tabla-facturas").innerHTML = filas;
}


/* ==============================================
   9. FUNCIÓN: estadísticas con barras CSS
   No usamos Chart.js ni ninguna librería externa.
   Solo divs con width calculado en porcentaje.
=============================================== */
function renderEstadisticas() {
  // Contar cuántas veces aparece cada servicio
  let conteoServicios = {};
  citas.forEach(function(c) {
    if (conteoServicios[c.servicio]) {
      conteoServicios[c.servicio]++;
    } else {
      conteoServicios[c.servicio] = 1;
    }
  });

  // Encontrar el máximo para calcular porcentajes
  let maxServicio = Math.max(...Object.values(conteoServicios));

  let barrasServicios = "";
  for (let servicio in conteoServicios) {
    let cantidad = conteoServicios[servicio];
    let porcentaje = Math.round((cantidad / maxServicio) * 100);
    barrasServicios += `
      <div class="barra-stat">
        <span class="barra-stat-label">${servicio}</span>
        <div class="barra-stat-bg">
          <div class="barra-stat-fill barra-azul" style="width:${porcentaje}%"></div>
        </div>
        <span class="barra-stat-valor">${cantidad}</span>
      </div>
    `;
  }
  document.getElementById("chart-servicios").innerHTML = barrasServicios;

  // Barras de estados
  let estados = ["completado", "en progreso", "pendiente", "cancelado"];
  let coloresEstado = {
    "completado":   "barra-verde",
    "en progreso":  "barra-azul",
    "pendiente":    "barra-naranja",
    "cancelado":    "barra-roja"
  };

  let maxEstado = 0;
  let conteoEstados = {};
  estados.forEach(function(e) {
    let count = citas.filter(function(c){ return c.estado === e; }).length;
    conteoEstados[e] = count;
    if (count > maxEstado) maxEstado = count;
  });

  let barrasEstados = "";
  estados.forEach(function(e) {
    let cantidad = conteoEstados[e];
    let porcentaje = maxEstado > 0 ? Math.round((cantidad / maxEstado) * 100) : 0;
    barrasEstados += `
      <div class="barra-stat">
        <span class="barra-stat-label">${e}</span>
        <div class="barra-stat-bg">
          <div class="barra-stat-fill ${coloresEstado[e]}" style="width:${porcentaje}%"></div>
        </div>
        <span class="barra-stat-valor">${cantidad}</span>
      </div>
    `;
  });
  document.getElementById("chart-estados").innerHTML = barrasEstados;

  // Barras de ingresos por mes (datos estáticos simulados)
  let ingresosMes = [
    { mes: "Enero",    monto: 1200000 },
    { mes: "Febrero",  monto: 980000  },
    { mes: "Marzo",    monto: 1450000 },
    { mes: "Abril",    monto: 1100000 },
    { mes: "Mayo",     monto: 1680000 },
    { mes: "Junio",    monto: 1240000 },
  ];

  let maxIngreso = Math.max(...ingresosMes.map(function(m){ return m.monto; }));

  let barrasIngresos = "";
  ingresosMes.forEach(function(m) {
    let porcentaje = Math.round((m.monto / maxIngreso) * 100);
    barrasIngresos += `
      <div class="barra-stat">
        <span class="barra-stat-label">${m.mes}</span>
        <div class="barra-stat-bg">
          <div class="barra-stat-fill barra-azul" style="width:${porcentaje}%"></div>
        </div>
        <span class="barra-stat-valor">$${m.monto.toLocaleString("es-CO")}</span>
      </div>
    `;
  });
  document.getElementById("chart-ingresos").innerHTML = barrasIngresos;
}


/* ==============================================
   10. FILTRO DE BÚSQUEDA para tablas
   Recorre todas las filas <tr> y oculta
   las que no contienen el texto buscado.
=============================================== */
function filtrarTabla(inputId, tablaId) {
  // Obtener el texto que escribió el usuario (en minúsculas)
  let texto = document.getElementById(inputId).value.toLowerCase();

  // Obtener todas las filas del tbody
  let filas = document.querySelectorAll("#" + tablaId + " tr");

  // Recorrer cada fila
  filas.forEach(function(fila) {
    // textContent devuelve todo el texto de la fila
    let contenido = fila.textContent.toLowerCase();

    // Si el texto buscado está en la fila, mostrarla; si no, ocultarla
    if (contenido.includes(texto)) {
      fila.style.display = "";       // mostrar
    } else {
      fila.style.display = "none";   // ocultar
    }
  });
}


/* ==============================================
   11. MOSTRAR FECHA ACTUAL EN LA TOPBAR
=============================================== */
function mostrarFecha() {
  let hoy = new Date();

  // Array con nombres de los días y meses en español
  let dias   = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  let meses  = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  let texto = dias[hoy.getDay()] + " " + hoy.getDate() + " " + meses[hoy.getMonth()];

  let el = document.getElementById("fecha-actual");
  if (el) {
    el.textContent = texto;
  }
}


/* ==============================================
   12. INICIALIZACIÓN
   Se ejecuta cuando la página termina de cargar.
   Llama a todas las funciones para poblar
   el contenido inicial.
=============================================== */
document.addEventListener("DOMContentLoaded", function() {
  mostrarFecha();
  renderDashboard();
  renderClientes();
  renderVehiculos();
  renderCitas("todos");
  renderMecanicos();
  renderFacturacion();
  renderEstadisticas();
});