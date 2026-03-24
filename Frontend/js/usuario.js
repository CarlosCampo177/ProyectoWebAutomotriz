/* ==============================================
   1. DATOS SIMULADOS
=============================================== */

const usuario = {
  nombre:     "Oscar Avila",
  iniciales:  "OA",
  cedula:     "1067595713",
  correo:     "oscar@email.com",
  telefono:   "300-555-7890",
  ciudad:     "Valledupar, Colombia",
};

const misVehiculos = [
  { id: 1, nombre: "Toyota Corolla",  placa: "ABC-123", anio: 2020, km: 45200, combustible: "Gasolina", color: "Blanco", ultimoServicio: "10 Mar 2026", estado: "ok",   icono: "bi-car-front-fill", colorWrap: "blue"   },
  { id: 2, nombre: "Chevrolet Spark", placa: "XYZ-789", anio: 2018, km: 82000, combustible: "Gasolina", color: "Rojo",   ultimoServicio: "20 Ene 2026", estado: "warn", icono: "bi-car-front-fill", colorWrap: "orange" },
  { id: 3, nombre: "Renault Duster",  placa: "DEF-456", anio: 2021, km: 22800, combustible: "Diésel",   color: "Gris",   ultimoServicio: "05 Feb 2026", estado: "ok",   icono: "bi-truck",          colorWrap: "green"  },
];

const misCitas = [
  { id: 1, servicio: "Cambio de aceite y filtros", dia: "28", mes: "MAR", hora: "10:00 AM", vehiculo: "Toyota Corolla 2020",  mecanico: "Sin asignar", estado: "pendiente"  },
  { id: 2, servicio: "Revisión general de frenos", dia: "05", mes: "ABR", hora: "2:00 PM",  vehiculo: "Chevrolet Spark 2018", mecanico: "Carlos M.",   estado: "confirmada" },
  { id: 3, servicio: "Alineación y balanceo",      dia: "10", mes: "MAR", hora: "9:00 AM",  vehiculo: "Renault Duster 2021",  mecanico: "Pedro R.",    estado: "completada" },
  { id: 4, servicio: "Revisión eléctrica",         dia: "01", mes: "MAR", hora: "11:00 AM", vehiculo: "Toyota Corolla 2020",  mecanico: "Sin asignar", estado: "cancelada"  },
];

const historial = [
  { servicio: "Alineación y balanceo",              dia: "10", mes: "MAR", vehiculo: "Renault Duster 2021",  mecanico: "Pedro R.",  monto: 95000  },
  { servicio: "Cambio de aceite y filtros",         dia: "15", mes: "FEB", vehiculo: "Toyota Corolla 2020",  mecanico: "Carlos M.", monto: 85000  },
  { servicio: "Revisión de frenos",                 dia: "20", mes: "ENE", vehiculo: "Chevrolet Spark 2018", mecanico: "Luis T.",   monto: 120000 },
  { servicio: "Mantenimiento preventivo 20.000 km", dia: "05", mes: "ENE", vehiculo: "Renault Duster 2021",  mecanico: "Carlos M.", monto: 180000 },
  { servicio: "Cambio de llantas",                  dia: "18", mes: "DIC", vehiculo: "Toyota Corolla 2020",  mecanico: "Pedro R.",  monto: 320000 },
];

const misFacturas = [
  { numero: "F-001", servicio: "Alineación y balanceo",   vehiculo: "Renault Duster",  fecha: "10 Mar 2026", total: 95000,  estado: "pagada" },
  { numero: "F-002", servicio: "Cambio de aceite",        vehiculo: "Toyota Corolla",  fecha: "15 Feb 2026", total: 85000,  estado: "pagada" },
  { numero: "F-003", servicio: "Revisión de frenos",      vehiculo: "Chevrolet Spark", fecha: "20 Ene 2026", total: 120000, estado: "pagada" },
  { numero: "F-004", servicio: "Mantenimiento 20.000 km", vehiculo: "Renault Duster",  fecha: "05 Ene 2026", total: 180000, estado: "pagada" },
  { numero: "F-005", servicio: "Cambio de llantas",       vehiculo: "Toyota Corolla",  fecha: "18 Dic 2025", total: 320000, estado: "pagada" },
];


/* ==============================================
   2. HELPERS REUTILIZABLES
=============================================== */

// Colores por estado de badge
const badgeColor = {
  pendiente:  { bg: "#fff3e0", color: "#e65100" },
  confirmada: { bg: "#e8f5e9", color: "#2e7d32" },
  completada: { bg: "#e3f2fd", color: "#1565c0" },
  completado: { bg: "#e3f2fd", color: "#1565c0" },
  cancelada:  { bg: "#fce4ec", color: "#c62828" },
  pagada:     { bg: "#e8f5e9", color: "#2e7d32" },
};

