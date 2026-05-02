/* ══════════════════════════════════════════
   AUTOTECH — TOAST
   modals/Toast.jsx

   Notificación no bloqueante.
   Reemplaza el ModalExito centrado.
   Aparece en la esquina inferior derecha y
   desaparece automáticamente.
══════════════════════════════════════════ */
import { useEffect } from "react";
import * as Icon from "../icons/Icons";
import "./Toast.css";

const TIPOS = {
  success: { cls: "toast-success", Icono: Icon.Check },
  error:   { cls: "toast-error",   Icono: Icon.X     },
};

export default function Toast({ mensaje, tipo = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  const { cls, Icono } = TIPOS[tipo] ?? TIPOS.success;

  return (
    <div className={`toast ${cls}`} role="alert">
      <div className="toast-icon">
        <Icono />
      </div>
      <span className="toast-msg">{mensaje}</span>
      <button className="toast-close" onClick={onClose} aria-label="Cerrar">
        <Icon.X />
      </button>
    </div>
  );
}