import { useState } from "react";
import "./Log.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "admin@autotech.com" && password === "123456") {
      window.location.href = "/admin";
    } else if (email === "carlos@email.com" && password === "abcde") {
      window.location.href = "/usuario";
    } else if (email === "oscar@gmail.com" && password === "oscar123") {
      window.location.href = "/usuario";
    } else {
      alert("Correo o contraseña incorrectos. Inténtalo de nuevo");
    }
  };

  return (
    <div className="card-login">
      <span className="logo-text">
        AUTO<span className="logo-tech">TECH</span>
      </span>

      <h2>Bienvenido</h2>
      <p>Inicia sesión para continuar</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" />
            <label className="form-check-label" style={{ fontSize: "0.85rem" }}>
              Recordarme
            </label>
          </div>
          <a href="#" className="link-volver">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button type="submit" className="btn btn-entrar">
          Entrar
        </button>
      </form>

      <div className="divider"></div>

      <p className="texto-registro">
        ¿No tienes cuenta? <a href="#">Regístrate gratis</a>
      </p>

      <div className="text-center mt-3">
        <a href="/" className="link-volver">
          ← Volver al inicio
        </a>
      </div>
    </div>
  );
}
