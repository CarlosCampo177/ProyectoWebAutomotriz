import { useEffect } from "react";
import "./Inicio.css";
import ComoFunciona from "./ComoFunciona";

export default function Inicio() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".fade-in").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className="at-navbar">
        <a className="at-brand" href="#">AUTOTECH</a>
        <div className="at-actions">
          <a href="/page/login" className="at-btn">Iniciar sesión</a>
          <a href="/page/register" className="at-btn">Registrarse</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="at-hero">
        <div className="at-hero-row">
          <div className="at-hero-text">
            <h1 className="at-titulo">El software que tu taller necesita</h1>
            <p className="at-texto">
              AutoTech es un sistema de gestión para talleres mecánicos en la
              nube, administra clientes, vehículos, mecánicos, citas y
              facturación desde un solo lugar — sin instalaciones, sin
              complicaciones.
            </p>
            <a href="/page/register" className="at-btn-leer">Empieza gratis</a>
          </div>
          <div className="at-hero-img">
            <img
              src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1400&q=85"
              alt="Taller AutoTech"
            />
          </div>
        </div>
      </section>

      {/* QUÉ ES */}
      <section className="at-what">
        <p className="at-label">Sistema SaaS</p>
        <h2 className="fade-in">
          El Sistema de Gestión que tu Taller <span>Merece</span>
        </h2>
        <p className="at-what-desc fade-in">
          AutoTech centraliza toda la operación de tu taller en la nube —
          clientes, vehículos, mecánicos, citas y facturación — accesible desde
          cualquier dispositivo, sin instalaciones.
        </p>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="at-features-new">
        <div className="at-features-header">
          <p className="at-label">Módulos</p>
          <h2 className="fade-in">Todo lo que Necesitas, en un Solo Lugar</h2>
          <p className="fade-in">
            Seis módulos diseñados para el flujo real de un taller moderno.
          </p>
        </div>
        <div className="at-grid">
          <div className="at-card fade-in">
            <div className="at-card-icon">
              <i className="bi bi-clipboard2-pulse"></i>
            </div>
            <h3>Órdenes y Citas</h3>
            <p>
              Atenciones inmediatas y citas programadas con estados y
              prioridades en tiempo real.
            </p>
            <span className="at-card-tag">Diferencial</span>
          </div>
          <div className="at-card fade-in">
            <div className="at-card-icon">
              <i className="bi bi-people"></i>
            </div>
            <h3>Clientes y Vehículos</h3>
            <p>
              Registra, consulta y asocia cada cliente con sus vehículos e
              historial completo de servicios.
            </p>
          </div>
          <div className="at-card fade-in">
            <div className="at-card-icon">
              <i className="bi bi-person-gear"></i>
            </div>
            <h3>Gestión de Mecánicos</h3>
            <p>
              Asigna órdenes, visualiza carga de trabajo y registra
              observaciones por servicio.
            </p>
          </div>
          <div className="at-card fade-in">
            <div className="at-card-icon">
              <i className="bi bi-receipt-cutoff"></i>
            </div>
            <h3>Facturación</h3>
            <p>
              Pagos, ingresos y gastos en un panel. Reportes por período para
              tomar mejores decisiones.
            </p>
          </div>
          <div className="at-card fade-in">
            <div className="at-card-icon">
              <i className="bi bi-box-seam"></i>
            </div>
            <h3>Venta de Productos</h3>
            <p>
              SOAT, tecnomecánica, seguros y repuestos básicos — todo desde la
              misma plataforma.
            </p>
          </div>
          <div className="at-card fade-in">
            <div className="at-card-icon">
              <i className="bi bi-robot"></i>
            </div>
            <h3>Agente IA + Alertas</h3>
            <p>
              Alertas preventivas e inteligencia artificial para optimizar la
              operación diaria del taller.
            </p>
            <span className="at-card-tag">Diferencial</span>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="at-roles-new">
        <div className="at-roles-header">
          <p className="at-label">Accesos</p>
          <h2 className="fade-in">Un sistema, Tres Perfiles</h2>
          <p className="fade-in">
            Cada usuario ve y hace exactamente lo que necesita.
          </p>
        </div>
        <div className="at-roles-grid">
          <div className="at-role fade-in">
            <div className="at-role-head">
              <div className="at-role-avatar admin">
                <i className="bi bi-shield-check"></i>
              </div>
              <h3>
                Administrador<small>Control total del taller</small>
              </h3>
            </div>
            <ul>
              <li>
                <i className="bi bi-check2"></i> Dashboard con indicadores clave
              </li>
              <li>
                <i className="bi bi-check2"></i> Gestión de clientes, vehículos
                y mecánicos
              </li>
              <li>
                <i className="bi bi-check2"></i> Catálogo de servicios
                configurable
              </li>
              <li>
                <i className="bi bi-check2"></i> Facturación y estadísticas
              </li>
            </ul>
          </div>
          <div className="at-role fade-in">
            <div className="at-role-head">
              <div className="at-role-avatar mec">
                <i className="bi bi-tools"></i>
              </div>
              <h3>
                Mecánico<small>Vista operativa</small>
              </h3>
            </div>
            <ul>
              <li>
                <i className="bi bi-check2"></i> Mis órdenes asignadas
              </li>
              <li>
                <i className="bi bi-check2"></i> Vehículos a atender hoy
              </li>
              <li>
                <i className="bi bi-check2"></i> Registro de servicios
                realizados
              </li>
              <li>
                <i className="bi bi-check2"></i> Observaciones por orden
              </li>
            </ul>
          </div>
          <div className="at-role fade-in">
            <div className="at-role-head">
              <div className="at-role-avatar cli">
                <i className="bi bi-person-circle"></i>
              </div>
              <h3>
                Cliente<small>Portal propio</small>
              </h3>
            </div>
            <ul>
              <li>
                <i className="bi bi-check2"></i> Historial de servicios
              </li>
              <li>
                <i className="bi bi-check2"></i> Mis vehículos registrados
              </li>
              <li>
                <i className="bi bi-check2"></i> Programar citas
              </li>
              <li>
                <i className="bi bi-check2"></i> Recordatorios automáticos
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="at-cta-new">
        <h2 className="fade-in">¿Listo para digitalizar tu taller?</h2>
        <p className="fade-in">
          Regístrate hoy y empieza a gestionar tu taller de forma profesional.
        </p>
        <a href="/page/register" className="at-cta-btn fade-in">
          <i className="bi bi-lightning-charge-fill"></i>
          Crear cuenta gratis
        </a>
        <p className="at-cta-note fade-in">
          <i className="bi bi-shield-lock-fill"></i>
          Sin tarjeta de crédito · Cancela cuando quieras
        </p>
      </section>

      <ComoFunciona />
    </>
  );
}