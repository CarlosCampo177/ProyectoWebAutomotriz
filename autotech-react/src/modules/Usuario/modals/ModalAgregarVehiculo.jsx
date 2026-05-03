/* ══════════════════════════════════════════
   AUTOTECH — MODAL AGREGAR VEHÍCULO
   modals/ModalAgregarVehiculo.jsx
══════════════════════════════════════════ */
import { useState } from "react";
import "./ModalAgregarVehiculo.css";

function FieldGroup({ label, error, children, style }) {
  return (
    <div className="field-group" style={style}>
      <label>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default function ModalAgregarVehiculo({ onClose, onSave }) {
  /* ── NOTA API ──────────────────────────────
     onSave recibe el objeto del nuevo vehículo.
     UsuarioApp hace:
       POST /api/usuarios/:id/vehiculos
     Body:
       {
         nombre, placa, anio, km,
         combustible, color, icono, colorWrap
       }
     Respuesta esperada: { id, ...datosVehiculo }
     Con ese id se actualiza el estado local.
  ────────────────────────────────────────── */

  const [form, setForm] = useState({
    nombre:      "",
    placa:       "",
    anio:        "",
    km:          "",
    combustible: "Gasolina",
    color:       "",
    icono:       "car",
    colorWrap:   "blue",
  });
  const [errors, setErrors] = useState({});

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa la marca y modelo";
    if (!form.placa.trim())  e.placa  = "Ingresa la placa";
    if (!form.anio || isNaN(form.anio) || form.anio < 1990 || form.anio > new Date().getFullYear() + 1)
      e.anio = "Año inválido";
    if (!form.km || isNaN(form.km) || Number(form.km) < 0)
      e.km = "Kilometraje inválido";
    if (!form.color.trim()) e.color = "Ingresa el color";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleGuardar() {
    if (!validate()) return;
    const km = parseInt(form.km);
    onSave({
      nombre:        form.nombre.trim(),
      placa:         form.placa.trim().toUpperCase(),
      anio:          parseInt(form.anio),
      km,
      combustible:   form.combustible,
      color:         form.color.trim(),
      ultimoServicio:"Sin registro",
      estado:        km >= 80000 ? "warn" : "ok",
      icono:         form.icono,
      colorWrap:     form.colorWrap,
    });
  }

  const coloresCard = [
    { val: "blue",   label: "Azul",    bg: "#e8f0fe", c: "#1a6bdc" },
    { val: "orange", label: "Naranja", bg: "#fff3e0", c: "#e65100" },
    { val: "green",  label: "Verde",   bg: "#e8f5e9", c: "#2e7d32" },
  ];

  return (
    <div className="mav-fields">
      {/* Marca y modelo */}
      <FieldGroup label="Marca y Modelo *" error={errors.nombre}>
        <input
          className="mav-input"
          value={form.nombre}
          onChange={e => set("nombre", e.target.value)}
          placeholder="Ej: Toyota Corolla"
        />
      </FieldGroup>

      {/* Placa y año */}
      <div className="mav-row">
        <FieldGroup label="Placa *" error={errors.placa} style={{ flex: 1 }}>
          <input
            className="mav-input"
            value={form.placa}
            onChange={e => set("placa", e.target.value)}
            placeholder="ABC-123"
          />
        </FieldGroup>
        <FieldGroup label="Año *" error={errors.anio} style={{ flex: 1 }}>
          <input
            className="mav-input"
            type="number"
            value={form.anio}
            onChange={e => set("anio", e.target.value)}
            placeholder="2020"
          />
        </FieldGroup>
      </div>

      {/* Km y combustible */}
      <div className="mav-row">
        <FieldGroup label="Kilometraje actual *" error={errors.km} style={{ flex: 1 }}>
          <input
            className="mav-input"
            type="number"
            value={form.km}
            onChange={e => set("km", e.target.value)}
            placeholder="45000"
          />
        </FieldGroup>
        <FieldGroup label="Combustible" style={{ flex: 1 }}>
          {/* ── NOTA API ──────────────────────────
              Tipos de combustible → GET /api/catalogos/combustibles
              o dejarlos hardcoded si son estáticos.
          ───────────────────────────────────────── */}
          <select
            className="mav-select"
            value={form.combustible}
            onChange={e => set("combustible", e.target.value)}
          >
            <option>Gasolina</option>
            <option>Diésel</option>
            <option>Híbrido</option>
            <option>Eléctrico</option>
            <option>Gas Natural</option>
          </select>
        </FieldGroup>
      </div>

      {/* Color */}
      <FieldGroup label="Color *" error={errors.color}>
        <input
          className="mav-input"
          value={form.color}
          onChange={e => set("color", e.target.value)}
          placeholder="Ej: Blanco"
        />
      </FieldGroup>

      {/* Tipo de vehículo */}
      <FieldGroup label="Tipo de vehículo">
        <div className="mav-toggle-row">
          {[
            { val: "car",   label: "Auto"          },
            { val: "truck", label: "SUV / Camioneta"},
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => set("icono", opt.val)}
              className={`mav-toggle-btn${form.icono === opt.val ? " active-blue" : ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FieldGroup>

      {/* Color de tarjeta */}
      <FieldGroup label="Color de tarjeta">
        <div className="mav-toggle-row">
          {coloresCard.map(c => (
            <button
              key={c.val}
              onClick={() => set("colorWrap", c.val)}
              className="mav-toggle-btn"
              style={{
                borderColor: form.colorWrap === c.val ? c.c : "#e2e6ef",
                background:  form.colorWrap === c.val ? c.bg : "#fff",
                color:       form.colorWrap === c.val ? c.c : "#5a6a8a",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </FieldGroup>

      {/* Acciones */}
      <div className="mav-actions">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary"   onClick={handleGuardar}>Agregar vehículo</button>
      </div>
    </div>
  );
}