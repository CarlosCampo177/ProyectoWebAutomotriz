import { get, post } from './apiClient'  

const r = (id) => `Mecanico/${id}`

export const getMecanicoPerfil        = (id) => get(`${r(id)}/perfil`)
export const getMecanicoOrdenes       = (id) => get(`${r(id)}/ordenes`)
export const getMecanicoVehiculos     = (id) => get(`${r(id)}/vehiculos`)
export const getMecanicoObservaciones = (id) => get(`${r(id)}/observaciones`)
export const postObservacion          = (id, data) => post(`${r(id)}/observaciones`, data)