import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    username: "",
    correo: "",
    telefono: "",
    direccion: "",
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

    navigate("/page/login");
  };

  return (
    <div className="rg-bg">
      <div className="rg-card">
        <div className="rg-logo">
          AUTO<span>TECH</span>
        </div>

        <h2 className="rg-title">Crear cuenta</h2>
        <p className="rg-sub">Regístrate gratis y comienza hoy</p>

        {error && <div className="rg-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* Nombres */}

          <div className="rg-row">
            <div className="rg-field">
              <label>Primer nombre <span className="rg-req">*</span></label>
              <input
                type="text"
                name="primerNombre"
                value={form.primerNombre}
                onChange={handleChange}
                placeholder="Juan"
                required
              />
            </div>
            <div className="rg-field">
              <label>Segundo Nombre <span className="rg-opt">(opcional)</span></label>
              <input
                type="text"
                name="segundoNombre"
                value={form.segundoNombre}
                onChange={handleChange}
                placeholder="Carlos"
              />
            </div>
          </div>

          {/* Apellidos */}
          <div className="rg-row">
            <div className="rg-field">
              <label>Primer Apellido <span className="rg-req">*</span></label>
              <input
                type="text"
                name="primerApellido"
                value={form.primerApellido}
                onChange={handleChange}
                placeholder="Pérez"
                required
              />
            </div>
            <div className="rg-field">
              <label>Segundo Apellido <span className="rg-opt">(opcional)</span></label>
              <input
                type="text"
                name="segundoApellido"
                value={form.segundoApellido}
                onChange={handleChange}
                placeholder="García"
              />
            </div>
          </div>

          {/* Cuenta */}


          <div className="rg-field">
            <label>Nombre de usuario <span className="rg-req">*</span></label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="juan_perez"
              required
            />
          </div>

          <div className="rg-field">
            <label>Correo electrónico <span className="rg-req">*</span></label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="rg-row">
            <div className="rg-field">
              <label>Teléfono <span className="rg-req">*</span></label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="+57 300 000 0000"
                required
              />
            </div>
            <div className="rg-field">
              <label>Dirección <span className="rg-req">*</span></label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Calle 10 # 5-23"
                required
              />
            </div>
          </div>

          {/* Contraseñas */}
          <div className="rg-row">
            <div className="rg-field">
              <label>Contraseña <span className="rg-req">*</span></label>
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
              <label>Confirmar <span className="rg-req">*</span></label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Términos */}
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