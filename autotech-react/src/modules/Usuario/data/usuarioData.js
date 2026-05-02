// ═══════════════════════════════════════════════════════
//  DATOS SIMULADOS — reemplazar con llamadas a la API
//  data/usuarioData.js
// ═══════════════════════════════════════════════════════

// TODO: GET /api/mecanicos/disponibles → lista de mecánicos
// ⚠️  CAMBIO: ahora es array de objetos { id, nombre }
//     para que ModalAgendarCita pueda usar m.id y m.nombre
export const MECANICOS = [
  { id: "1", nombre: "Carlos M." },
  { id: "2", nombre: "Pedro R."  },
  { id: "3", nombre: "Luis T."   },
  { id: "4", nombre: "Andrés V." },
];

// TODO: GET /api/servicios → catálogo de servicios del taller
export const SERVICIOS_DISPONIBLES = [
  "Cambio de aceite y filtros",
  "Revisión general de frenos",
  "Alineación y balanceo",
  "Revisión eléctrica",
  "Mantenimiento preventivo",
  "Cambio de llantas",
  "Diagnóstico computarizado",
  "Cambio de correa de distribución",
];

export const HORAS_DISPONIBLES = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

// TODO: GET /api/vehiculos?usuarioId=:id → vehículos del usuario
export const initialVehiculos = [
  { id: 1, nombre: "Toyota Corolla",  placa: "ABC-123", anio: 2020, km: 45200, combustible: "Gasolina", color: "Blanco", ultimoServicio: "10 Mar 2026", estado: "ok",   icono: "car",   colorWrap: "blue"   },
  { id: 2, nombre: "Chevrolet Spark", placa: "XYZ-789", anio: 2018, km: 82000, combustible: "Gasolina", color: "Rojo",   ultimoServicio: "20 Ene 2026", estado: "warn", icono: "car",   colorWrap: "orange" },
  { id: 3, nombre: "Renault Duster",  placa: "DEF-456", anio: 2021, km: 22800, combustible: "Diésel",   color: "Gris",   ultimoServicio: "05 Feb 2026", estado: "ok",   icono: "truck", colorWrap: "green"  },
];

// TODO: GET /api/citas?usuarioId=:id → citas del usuario
export const initialCitas = [
  { id: 1, servicio: "Cambio de aceite y filtros", dia: "28", mes: "MAR", hora: "10:00 AM", vehiculo: "Toyota Corolla 2020",  vehiculoId: "1", mecanicoId: "1", mecanico: "Carlos M.", estado: "pendiente"  },
  { id: 2, servicio: "Revisión general de frenos", dia: "05", mes: "ABR", hora: "2:00 PM",  vehiculo: "Chevrolet Spark 2018", vehiculoId: "2", mecanicoId: "2", mecanico: "Pedro R.",   estado: "confirmada" },
  { id: 3, servicio: "Alineación y balanceo",      dia: "10", mes: "MAR", hora: "9:00 AM",  vehiculo: "Renault Duster 2021",  vehiculoId: "3", mecanicoId: "3", mecanico: "Pedro R.",   estado: "completada" },
  { id: 4, servicio: "Revisión eléctrica",         dia: "01", mes: "MAR", hora: "11:00 AM", vehiculo: "Toyota Corolla 2020",  vehiculoId: "1", mecanicoId: "", mecanico:  "Sin asignar", estado: "cancelada"  },
];

// TODO: GET /api/historial?usuarioId=:id → historial de servicios
export const historial = [
  { id: 1, servicio: "Alineación y balanceo",              dia: "10", mes: "MAR", vehiculo: "Renault Duster 2021",  mecanico: "Pedro R.",  monto: 95000  },
  { id: 2, servicio: "Cambio de aceite y filtros",         dia: "15", mes: "FEB", vehiculo: "Toyota Corolla 2020",  mecanico: "Carlos M.", monto: 85000  },
  { id: 3, servicio: "Revisión de frenos",                 dia: "20", mes: "ENE", vehiculo: "Chevrolet Spark 2018", mecanico: "Luis T.",   monto: 120000 },
  { id: 4, servicio: "Mantenimiento preventivo 20.000 km", dia: "05", mes: "ENE", vehiculo: "Renault Duster 2021",  mecanico: "Carlos M.", monto: 180000 },
  { id: 5, servicio: "Cambio de llantas",                  dia: "18", mes: "DIC", vehiculo: "Toyota Corolla 2020",  mecanico: "Pedro R.",  monto: 320000 },
];

// TODO: GET /api/facturas?usuarioId=:id → facturas del usuario
export const initialFacturas = [
  { id: 1, numero: "F-001", servicio: "Alineación y balanceo",   vehiculo: "Renault Duster",  fecha: "10 Mar 2026", total: 95000,  estado: "pagada" },
  { id: 2, numero: "F-002", servicio: "Cambio de aceite",        vehiculo: "Toyota Corolla",  fecha: "15 Feb 2026", total: 85000,  estado: "pagada" },
  { id: 3, numero: "F-003", servicio: "Revisión de frenos",      vehiculo: "Chevrolet Spark", fecha: "20 Ene 2026", total: 120000, estado: "pagada" },
  { id: 4, numero: "F-004", servicio: "Mantenimiento 20.000 km", vehiculo: "Renault Duster",  fecha: "05 Ene 2026", total: 180000, estado: "pagada" },
  { id: 5, numero: "F-005", servicio: "Cambio de llantas",       vehiculo: "Toyota Corolla",  fecha: "18 Dic 2025", total: 320000, estado: "pagada" },
];

// ── Helpers de fecha ──────────────────────────────────
export const MESES       = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
export const MESES_FULL  = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
export const DIAS_SEMANA = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

export function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches";
}

export function getDateLabel() {
  const d = new Date();
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES_FULL[d.getMonth()]} de ${d.getFullYear()}`;
}