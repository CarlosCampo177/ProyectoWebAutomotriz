import "./ComoFunciona.css";

const pasos = [
  {
    numero: "01",
    titulo: "Regístrate",
    descripcion: "Crea tu cuenta en segundos. Solo necesitas tu nombre, correo y contraseña para empezar.",
    icono: "bi-person-plus-fill",
  },
  {
    numero: "02",
    titulo: "Agenda tu cita",
    descripcion: "Elige el servicio que necesitas, selecciona fecha y hora disponible. Fácil y rápido.",
    icono: "bi-calendar-check-fill",
  },
  {
    numero: "03",
    titulo: "Lleva tu vehículo",
    descripcion: "Llega al taller en el horario acordado. Nuestros mecánicos ya estarán listos para atenderte.",
    icono: "bi-car-front-fill",
  },
  {
    numero: "04",
    titulo: "Recoge y paga",
    descripcion: "Te notificamos cuando esté listo. Recibe tu factura digital y el historial del servicio.",
    icono: "bi-check-circle-fill",
  },
];

export default function ComoFunciona() {
  return (
    <section className="cf-section">
      <div className="cf-bg-deco" />

      <div className="cf-header">
        <span className="cf-tag">Simple y rápido</span>
        <h2 className="cf-titulo">¿Cómo funciona?</h2>
        <p className="cf-subtitulo">
          En 4 pasos sencillos tu vehículo estará recibiendo la atención que merece.
        </p>
      </div>

      <div className="cf-pasos">
        {pasos.map((p, i) => (
          <div className="cf-paso" key={i}>
            {i < pasos.length - 1 && <div className="cf-linea" />}
            <div className="cf-circulo">
              <i className={`bi ${p.icono}`}></i>
            </div>
            <div className="cf-numero">{p.numero}</div>
            <h3 className="cf-paso-titulo">{p.titulo}</h3>
            <p className="cf-paso-desc">{p.descripcion}</p>
          </div>
        ))}
      </div>
    </section>
  );
}