// Genera el HTML de un badge según el estado
function badge(estado, textoCustom) {
  var b = badgeColor[estado] || { bg: "#eee", color: "#555" };
  var texto = textoCustom || (estado.charAt(0).toUpperCase() + estado.slice(1));
  return '<span class="badge-estado" style="background:' + b.bg + ';color:' + b.color + '">' + texto + '</span>';
}

// Genera la columna de fecha (día + mes) usada en citas e historial
function fechaCol(dia, mes) {
  return '<div class="cita-row-fecha">' +
    '<span class="cr-dia">' + dia + '</span>' +
    '<span class="cr-mes">' + mes + '</span>' +
  '</div>';
}

// Genera la alerta de km si supera 80.000
function alertaKm(km) {
  return km >= 80000
    ? '<div class="km-alert mt-2"><i class="bi bi-exclamation-triangle-fill"></i> Supera 80,000 km — se recomienda revisión preventiva</div>'
    : "";
}


/* ==============================================
   3. RENDER: INICIO
=============================================== */
function renderInicio() {
  var pendientes = misCitas.filter(function(c) { return c.estado === "pendiente"; }).length;
  var proximas   = misCitas.filter(function(c) { return c.estado === "pendiente" || c.estado === "confirmada"; });

  // — Summary cards —
  var summaryDef = [
    { icon: "bi-car-front-fill",                bg: "#e8f0fe", color: "#1a6bdc", label: "Vehículos",           val: misVehiculos.length, delay: "0s"   },
    { icon: "bi-calendar-check-fill",           bg: "#fff3e0", color: "#e65100", label: "Citas pendientes",     val: pendientes,          delay: ".08s" },
    { icon: "bi-wrench-adjustable-circle-fill", bg: "#e8f5e9", color: "#2e7d32", label: "Servicios realizados", val: historial.length,    delay: ".16s" },
    { icon: "bi-cpu-fill",                      bg: "#f3e5f5", color: "#6a1b9a", label: "Consultas IA",         val: 5,                   delay: ".24s" },
  ];

  document.getElementById("summary-cards").innerHTML = summaryDef.map(function(c) {
    return '<div class="col-6 col-lg-3">' +
      '<div class="summary-card card-anim" style="--d:' + c.delay + '">' +
        '<div class="icon-wrap" style="background:' + c.bg + '"><i class="bi ' + c.icon + '" style="color:' + c.color + '"></i></div>' +
        '<div><div class="label">' + c.label + '</div>' +
        '<div class="value counter" data-target="' + c.val + '">0</div></div>' +
      '</div></div>';
  }).join("");

  // — Acciones rápidas —
  var accionesDef = [
    { icon: "bi-calendar-plus-fill", label: "Mis citas",     c: "#1a6bdc", cs: "#e8f0fe", sec: "citas"    },
    { icon: "bi-car-front-fill",     label: "Mis vehículos", c: "#2e7d32", cs: "#e8f5e9", sec: "vehiculos" },
    { icon: "bi-cpu-fill",           label: "Consultar IA",  c: "#6a1b9a", cs: "#f3e5f5", sec: ""          },
    { icon: "bi-clock-history",      label: "Ver historial", c: "#e65100", cs: "#fff3e0", sec: "historial" },
  ];

  document.getElementById("acciones-rapidas").innerHTML = accionesDef.map(function(a) {
    var onclick = a.sec
      ? 'onclick="mostrar(\'' + a.sec + '\', document.querySelector(\'.nav-item[onclick*=' + a.sec + ']\'))"'
      : '';
    return '<div class="col-6 col-md-3">' +
      '<button class="btn-action w-100" ' + onclick + ' style="--c:' + a.c + ';--cs:' + a.cs + '">' +
        '<i class="bi ' + a.icon + '"></i><span>' + a.label + '</span>' +
      '</button></div>';
  }).join("");

  // — Próximas citas (máx 2) —
  var dotColor = { pendiente: "#1a6bdc", confirmada: "#2e7d32" };

  document.getElementById("proximas-citas").innerHTML = proximas.slice(0, 2).map(function(c) {
    return '<div class="cita-card">' +
      '<div class="dot" style="background:' + (dotColor[c.estado] || "#888") + '"></div>' +
      '<div class="cita-info flex-grow-1">' +
        '<div class="title">' + c.servicio + '</div>' +
        '<div class="sub"><i class="bi bi-clock me-1"></i>' + c.dia + ' ' + c.mes + ' · ' + c.hora +
          ' &nbsp;·&nbsp; <i class="bi bi-car-front me-1"></i>' + c.vehiculo + '</div>' +
      '</div>' + badge(c.estado) +
    '</div>';
  }).join("");

  // — Vehículos en inicio —
  document.getElementById("lista-vehiculos-inicio").innerHTML = misVehiculos.map(function(v) {
    return '<div class="vehicle-card">' +
      '<div class="d-flex align-items-center gap-2">' +
        '<i class="bi ' + v.icono + '" style="color:#1a6bdc;font-size:1.1rem"></i>' +
        '<div><div class="v-name">' + v.nombre + '</div><div class="v-plate">' + v.placa + ' · ' + v.anio + '</div></div>' +
        '<span class="ms-auto v-detail">' + v.km.toLocaleString("es-CO") + ' km</span>' +
      '</div>' + alertaKm(v.km) +
    '</div>';
  }).join("");

  mostrarFecha();
  animarContadores();
}


