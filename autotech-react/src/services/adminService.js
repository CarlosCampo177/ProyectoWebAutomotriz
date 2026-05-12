import { get, post } from "./apiClient";

const r = (id) => `Admin/${id}`;

export const getAdminPerfil = (id) => get(`${r(id)}/perfil`);
export const getAdminOrdenes = (id) => get(`${r(id)}/ordenes`);
export const getAdminVehiculos = (id) => get(`${r(id)}/vehiculos`);
export const getAdminMecanicos = (id) => get(`${r(id)}/mecanicos`);
export const getAdminServicios = (id) => get(`${r(id)}/servicios`);
export const getAdminOrdenes = (id) => get(`${r(id)}/ordenes`);
export const getAdminFacturacion = (id) => get(`${r(id)}/facturacturacion`);
export const getAdminEstadisticas = (id) => get(`${r(id)}/estadisticas`);
