// src/modules/Mecanico/sections/SecObservaciones.jsx

import { useState } from "react";
import { obsConfig } from "../mecanicoHelpers.jsx";
import { postObservacion } from "../../../services/mecanicoService";

export default function SecObservaciones({ idUsuario, ordenes, observaciones, setObservaciones }) {
  const [nueva,     setNueva]     = useState(false);
  const [ordenId,   setOrdenId]   = useState("");
  const [texto,     setTexto]     = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState("");

  const ordenesActivas = ordenes.filter(o => o.estado !== "completada");

  const handleGuardar = async () => {
    if (!ordenId || !texto.trim()) {
      setError("Selecciona una orden y escribe una observación.");
      return;
    }
    setError("");
    setGuardando(true);
    try {
      const creada = await postObservacion(idUsuario, {
        idOrden: Number(ordenId),
        texto,
      });
      setObservaciones(prev => [creada, ...prev]);
      setNueva(false);
      setTexto("");
      setOrdenId("");
    } catch (e) {
      setError("Error al guardar. Intenta de nuevo.");
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <div className="sec-header">
        <div>
          <h6 className="block-title">Observaciones</h6>
          <p className="block-sub">Notas técnicas sobre los vehículos atendidos</p>
        </div>
        <button className="btn-nueva" onClick={() => { setNueva(!nueva); setError(""); }}>
          <i className="bi bi-plus-lg"></i> Nueva observación
        </button>
      </div>

      {/* Formulario */}
      {nueva && (
        <div className="obs-form-card">
          <div className="obs-form-title">
            <i className="bi bi-pencil-square"></i> Agregar observación
          </div>
          <div className="obs-form-row">
            <select
              className="obs-input"
              value={ordenId}
              onChange={e => setOrdenId(e.target.value)}
            >
              <option value="">Seleccionar orden...</option>
              {ordenesActivas.map(o => (
                <option key={o.id} value={o.id}>
                  {o.vehiculo} — {o.servicio}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p style={{ color: "#c62828", fontSize: "0.82rem", margin: "4px 0" }}>{error}</p>
          )}
          <textarea
            className="obs-textarea"
            placeholder="Escribe aquí la observación técnica..."
            rows={3}
            value={texto}
            onChange={e => setTexto(e.target.value)}
          />
          <div className="obs-form-actions">
            <button className="btn-cancelar" onClick={() => { setNueva(false); setError(""); }}>
              Cancelar
            </button>
            <button className="btn-guardar" onClick={handleGuardar} disabled={guardando}>
              <i className="bi bi-check2"></i> {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="obs-lista">
        {observaciones.length === 0 && (
          <p className="empty-msg">No hay observaciones registradas.</p>
        )}
        {observaciones.map(o => {
          const conf = obsConfig[o.tipo] ?? obsConfig["advertencia"];
          return (
            <div className="obs-card" key={o.id} style={{ borderLeftColor: conf.color }}>
              <div className="obs-header">
                <div className="obs-icon-wrap" style={{ background: conf.bg, color: conf.color }}>
                  <i className={`bi ${conf.icon}`}></i>
                </div>
                <div className="obs-meta">
                  <div className="obs-vehiculo">{o.vehiculo}</div>
                  <div className="obs-sub">
                    <i className="bi bi-person"></i> {o.cliente}
                    &nbsp;·&nbsp;
                    <i className="bi bi-calendar3"></i> {o.fecha}
                  </div>
                </div>
                <span className="obs-tipo-badge" style={{ background: conf.bg, color: conf.color }}>
                  <i className={`bi ${conf.icon}`}></i>
                  {o.tipo.charAt(0).toUpperCase() + o.tipo.slice(1)}
                </span>
              </div>
              <p className="obs-texto">{o.texto}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}