/* ==============================================
   4. RENDER: MIS VEHÍCULOS
=============================================== */
function renderVehiculos() {
  document.getElementById("grid-vehiculos").innerHTML = misVehiculos.map(function(v) {
    var badgeVeh = v.estado === "ok"
      ? '<span class="veh-badge ok"><i class="bi bi-check-circle-fill"></i> Al día</span>'
      : '<span class="veh-badge warn"><i class="bi bi-exclamation-circle-fill"></i> Revisión pendiente</span>';

    return '<div class="col-md-6 col-lg-4">' +
      '<div class="veh-card">' +
        '<div class="veh-card-top"><div class="veh-icon-wrap ' + v.colorWrap + '"><i class="bi ' + v.icono + '"></i></div></div>' +
        '<div class="veh-card-body">' +
          '<div class="veh-card-name">' + v.nombre + '</div>' +
          '<div class="veh-card-plate">' + v.placa + ' &nbsp;·&nbsp; ' + v.anio + '</div>' +
          '<div class="veh-card-stats">' +
            '<div class="veh-stat"><span class="veh-stat-label">Kilometraje</span><span class="veh-stat-val' + (v.km >= 80000 ? " warn" : "") + '">' + v.km.toLocaleString("es-CO") + ' km' + (v.km >= 80000 ? " ⚠" : "") + '</span></div>' +
            '<div class="veh-stat"><span class="veh-stat-label">Combustible</span><span class="veh-stat-val">' + v.combustible + '</span></div>' +
            '<div class="veh-stat"><span class="veh-stat-label">Color</span><span class="veh-stat-val">' + v.color + '</span></div>' +
            '<div class="veh-stat"><span class="veh-stat-label">Último servicio</span><span class="veh-stat-val">' + v.ultimoServicio + '</span></div>' +
          '</div>' + alertaKm(v.km) +
        '</div>' +
        '<div class="veh-card-footer">' + badgeVeh + '</div>' +
      '</div></div>';
  }).join("");
}


/* ==============================================
   5. RENDER: MIS CITAS (con filtro)
=============================================== */
function renderCitas(filtro) {
  var lista = (filtro && filtro !== "todas")
    ? misCitas.filter(function(c) { return c.estado === filtro; })
    : misCitas;

  document.getElementById("lista-citas").innerHTML = lista.length
    ? lista.map(function(c) {
        return '<div class="cita-row" data-estado="' + c.estado + '">' +
          fechaCol(c.dia, c.mes) +
          '<div class="cita-row-info">' +
            '<div class="cr-titulo">' + c.servicio + '</div>' +
            '<div class="cr-meta">' +
              '<span><i class="bi bi-clock"></i> ' + c.hora + '</span>' +
              '<span><i class="bi bi-car-front"></i> ' + c.vehiculo + '</span>' +
              '<span><i class="bi bi-person-workspace"></i> ' + c.mecanico + '</span>' +
            '</div>' +
          '</div>' + badge(c.estado) +
        '</div>';
      }).join("")
    : '<p class="text-muted p-3">No hay citas con este estado.</p>';
}

// Maneja el clic en los botones de filtro de citas
function filtrarCitasUsuario(estado, boton) {
  document.querySelectorAll("#sec-citas .filtro-btn").forEach(function(b) { b.classList.remove("active"); });
  boton.classList.add("active");
  renderCitas(estado);
}


/* ==============================================
   6. RENDER: HISTORIAL
=============================================== */
function renderHistorial() {
  document.getElementById("lista-historial").innerHTML = historial.map(function(h) {
    return '<div class="cita-row">' +
      fechaCol(h.dia, h.mes) +
      '<div class="cita-row-info">' +
        '<div class="cr-titulo">' + h.servicio + '</div>' +
        '<div class="cr-meta">' +
          '<span><i class="bi bi-car-front"></i> ' + h.vehiculo + '</span>' +
          '<span><i class="bi bi-person-workspace"></i> ' + h.mecanico + '</span>' +
          '<span><i class="bi bi-cash"></i> $' + h.monto.toLocaleString("es-CO") + '</span>' +
        '</div>' +
      '</div>' + badge("completado", "Completado") +
    '</div>';
  }).join("");
}


