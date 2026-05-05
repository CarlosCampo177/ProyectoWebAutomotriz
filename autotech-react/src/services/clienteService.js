import { get, post } from './apiClient'

export const getVehiculos  = (idUsuario) => get(`Cliente/${idUsuario}/vehiculos`)
export const getCitas      = (idUsuario) => get(`Cliente/${idUsuario}/citas`)
export const getHistorial  = (idUsuario) => get(`Cliente/${idUsuario}/historial`)
export const getFacturas   = (idUsuario) => get(`Cliente/${idUsuario}/facturas`)
export const getMecanicos  = ()          => get('Auth/mecanicos')
export const postVehiculo  = (idUsuario, data) => post(`Cliente/${idUsuario}/vehiculos`, data)
export const postCita      = (idUsuario, data) => post(`Cliente/${idUsuario}/citas`, data)