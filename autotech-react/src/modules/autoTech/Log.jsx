import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Log.css";

// ── DATOS DE PRUEBA ──────────────────────────────────────
// TODO: reemplazar con POST /api/auth/login
// El servidor devuelve: { token, user: { id, nombre, rol,
//   iniciales, cedula, correo, telefono, ciudad } }
// Guardar el token en localStorage y el user en AuthContext
const MOCK_USERS = {
  "admin@autotech.com": {
    nombre: "Admin General", rol: "admin",    iniciales: "AG",
    cedula: "000000000",     correo: "admin@autotech.com",
    telefono: "300-000-0000", ciudad: "Bogotá, Colombia",
    password: "123456", ruta: "/admin/inicio"
  },
  "carlos@email.com": {
    nombre: "Carlos López",  rol: "cliente",  iniciales: "CL",
    cedula: "1234567890",    correo: "carlos@email.com",
    telefono: "301-555-1234", ciudad: "Medellín, Colombia",
    password: "abcde", ruta: "/usuario"
  },
  "oscar@gmail.com": {
    nombre: "Oscar Avila",   rol: "mecanico", iniciales: "OA",
    cedula: "1067595713",    correo: "oscar@gmail.com",
    telefono: "300-555-7890", ciudad: "Valledupar, Colombia",
    password: "oscar123", ruta: "/mecanico"
  },
};
// ────────────────────────────────────────────────────────

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ── TODO API ─────────────────────────────────────────
    // const res = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ correo: email, password })
    // })
    // if (!res.ok) { setError("Correo o contraseña incorrectos."); return; }
    // const data = await res.json()
    // localStorage.setItem('token', data.token)
    // login(data.user)
    // const rutas = { admin: '/admin/inicio', cliente: '/usuario', mecanico: '/mecanico' }
    // navigate(rutas[data.user.rol])
    // ─────────────────────────────────────────────────────

    // Simulado hasta que exista la API:
    const found = MOCK_USERS[email];
    if (!found || found.password !== password) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    const { password: _, ruta, ...userData } = found;
    login(userData);
    navigate(ruta);
  };

  return (
    <>
      <div className="body">
        <div className="tarjeta-login">
          <span className="logo-texto">AUTO<span className="logo-acento">TECH</span></span>
          <h2 className="titulo">Bienvenido</h2>
          <p className="subtitulo">Inicia sesión para continuar</p>

          <form onSubmit={handleSubmit}>
            <div className="campo">
              <label className="etiqueta">Correo electrónico</label>
              <input type="email" className="entrada" placeholder="tu@correo.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="campo">
              <label className="etiqueta">Contraseña</label>
              <input type="password" className="entrada" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {error && (
              <p style={{ color: "red", fontSize: "0.85rem", margin: "4px 0" }}>
                {error}
              </p>
            )}

            <div className="fila">
              <label className="recordar-usuario">
                <input type="checkbox" /> Recordarme
              </label>
              <a href="#" className="recordatorio">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="btnEntrar">Entrar</button>
          </form>

          <hr className="separador" />
          <p className="texto-registro">
            ¿No tienes cuenta? <a href="/page/register">Regístrate gratis</a>
          </p>
          <a href="/" className="boton-volver">Volver al inicio</a>
        </div>
      </div>
    </>
  );
}