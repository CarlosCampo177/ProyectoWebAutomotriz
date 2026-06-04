import apiClient from './apiClient' 

export const getVehiculos  = (idUsuario) => apiClient.get(`Cliente/${idUsuario}/vehiculos`)
export const getCitas      = (idUsuario) => apiClient.get(`Cliente/${idUsuario}/citas`)
export const getHistorial  = (idUsuario) => apiClient.get(`Cliente/${idUsuario}/historial`)
export const getFacturas   = (idUsuario) => apiClient.get(`Cliente/${idUsuario}/facturas`)
export const getStats      = (idUsuario) => apiClient.get(`Cliente/${idUsuario}/stats`)
export const getMecanicos = () => apiClient.get('Mecanico')
export const getHorasOcupadas = (mecanicoId, fecha) =>
  apiClient.get(`Cliente/citas/horas-ocupadas?mecanicoId=${mecanicoId}&fecha=${fecha}`)
export const getServiciosActivos = () => apiClient.get('Servicios/activos')

export const postVehiculo  = (idUsuario, data) => apiClient.post(`Cliente/${idUsuario}/vehiculos`, data)
export const postCita      = (idUsuario, data) => apiClient.post(`Cliente/${idUsuario}/citas`, data)
