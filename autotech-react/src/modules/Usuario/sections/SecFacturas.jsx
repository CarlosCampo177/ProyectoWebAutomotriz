import { useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext';
import "./SecFacturas.css";

export default function SecFacturas() {
  const { user }                    = useAuth();
  const [facturas, setFacturas]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/Cliente/${user.id}/facturas`)
      .then(r => r.json())
      .then(setFacturas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const totalPagado    = facturas.reduce((s, f) => s + (f.estado === "pagada" ? f.total : 0), 0);
  const totalPendiente = facturas.reduce((s, f) => s + (f.estado !== "pagada" ? f.total : 0), 0);

  const resumen = [
    { icon: "bi-currency-dollar", bg: "#e8f5e9", color: "#2e7d32", label: "Total pagado",  val: `$${totalPagado.toLocaleString("es-CO")}` },
    { icon: "bi-clock",           bg: "#fff3e0", color: "#e65100", label: "Pendiente",      val: `$${totalPendiente.toLocaleString("es-CO")}` },
    { icon: "bi-receipt",         bg: "#e8f0fe", color: "#1a6bdc", label: "Total facturas", val: facturas.length },
  ];

  if (loading) return <p style={{ color: "#888" }}>Cargando facturas...</p>;

  return (
    <div>
      <div className="sf-header-sec">
        <div className="sf-title">Mis Facturas</div>
        <div className="sf-subtitle">Registro de pagos y servicios facturados</div>
      </div>

      <div className="sf-resumen">
        {resumen.map((r, i) => (
          <div key={i} className="sf-card">
            <div className="sf-card-icon" style={{ background: r.bg, color: r.color }}>
              <i className={`bi ${r.icon}`} style={{ fontSize: "1.3rem" }} />
            </div>
            <div>
              <div className="sf-card-label">{r.label}</div>
              <div className="sf-card-value">{r.val}</div>
            </div>
          </div>
        ))}
      </div>

      {facturas.length === 0 ? (
        <div className="sf-empty">No tienes facturas registradas.</div>
      ) : (
        <div className="sf-table-wrap">
          <table className="sf-table">
            <thead>
              <tr>
                {["N°", "Servicio", "Vehículo", "Fecha", "Total", "Estado"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facturas.map((f, i) => (
                <tr key={f.id ?? i}>
                  <td className="sf-numero">{f.numero}</td>
                  <td>{f.servicio}</td>
                  <td>{f.vehiculo}</td>
                  <td>{f.fecha}</td>
                  <td>${f.total?.toLocaleString("es-CO")}</td>
                  <td>
                    <span className={`sf-badge sf-badge-${f.estado}`}>
                      {f.estado === "pagada" ? "Pagada" : "Pendiente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}