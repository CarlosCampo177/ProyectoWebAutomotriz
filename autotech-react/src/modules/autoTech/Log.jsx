import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginRequest } from "../../services/authService";
import "./Log.css";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = await loginRequest(email, password);

      // Guarda el usuario en el contexto global
      login(userData);

      // Redirige según el rol que devuelve la API
      if (userData.rol === "admin")    navigate("/admin/inicio");
      if (userData.rol === "mecanico") navigate("/mecanico");
      if (userData.rol === "cliente")  navigate("/usuario");

    } catch {
      setError("Correo o contraseña incorrectos");
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

          <form onSubmit={handleSubmit}>
            <div className="campo">
              <label className="etiqueta">Correo electrónico</label>
              <input
                type="email"
                className="entrada"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="campo">
              <label className="etiqueta">Contraseña</label>
              <input
                type="password"
                className="entrada"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p style={{ color: '#d90429', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
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