/* ══════════════════════════════════════════
   AUTOTECH — SLIDE PANEL
   modals/SlidePanel.jsx

   Panel lateral deslizante reutilizable.
   Envuelve ModalAgendarCita y ModalAgregarVehiculo.
   Reemplaza el modal centrado flotante por un
   panel que entra desde la derecha.
══════════════════════════════════════════ */
import { useEffect } from "react";
import * as Icon from "../icons/Icons";
import "./SlidePanel.css";

export default function SlidePanel({ open, onClose, title, subtitle, children }) {
  /* Bloquear scroll del body mientras el panel está abierto */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div className="sp-overlay" onClick={onClose} />

      {/* Panel */}
      <aside className="sp-panel">
        {/* Header del panel */}
        <div className="sp-header">
          <div>
            <div className="sp-title">{title}</div>
            {subtitle && <div className="sp-subtitle">{subtitle}</div>}
          </div>
          <button className="sp-close" onClick={onClose} aria-label="Cerrar panel">
            <Icon.X />
          </button>
        </div>

        {/* Contenido — aquí va el formulario */}
        <div className="sp-body">
          {children}
        </div>
      </aside>
    </>
  );
}