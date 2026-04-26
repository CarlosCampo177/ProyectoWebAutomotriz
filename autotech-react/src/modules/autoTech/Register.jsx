import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    terminos: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("¡Las contraseñas no coinciden!");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (!form.terminos) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    // Todo OK → ir al login
    navigate("/page/login");
  };

  return (
    <div className="rg-bg">
      <div className="rg-card">
        {/* Logo */}
        <div className="rg-logo">
          AUTO<span>TECH</span>
        </div>

        <h2 className="rg-title">Crear cuenta</h2>
        <p className="rg-sub">Regístrate gratis y comienza hoy</p>

        {/* Error */}
        {error && <div className="rg-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="rg-row">
            <div className="rg-field">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Juan"
                required
              />
            </div>
            <div className="rg-field">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          <div className="rg-field">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="rg-field">
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="+57 300 000 0000"
            />
          </div>

          <div className="rg-field">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="rg-field">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="rg-check">
            <input
              type="checkbox"
              id="terminos"
              name="terminos"
              checked={form.terminos}
              onChange={handleChange}
            />
            <label htmlFor="terminos">
              Acepto los{" "}
              <a href="#" className="rg-link">
                términos y condiciones
              </a>
            </label>
          </div>

          <button type="submit" className="rg-btn">
            Crear cuenta
          </button>
        </form>

        <div className="rg-divider" />

        <p className="rg-login-text">
          ¿Ya tienes cuenta?{" "}
          <a href="/page/login" className="rg-link-red">
            Inicia sesión
          </a>
        </p>

        <div className="rg-back">
          <a href="/" className="rg-link">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}