/* ==============================================
   7. RENDER: FACTURAS
=============================================== */
function renderFacturas() {
  var totalPagado    = misFacturas.reduce(function(s, f) { return s + (f.estado === "pagada" ? f.total : 0); }, 0);
  var totalPendiente = misFacturas.reduce(function(s, f) { return s + (f.estado !== "pagada" ? f.total : 0); }, 0);

  var resumenDef = [
    { icon: "bi-cash-stack",        bg: "#e8f5e9", color: "#2e7d32", label: "Total pagado",   val: "$" + totalPagado.toLocaleString("es-CO") },
    { icon: "bi-hourglass-split",   bg: "#fff3e0", color: "#e65100", label: "Pendiente",      val: "$" + totalPendiente.toLocaleString("es-CO") },
    { icon: "bi-file-earmark-text", bg: "#e8f0fe", color: "#1a6bdc", label: "Total facturas", val: misFacturas.length },
  ];

  document.getElementById("resumen-facturas").innerHTML = resumenDef.map(function(r) {
    return '<div class="col-6 col-md-3">' +
      '<div class="summary-card">' +
        '<div class="icon-wrap" style="background:' + r.bg + '"><i class="bi ' + r.icon + '" style="color:' + r.color + '"></i></div>' +
        '<div><div class="label">' + r.label + '</div><div class="value">' + r.val + '</div></div>' +
      '</div></div>';
  }).join("");

  document.getElementById("tabla-facturas").innerHTML = misFacturas.map(function(f) {
    return '<tr>' +
      '<td><strong>' + f.numero + '</strong></td>' +
      '<td>' + f.servicio + '</td>' +
      '<td>' + f.vehiculo + '</td>' +
      '<td>' + f.fecha + '</td>' +
      '<td>$' + f.total.toLocaleString("es-CO") + '</td>' +
      '<td>' + badge(f.estado, "Pagada") + '</td>' +
    '</tr>';
  }).join("");
}


/* ==============================================
   8. RENDER: PERFIL
=============================================== */
function renderPerfil() {
  var campos = [
    { label: "Nombre completo",       val: usuario.nombre         },
    { label: "Cédula",                val: usuario.cedula         },
    { label: "Correo electrónico",    val: usuario.correo         },
    { label: "Teléfono",              val: usuario.telefono       },
    { label: "Ciudad",                val: usuario.ciudad         },
    { label: "Vehículos registrados", val: misVehiculos.length    },
  ];

  document.getElementById("perfil-campos").innerHTML = campos.map(function(c) {
    return '<div class="col-md-6">' +
      '<label class="form-label-custom">' + c.label + '</label>' +
      '<input type="text" class="form-input-custom" value="' + c.val + '" readonly/>' +
    '</div>';
  }).join("");
}


/* ==============================================
   9. UTILIDADES
=============================================== */

// Navegación — mismo patrón que admin.js
function mostrar(id, el) {
  document.querySelectorAll(".seccion").forEach(function(s) { s.classList.remove("active"); });
  document.querySelectorAll(".nav-item").forEach(function(a) { a.classList.remove("active"); });
  document.getElementById("sec-" + id).classList.add("active");
  if (el) el.classList.add("active");
  document.getElementById("topbarTitle").textContent = el ? el.textContent.trim() : id;
  if (event) event.preventDefault();
}

// Fecha y saludo dinámico
function mostrarFecha() {
  var hoy   = new Date();
  var dias  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  var meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  var hora  = hoy.getHours();
  var saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  var elGreeting = document.getElementById("timeGreeting");
  var elDate     = document.getElementById("dateLabel");
  if (elGreeting) elGreeting.textContent = saludo;
  if (elDate)     elDate.textContent = dias[hoy.getDay()] + ", " + hoy.getDate() + " de " + meses[hoy.getMonth()] + " de " + hoy.getFullYear();
}

// Animación de contadores en las summary-cards
function animarContadores() {
  document.querySelectorAll(".counter").forEach(function(el) {
    var target      = parseInt(el.getAttribute("data-target"), 10);
    var pasos       = 30;
    var intervalo   = 600 / pasos;
    var incremento  = target / pasos;
    var actual      = 0;
    var timer = setInterval(function() {
      actual += incremento;
      if (actual >= target) { actual = target; clearInterval(timer); }
      el.textContent = Math.round(actual);
    }, intervalo);
  });
}


/* ==============================================
   10. INICIALIZACIÓN
=============================================== */
document.addEventListener("DOMContentLoaded", function() {
  renderInicio();
  renderVehiculos();
  renderCitas(null);
  renderHistorial();
  renderFacturas();
  renderPerfil();
});