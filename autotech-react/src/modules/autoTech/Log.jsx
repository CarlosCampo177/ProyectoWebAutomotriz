import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginRequest } from "../../services/authService";
import "./Log.css";

export default function Login() {
  // 1. Estados para el formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. Parámetros de URL y navegación
  const [searchParams] = useSearchParams();
  const activado = searchParams.get("activado"); // Captura ?activado=true si viene de la página de activación

  const { login } = useAuth();
  const navigate = useNavigate();

  // 3. Manejador del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Enviamos email y password al servicio de autenticación
      const userData = await loginRequest(email, password);
      login(userData);

      // Redirección dinámica según el rol del usuario asignado en el backend
      if (userData.rol === "admin")     navigate("/admin/inicio");
      if (userData.rol === "mecanico")  navigate("/mecanico");
      if (userData.rol === "cliente")   navigate("/usuario");

    } catch (err) {
      setError(err?.data?.mensaje || "Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="body">
        <div className="tarjeta-login">
          <span className="logo-texto">
            AUTO<span className="logo-acento">TECH</span>
          </span>

          <h2 className="titulo">Bienvenido</h2>
          <p className="subtitulo">Inicia sesión para continuar</p>

          {activado === "true" && (
            <div style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.88rem',
              textAlign: 'center',
              fontWeight: '500',
              border: '1px solid #bbf7d0'
            }}>
              ✅ ¡Cuenta activada con éxito! Ya puedes iniciar sesión.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Campo de Correo Electrónico */}
            <div className="campo">
              <label className="etiqueta">Correo electrónico</label>
              <input
                type="email" 
                className="entrada"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Campo de Contraseña */}
            <div className="campo">
              <label className="etiqueta">Contraseña</label>
              <input
                type="password"
                className="entrada"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Renderizado de errores del Backend */}
            {error && (
              <p style={{ color: '#d90429', fontSize: '0.82rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <div className="fila">
              <label className="recordar-usuario">
                <input type="checkbox" />
                Recordarme
              </label>
              <a href="#" className="recordatorio">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de acción principal */}
            <button type="submit" className="btnEntrar" disabled={loading}>
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>

          <hr className="separador" />

          <p className="texto-registro">
            ¿No tienes cuenta? <a href="/page/register">Regístrate gratis</a>
          </p>

          <a href="/" className="boton-volver">
            Volver al inicio
          </a>
        </div>
      </div>
    </>
  );
}