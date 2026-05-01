import { useEffect } from "react";
import "./Inicio.css";
import ComoFunciona from "./ComoFunciona";

export default function Inicio() {
  useEffect(() => {
  const timer = setTimeout(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    document.querySelectorAll(".fade-in").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, 100);

  return () => clearTimeout(timer);
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

            {/* MEMBRESÍAS */}
      <section className="at-planes">
        <div className="at-planes-header">
          <p className="at-label">Planes</p>
          <h2 className="fade-in">Elige el plan para tu taller</h2>
          <p className="fade-in">Sin contratos. Cambia o cancela cuando quieras.</p>
        </div>
        <div className="at-planes-grid">
          <div className="at-plan fade-in">
            <div className="at-plan-top">
              <span className="at-plan-nombre">Básico</span>
              <div className="at-plan-precio">
                <span className="at-plan-monto">$29</span>
                <span className="at-plan-periodo">/ mes</span>
              </div>
              <p className="at-plan-desc">
                Ideal para talleres pequeños que quieren dar el primer paso digital.
              </p>
            </div>
            <ul className="at-plan-lista">
              <li><i className="bi bi-check2-circle"></i> Hasta 2 mecánicos</li>
              <li><i className="bi bi-check2-circle"></i> 50 órdenes / mes</li>
              <li><i className="bi bi-check2-circle"></i> Gestión de clientes y vehículos</li>
              <li><i className="bi bi-check2-circle"></i> Citas y agenda básica</li>
              <li className="at-plan-no"><i className="bi bi-x-circle"></i> Facturación avanzada</li>
              <li className="at-plan-no"><i className="bi bi-x-circle"></i> Agente IA</li>
            </ul>
            <a href="/page/register" className="at-plan-btn at-plan-btn--outline">
              Empezar gratis
            </a>
          </div>
 
          <div className="at-plan at-plan--pro fade-in">
            <div className="at-plan-badge">Más popular</div>
            <div className="at-plan-top">
              <span className="at-plan-nombre">Pro</span>
              <div className="at-plan-precio">
                <span className="at-plan-monto">$79</span>
                <span className="at-plan-periodo">/ mes</span>
              </div>
              <p className="at-plan-desc">
                Para talleres en crecimiento que necesitan control total de su operación.
              </p>
            </div>
            <ul className="at-plan-lista">
              <li><i className="bi bi-check2-circle"></i> Hasta 8 mecánicos</li>
              <li><i className="bi bi-check2-circle"></i> Órdenes ilimitadas</li>
              <li><i className="bi bi-check2-circle"></i> Facturación y reportes</li>
              <li><i className="bi bi-check2-circle"></i> Venta de productos (SOAT, seguros)</li>
              <li><i className="bi bi-check2-circle"></i> Portal del cliente</li>
              <li className="at-plan-no"><i className="bi bi-x-circle"></i> Agente IA</li>
            </ul>
            <a href="/page/register" className="at-plan-btn at-plan-btn--solid">
              Elegir Pro
            </a>
          </div>
 
          <div className="at-plan fade-in">
            <div className="at-plan-top">
              <span className="at-plan-nombre">Empresarial</span>
              <div className="at-plan-precio">
                <span className="at-plan-monto">$149</span>
                <span className="at-plan-periodo">/ mes</span>
              </div>
              <p className="at-plan-desc">
                Para redes de talleres o franquicias que requieren potencia máxima.
              </p>
            </div>
            <ul className="at-plan-lista">
              <li><i className="bi bi-check2-circle"></i> Mecánicos ilimitados</li>
              <li><i className="bi bi-check2-circle"></i> Multi-sede</li>
              <li><i className="bi bi-check2-circle"></i> Todo lo del plan Pro</li>
              <li><i className="bi bi-check2-circle"></i> Agente IA + Alertas</li>
              <li><i className="bi bi-check2-circle"></i> Soporte prioritario 24/7</li>
              <li><i className="bi bi-check2-circle"></i> Personalización de marca</li>
            </ul>
            <a href="/page/register" className="at-plan-btn at-plan-btn--outline">
              Contactar ventas
            </a>
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

      {/* FOOTER */}
      <footer className="at-footer">
        <div className="at-footer-inner">
          <div className="at-footer-brand">
            <span className="at-footer-logo">AUTOTECH</span>
            <p>El sistema de gestión para talleres mecánicos modernos.</p>
            <div className="at-footer-social">
              <a href="#"><i className="bi bi-instagram"></i></a>
              <a href="#"><i className="bi bi-facebook"></i></a>
              <a href="#"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
          <div className="at-footer-col">
            <h4>Producto</h4>
            <a href="#">Funcionalidades</a>
            <a href="#">Planes y precios</a>
            <a href="#">Novedades</a>
          </div>
          <div className="at-footer-col">
            <h4>Empresa</h4>
            <a href="#">Acerca de</a>
            <a href="#">Blog</a>
            <a href="#">Contacto</a>
          </div>
          <div className="at-footer-col">
            <h4>Legal</h4>
            <a href="#">Términos de uso</a>
            <a href="#">Privacidad</a>
            <a href="#">Cookies</a>
          </div>
        </div>
        <div className="at-footer-bottom">
          <span>© 2025 AutoTech. Todos los derechos reservados.</span>
        </div>
      </footer>
    </>
  );
}