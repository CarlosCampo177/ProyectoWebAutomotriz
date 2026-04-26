import { useState } from "react";
import { useNavigate } from "react-router-dom";  
import "./Log.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();  

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "admin@autotech.com" && password === "123456") {
      window.location.href = "/admin";
    } else if (email === "carlos@email.com" && password === "abcde") {
      window.location.href = "/admin";
    } else if (email === "oscar@gmail.com" && password === "oscar123") {
      window.location.href = "/admin";
    } else {
      alert("Correo o contraseña incorrectos. Inténtalo de nuevo");
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

            <div className="fila">
              <label className="recordar-usuario">
                <input type="checkbox" />
                Recordarme
              </label>
              <a href="#" className="recordatorio">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="btnEntrar">
              Entrar
            </button>
          </form>

          <hr className="separador" />

          <p className="texto-registro">
            ¿No tienes cuenta? <a href="#">Regístrate gratis</a>
          </p>

          <a href="/" className="boton-volver">
             Volver al inicio
          </a>
        </div>
      </div>
    </>
  );
}
