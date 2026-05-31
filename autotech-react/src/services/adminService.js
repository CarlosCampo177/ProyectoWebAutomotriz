import apiClient from './apiClient'

/* ══════════════════════════════════
   MARCAS Y MODELOS
══════════════════════════════════ */
export const marcaService = {
  getAll:                  ()              => apiClient.get('Marcas'),
  getModelos:              (idMarca)       => apiClient.get(`Marcas/${idMarca}/modelos`),
  getTodosModelos:         ()              => apiClient.get('Marcas/modelos-todos'),
  crear:                   (data)          => apiClient.post('Marcas', data),
  actualizar:              (id, data)      => apiClient.put(`Marcas/${id}`, data),
  eliminar:                (id)            => apiClient.delete(`Marcas/${id}`),
  crearModelo:             (idMarca, data) => apiClient.post(`Marcas/${idMarca}/modelos`, data),
  actualizarModelo:        (id, data)      => apiClient.put(`Marcas/modelos/${id}`, data),
  eliminarModelo:          (id)            => apiClient.delete(`Marcas/modelos/${id}`),

  getTipos:                ()              => apiClient.get('TiposVehiculo'),
  getMarcasPorTipo:        (idTipo)        => apiClient.get(`Marcas/porTipo/${idTipo}`),
  getModelosPorMarcaYTipo: (idMarca, idTipo) => apiClient.get(`Marcas/${idMarca}/modelos/porTipo/${idTipo}`),
}

/* ══════════════════════════════════
   MECÁNICOS
══════════════════════════════════ */
export const mecanicoAdminService = {
  getAll:          ()         => apiClient.get('MecanicoAdmin'),
  getDisponibles:  ()         => apiClient.get('MecanicoAdmin/disponibles'),
  getOrdenes:      (id)       => apiClient.get(`MecanicoAdmin/${id}/ordenes`),
  getEstadisticas: (id)       => apiClient.get(`MecanicoAdmin/${id}/estadisticas`),
  crear:           (data)     => apiClient.post('MecanicoAdmin', data),
  actualizar:      (id, data) => apiClient.put(`MecanicoAdmin/${id}`, data),
  cambiarEstado:   (id)       => apiClient.patch(`MecanicoAdmin/${id}/estado`),
}

/* ══════════════════════════════════
   ESPECIALIDADES
══════════════════════════════════ */
export const especialidadService = {
  getAll:     ()         => apiClient.get('Especialidads'),
  crear:      (data)     => apiClient.post('Especialidads', data),
  actualizar: (id, data) => apiClient.put(`Especialidads/${id}`, data),
  eliminar:   (id)       => apiClient.delete(`Especialidads/${id}`),
}

/* ══════════════════════════════════
   VEHÍCULOS
══════════════════════════════════ */
export const vehiculoService = {
  getAll:     ()         => apiClient.get('Vehiculo'),
  getById:    (id)       => apiClient.get(`Vehiculo/${id}`),
  crear:      (data)     => apiClient.post('Vehiculo', data),
  actualizar: (id, data) => apiClient.put(`Vehiculo/${id}`, data),
  eliminar:   (id)       => apiClient.delete(`Vehiculo/${id}`),
}

/* ══════════════════════════════════
   SERVICIOS
══════════════════════════════════ */
export const servicioService = {
  getAll:        ()         => apiClient.get('Servicios'),
  getActivos:    ()         => apiClient.get('Servicios/activos'),
  getById:       (id)       => apiClient.get(`Servicios/${id}`),
  crear:         (data)     => apiClient.post('Servicios', data),
  actualizar:    (id, data) => apiClient.put(`Servicios/${id}`, data),
  cambiarEstado: (id)       => apiClient.patch(`Servicios/${id}/estado`),
}

/* ══════════════════════════════════
   PRODUCTOS
══════════════════════════════════ */
export const productoService = {
  getAll:         ()              => apiClient.get('Productos'),
  getActivos:     ()              => apiClient.get('Productos/activos'),
  getHistorial:   (id)            => apiClient.get(`Productos/${id}/historial`),
  crear:          (data)          => apiClient.post('Productos', data),
  actualizar:     (id, data)      => apiClient.put(`Productos/${id}`, data),
  cambiarEstado:  (id)            => apiClient.patch(`Productos/${id}/estado`),
  actualizarStock:(id, data)      => apiClient.patch(`Productos/${id}/stock`, data),
}

/* ══════════════════════════════════
   ÓRDENES
══════════════════════════════════ */
export const ordenService = {
  getAll:          ()         => apiClient.get('Orden'),
  getById:         (id)       => apiClient.get(`Orden/${id}`),
  crear:           (data)     => apiClient.post('Orden', data),
  actualizar:      (id, data) => apiClient.put(`Orden/${id}`, data),
  cambiarEstado:   (id, data) => apiClient.put(`Orden/${id}/estado`, data),
  eliminar:        (id)       => apiClient.delete(`Orden/${id}`),
}

/* ══════════════════════════════════
   FACTURACIÓN
══════════════════════════════════ */
export const facturaService = {
  getAll:     ()         => apiClient.get('Factura'),
  getById:    (id)       => apiClient.get(`Factura/${id}`),
  generar:    (data)     => apiClient.post('Factura', data),
  eliminar:   (id)       => apiClient.delete(`Factura/${id}`),
}

/* ══════════════════════════════════
   ESTADÍSTICAS (dashboard)
══════════════════════════════════ */
export const estadisticaService = {
  getResumen: () => apiClient.get('Admin/estadisticas'),
}

/* ══════════════════════════════════
   CLIENTES 
══════════════════════════════════ */
export const clienteAdminService = {
  getAll:        ()         => apiClient.get('ClienteAdmin'),
  getTodos:      ()         => apiClient.get('ClienteAdmin/todos'),
  getById:       (id)       => apiClient.get(`ClienteAdmin/${id}`),
  crear:         (data)     => apiClient.post('ClienteAdmin', data),
  actualizar:    (id, data) => apiClient.put(`ClienteAdmin/${id}`, data),
  cambiarEstado: (id)       => apiClient.patch(`ClienteAdmin/${id}/estado`),
}