import apiClient from './apiClient'  

export const getMecanicoPerfil        = (id) => apiClient.get(`Mecanico/${id}/perfil`)
export const getMecanicoOrdenes       = (id) => apiClient.get(`Mecanico/${id}/ordenes`)
export const getMecanicoVehiculos     = (id) => apiClient.get(`Mecanico/${id}/vehiculos`)
export const getMecanicoObservaciones = (id) => apiClient.get(`Mecanico/${id}/observaciones`)
export const postObservacion          = (id, data) => apiClient.post(`Mecanico/${id}/observaciones`, data)
export const cambiarEstadoOrden = (idUsuario, idOrden) =>apiClient.patch(`Mecanico/${idUsuario}/ordenes/${idOrden}/estado`);