import apiClient from './apiClient'

/* ══════════════════════════════════
   MARCAS Y MODELOS
══════════════════════════════════ */
export const marcaService = {
  getAll:         ()              => apiClient.get('Marcas'),
  getModelos:     (idMarca)       => apiClient.get(`Marcas/${idMarca}/modelos`),
  getTodosModelos:()              => apiClient.get('Marcas/modelos-todos'),
  crear:          (data)          => apiClient.post('Marcas', data),
  actualizar:     (id, data)      => apiClient.put(`Marcas/${id}`, data),
  eliminar:       (id)            => apiClient.delete(`Marcas/${id}`),
  crearModelo:    (idMarca, data) => apiClient.post(`Marcas/${idMarca}/modelos`, data),
  actualizarModelo:(id, data)     => apiClient.put(`Marcas/modelos/${id}`, data),
  eliminarModelo: (id)            => apiClient.delete(`Marcas/modelos/${id}`),
}

/* ══════════════════════════════════
   ESPECIALIDADES
══════════════════════════════════ */
export const especialidadService = {
  getAll:     ()         => apiClient.get('Especialidad'),
  crear:      (data)     => apiClient.post('Especialidad', data),
  actualizar: (id, data) => apiClient.put(`Especialidad/${id}`, data),
  eliminar:   (id)       => apiClient.delete(`Especialidad/${id}`),
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
  getAll:     ()         => apiClient.get('Servicios'),
  crear:      (data)     => apiClient.post('Servicios', data),
  actualizar: (id, data) => apiClient.put(`Servicios/${id}`, data),
  eliminar:   (id)       => apiClient.delete(`Servicios/${id}`),
}

/* ══════════════════════════════════
   PRODUCTOS
══════════════════════════════════ */
export const productoService = {
  getAll:     ()         => apiClient.get('Productos'),
  crear:      (data)     => apiClient.post('Productos', data),
  actualizar: (id, data) => apiClient.put(`Productos/${id}`, data),
  eliminar:   (id)       => apiClient.delete(`Productos/${id}`),
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
   CLIENTES — para selectores
══════════════════════════════════ */
export const clienteAdminService = {
  getAll: () => apiClient.get('Cliente/admin/todos'),
}