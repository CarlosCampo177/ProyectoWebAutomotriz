// src/modules/Mecanico/sections/SecVehiculos.jsx

import { estadoConfig, Badge } from "../mecanicoHelpers.jsx";

export default function SecVehiculos({ vehiculosAsignados }) {
  return (
    <div>
      <div className="sec-header">
        <div>
          <h6 className="block-title">Vehículos Asignados</h6>
          <p className="block-sub">Vehículos que tienes actualmente a cargo</p>
        </div>
      </div>

      {vehiculosAsignados.length === 0 && (
        <p className="empty-msg">No tienes vehículos asignados actualmente.</p>
      )}

      <div className="veh-grid">
        {vehiculosAsignados.map(v => (
          <div className="veh-card" key={v.id}>
            <div className="veh-card-top">
              <div className={`veh-icon-wrap ${v.colorWrap}`}>
                <i className="bi bi-car-front-fill"></i>
              </div>
            </div>
            <div className="veh-card-body">
              <div className="veh-card-name">{v.nombre}</div>
              <div className="veh-card-plate">{v.placa} &nbsp;·&nbsp; {v.anio}</div>
              <div className="veh-card-stats">
                <div className="veh-stat">
                  <span className="veh-stat-label">Kilometraje</span>
                  <span className={`veh-stat-val ${v.km >= 80000 ? "warn" : ""}`}>
                    {v.km?.toLocaleString("es-CO")} km {v.km >= 80000 ? "⚠" : ""}
                  </span>
                </div>
                <div className="veh-stat">
                  <span className="veh-stat-label">Combustible</span>
                  <span className="veh-stat-val">{v.combustible}</span>
                </div>
                <div className="veh-stat">
                  <span className="veh-stat-label">Color</span>
                  <span className="veh-stat-val">{v.color}</span>
                </div>
                <div className="veh-stat">
                  <span className="veh-stat-label">Cliente</span>
                  <span className="veh-stat-val">{v.cliente}</span>
                </div>
              </div>
              {v.km >= 80000 && (
                <div className="km-alert">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  Supera 80,000 km — revisión preventiva recomendada
                </div>
              )}
              <div className="servicio-actual">
                <i className="bi bi-wrench-adjustable"></i> {v.servicio}
              </div>
            </div>
            <div className="veh-card-footer">
              <Badge tipo={v.estado} config={estadoConfig} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}