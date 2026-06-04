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
    documento: "",
    correo: "",
    telefono: "",
    direccion: "",
    password: "",
    confirmPassword: "",
    terminos: false,
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // Maneja errores específicos por input
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validar = () => {
    const errs = {};
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    const soloNums = /^\d+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Primer Nombre
    if (!form.primerNombre.trim()) {
      errs.primerNombre = "El primer nombre es requerido.";
    } else if (!soloLetras.test(form.primerNombre)) {
      errs.primerNombre = "Solo se permiten letras.";
    }

    // Segundo Nombre
    if (form.segundoNombre && !soloLetras.test(form.segundoNombre)) {
      errs.segundoNombre = "Solo se permiten letras.";
    }

    // Primer Apellido
    if (!form.primerApellido.trim()) {
      errs.primerApellido = "El primer apellido es requerido.";
    } else if (!soloLetras.test(form.primerApellido)) {
      errs.primerApellido = "Solo se permiten letras.";
    }

    // Segundo Apellido
    if (form.segundoApellido && !soloLetras.test(form.segundoApellido)) {
      errs.segundoApellido = "Solo se permiten letras.";
    }

    // Documento
    if (!form.documento.trim()) {
      errs.documento = "El documento es requerido.";
    } else if (!soloNums.test(form.documento)) {
      errs.documento = "Solo se permiten números.";
    } else if (form.documento.length < 8 || form.documento.length > 10) {
      errs.documento = "El documento debe tener entre 8 y 10 dígitos.";
    }

    // Correo Electrónico
    if (!form.correo.trim()) {
      errs.correo = "El email es requerido.";
    } else if (!emailRegex.test(form.correo)) {
      errs.correo = "Ingresa un email válido. Ej: usuario@correo.com";
    }

    // Teléfono
    if (!form.telefono.trim()) {
      errs.telefono = "El teléfono es requerido.";
    } else if (!soloNums.test(form.telefono)) {
      errs.telefono = "Solo se permiten números.";
    } else if (form.telefono.length !== 10) {
      errs.telefono = "El teléfono debe tener 10 dígitos.";
    }

    // Dirección
    if (!form.direccion.trim()) {
      errs.direccion = "La dirección es requerida.";
    }

    // Contraseña
    if (!form.password.trim()) {
      errs.password = "La contraseña es requerida.";
    } else if (form.password.length < 6) {
      errs.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    // Confirmar Contraseña
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "¡Las contraseñas no coinciden!";
    }

    // Términos y condiciones
    if (!form.terminos) {
      errs.terminos = "Debes aceptar los términos y condiciones.";
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Corrige los errores para registrar al cliente.");
      return;
    }

    setLoading(true);
    try {
      await registerRequest({
        primerNombre: form.primerNombre,
        segundoNombre: form.segundoNombre,
        primerApellido: form.primerApellido,
        segundoApellido: form.segundoApellido,
        documento: form.documento,
        email: form.correo,
        telefono: form.telefono,
        direccion: form.direccion,
        password: form.password,
      });

      navigate("/page/login");
    } catch (err) {
      console.log("STATUS:", err?.status);
      console.log("DATA:", err?.data);
      setError(
        err?.data?.mensaje || "Error al registrarse. Revisa la consola.",
      );
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="rg-row">
            <div className="rg-field">
              <label>
                Primer nombre <span className="rg-req">*</span>
              </label>
              <input
                type="text"
                name="primerNombre"
                value={form.primerNombre}
                onChange={handleChange}
                placeholder="Juan"
                className={fieldErrors.primerNombre ? "input-error" : ""}
              />
              {fieldErrors.primerNombre && (
                <span className="rg-field-error">
                  {fieldErrors.primerNombre}
                </span>
              )}
            </div>
            <div className="rg-field">
              <label>
                Segundo Nombre <span className="rg-opt">(opcional)</span>
              </label>
              <input
                type="text"
                name="segundoNombre"
                value={form.segundoNombre}
                onChange={handleChange}
                placeholder="Carlos"
                className={fieldErrors.segundoNombre ? "input-error" : ""}
              />
              {fieldErrors.segundoNombre && (
                <span className="rg-field-error">
                  {fieldErrors.segundoNombre}
                </span>
              )}
            </div>
          </div>

          <div className="rg-row">
            <div className="rg-field">
              <label>
                Primer Apellido <span className="rg-req">*</span>
              </label>
              <input
                type="text"
                name="primerApellido"
                value={form.primerApellido}
                onChange={handleChange}
                placeholder="Pérez"
                className={fieldErrors.primerApellido ? "input-error" : ""}
              />
              {fieldErrors.primerApellido && (
                <span className="rg-field-error">
                  {fieldErrors.primerApellido}
                </span>
              )}
            </div>
            <div className="rg-field">
              <label>
                Segundo Apellido <span className="rg-opt">(opcional)</span>
              </label>
              <input
                type="text"
                name="segundoApellido"
                value={form.segundoApellido}
                onChange={handleChange}
                placeholder="García"
                className={fieldErrors.segundoApellido ? "input-error" : ""}
              />
              {fieldErrors.segundoApellido && (
                <span className="rg-field-error">
                  {fieldErrors.segundoApellido}
                </span>
              )}
            </div>
          </div>

          <div className="rg-field">
            <label>
              Documento <span className="rg-req">*</span>
            </label>
            <input
              type="text"
              name="documento"
              value={form.documento}
              onChange={handleChange}
              placeholder="123456789"
              className={fieldErrors.documento ? "input-error" : ""}
            />
            {fieldErrors.documento && (
              <span className="rg-field-error">{fieldErrors.documento}</span>
            )}
          </div>

          <div className="rg-field">
            <label>
              Correo electrónico <span className="rg-req">*</span>
            </label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="tu@correo.com"
              className={fieldErrors.correo ? "input-error" : ""}
            />
            {fieldErrors.correo && (
              <span className="rg-field-error">{fieldErrors.correo}</span>
            )}
          </div>

          <div className="rg-row">
            <div className="rg-field">
              <label>
                Teléfono <span className="rg-req">*</span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="3001234567"
                className={fieldErrors.telefono ? "input-error" : ""}
              />
              {fieldErrors.telefono && (
                <span className="rg-field-error">{fieldErrors.telefono}</span>
              )}
            </div>
            <div className="rg-field">
              <label>
                Dirección <span className="rg-req">*</span>
              </label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Calle 10 # 5-23"
                className={fieldErrors.direccion ? "input-error" : ""}
              />
              {fieldErrors.direccion && (
                <span className="rg-field-error">{fieldErrors.direccion}</span>
              )}
            </div>
          </div>

          <div className="rg-row">
            <div className="rg-field">
              <label>
                Contraseña <span className="rg-req">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={fieldErrors.password ? "input-error" : ""}
              />
              {fieldErrors.password && (
                <span className="rg-field-error">{fieldErrors.password}</span>
              )}
            </div>
            <div className="rg-field">
              <label>
                Confirmar <span className="rg-req">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={fieldErrors.confirmPassword ? "input-error" : ""}
              />
              {fieldErrors.confirmPassword && (
                <span className="rg-field-error">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          <div className="rg-check-container">
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
            {fieldErrors.terminos && (
              <span className="rg-field-error block-error">
                {fieldErrors.terminos}
              </span>
            )}
          </div>

          <button type="submit" className="rg-btn" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
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
