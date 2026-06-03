import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerRequest } from "../../services/authService";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    documento: "", // Se eliminó username de aquí
    correo: "",
    telefono: "",
    direccion: "",
    password: "",
    confirmPassword: "",
    terminos: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
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

    setLoading(true);
    try {
      await registerRequest({
        primerNombre: form.primerNombre,
        segundoNombre: form.segundoNombre,
        primerApellido: form.primerApellido,
        segundoApellido: form.segundoApellido,
        documento: form.documento, // Se quitó el parámetro username
        email: form.correo,
        telefono: form.telefono,
        direccion: form.direccion,
        password: form.password,
      });

      navigate("/page/login");
    } catch (err) {
      console.log("STATUS:", err?.status);
      console.log("DATA:", err?.data);
      setError(err?.data?.mensaje || "Error al registrarse. Revisa la consola.");
    } finally {
      setLoading(false);
    }
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
          <div className="rg-row">
            <div className="rg-field">
              <label>Primer nombre <span className="rg-req">*</span></label>
              <input type="text" name="primerNombre" value={form.primerNombre} onChange={handleChange} placeholder="Juan" required />
            </div>
            <div className="rg-field">
              <label>Segundo Nombre <span className="rg-opt">(opcional)</span></label>
              <input type="text" name="segundoNombre" value={form.segundoNombre} onChange={handleChange} placeholder="Carlos" />
            </div>
          </div>

          <div className="rg-row">
            <div className="rg-field">
              <label>Primer Apellido <span className="rg-req">*</span></label>
              <input type="text" name="primerApellido" value={form.primerApellido} onChange={handleChange} placeholder="Pérez" required />
            </div>
            <div className="rg-field">
              <label>Segundo Apellido <span className="rg-opt">(opcional)</span></label>
              <input type="text" name="segundoApellido" value={form.segundoApellido} onChange={handleChange} placeholder="García" />
            </div>
          </div>

          <div className="rg-field">
            <label>Documento <span className="rg-req">*</span></label>
            <input type="text" name="documento" value={form.documento} onChange={handleChange} placeholder="123456789" required />
          </div>

          {/* ❌ SE ELIMINÓ POR COMPLETO EL DIV DEL INPUT USERNAME */}

          <div className="rg-field">
            <label>Correo electrónico <span className="rg-req">*</span></label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="tu@correo.com" required />
          </div>

          <div className="rg-row">
            <div className="rg-field">
              <label>Teléfono <span className="rg-req">*</span></label>
              <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+57 300 000 0000" required />
            </div>
            <div className="rg-field">
              <label>Dirección <span className="rg-req">*</span></label>
              <input type="text" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Calle 10 # 5-23" required />
            </div>
          </div>

          <div className="rg-row">
            <div className="rg-field">
              <label>Contraseña <span className="rg-req">*</span></label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <div className="rg-field">
              <label>Confirmar <span className="rg-req">*</span></label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
            </div>
          </div>

          <div className="rg-check">
            <input type="checkbox" id="terminos" name="terminos" checked={form.terminos} onChange={handleChange} />
            <label htmlFor="terminos">
              Acepto los <a href="#" className="rg-link">términos y condiciones</a>
            </label>
          </div>

          <button type="submit" className="rg-btn" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <div className="rg-divider" />

        <p className="rg-login-text">
          ¿Ya tienes cuenta?{" "}
          <a href="/page/login" className="rg-link-red">Inicia sesión</a>
        </p>

        <div className="rg-back">
          <a href="/" className="rg-link">← Volver al inicio</a>
        </div>
      </div>
    </div>
  );
}