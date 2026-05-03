/* ══════════════════════════════════════════
   AUTOTECH — SECCIÓN FACTURAS
   sections/SecFacturas.jsx
══════════════════════════════════════════ */
import * as Icon from "../icons/Icons";
import "./SecFacturas.css";

/* ── NOTA API ──────────────────────────────
   Props recibidas desde UsuarioApp:
     facturas → GET /api/usuarios/:id/facturas
     Estructura esperada por item:
       {
         id, numero, servicio, vehiculo,
         fecha, total, estado ("pagada" | "pendiente")
       }

   Para descargar PDF de factura (botón futuro):
     GET /api/facturas/:id/pdf
     → devuelve blob o URL firmada para descarga.

   Para pagar factura pendiente (botón futuro):
     POST /api/pagos  body: { facturaId }
     → integración con pasarela de pago.
────────────────────────────────────────── */

export default function SecFacturas({ facturas }) {
  /* ── NOTA API ──────────────────────────────
     Los totales se calculan localmente.
     Con API también pueden venir de:
       GET /api/usuarios/:id/facturas/resumen
       { totalPagado, totalPendiente, cantidad }
  ────────────────────────────────────────── */
  const totalPagado    = (facturas ?? []).reduce((s, f) => s + (f.estado === "pagada"  ? f.total : 0), 0);
  const totalPendiente = (facturas ?? []).reduce((s, f) => s + (f.estado !== "pagada"  ? f.total : 0), 0);

  const resumen = [
    { Icono: Icon.DollarSign, bg: "#e8f5e9", color: "#2e7d32", label: "Total pagado",  val: `$${totalPagado.toLocaleString("es-CO")}` },
    { Icono: Icon.Clock,      bg: "#fff3e0", color: "#e65100", label: "Pendiente",      val: `$${totalPendiente.toLocaleString("es-CO")}` },
    { Icono: Icon.Receipt,    bg: "#e8f0fe", color: "#1a6bdc", label: "Total facturas", val: (facturas ?? []).length },
  ];

  return (
    <div>
      <div className="sf-header-sec">
        <div className="sf-title">Mis Facturas</div>
        <div className="sf-subtitle">Registro de pagos y servicios facturados</div>
      </div>

      {/* Cards resumen */}
      <div className="sf-resumen">
        {resumen.map((r, i) => (
          <div key={i} className="sf-card">
            <div className="sf-card-icon" style={{ background: r.bg, color: r.color }}>
              <r.Icono />
            </div>
            <div>
              <div className="sf-card-label">{r.label}</div>
              <div className="sf-card-value">{r.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      {(!facturas || facturas.length === 0) ? (
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
                  {/* ── NOTA API → f.vehiculo puede ser vehiculo.nombre del join */}
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