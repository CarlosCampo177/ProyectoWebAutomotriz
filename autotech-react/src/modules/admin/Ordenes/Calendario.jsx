import { useState, useEffect } from 'react';
import './Calendario.css';
import { ordenService } from '../../../services/adminService';

// Colores por mecánico (se asignan dinámicamente)
const PALETA = [
  '#2563eb','#dc2626','#16a34a','#d97706',
  '#7c3aed','#0891b2','#be185d','#059669',
];

const HORAS = Array.from({ length: 20 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2,'0')}:${m}`;
});

const formatHora12 = (h24) => {
  if (!h24) return '';
  const [h, m] = h24.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
};

export default function Calendario() {
  const [semana,    setSemana]    = useState(getSemanaActual());
  const [eventos,   setEventos]   = useState([]);
  const [colores,   setColores]   = useState({});
  const [loading,   setLoading]   = useState(false);
  const [popover,   setPopover]   = useState(null);

  useEffect(() => { cargar(); }, [semana]);

  function getSemanaActual() {
    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    return lunes;
  }

  function getDiasSemana(inicio) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      return d;
    });
  }

  function fmtFecha(d) {
    return d.toISOString().split('T')[0];
  }

  const dias = getDiasSemana(semana);

  const cargar = async () => {
    try {
      setLoading(true);
      const inicio = fmtFecha(dias[0]);
      const fin    = fmtFecha(dias[6]);
      const data   = await ordenService.getCalendario(inicio, fin);

      // Asignar colores por mecánico
      const mecMap = {};
      let idx = 0;
      (data || []).forEach(e => {
        const key = e.idMecanico || 'sin';
        if (!mecMap[key]) mecMap[key] = PALETA[idx++ % PALETA.length];
      });
      setColores(mecMap);
      setEventos(data || []);
    } catch { setEventos([]); }
    finally  { setLoading(false); }
  };

  const semanaAnterior = () => {
    const d = new Date(semana);
    d.setDate(d.getDate() - 7);
    setSemana(d);
  };

  const semanaSiguiente = () => {
    const d = new Date(semana);
    d.setDate(d.getDate() + 7);
    setSemana(d);
  };

  const hoy = new Date().toISOString().split('T')[0];

  const eventosEnSlot = (fecha, hora) =>
    eventos.filter(e =>
      e.fecha === fmtFecha(fecha) &&
      e.hora  === hora
    );

  const DIAS_NOMBRES = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const MESES = ['Ene','Feb','Mar','Abr','May','Jun',
                 'Jul','Ago','Sep','Oct','Nov','Dic'];

  /* ── Leyenda de mecánicos ── */
  const mecanicosUnicos = [...new Set(
    eventos.map(e => ({ key: e.idMecanico || 'sin', nombre: e.mecanico }))
      .map(JSON.stringify)
  )].map(JSON.parse);

  return (
    <div className="cal-page">
      {/* Header */}
      <div className="cal-header">
        <div>
          <h2 className="cal-title">
            <i className="bi bi-calendar3 me-2" />
            Calendario del taller
          </h2>
          <p className="cal-subtitle">
            Ocupación de mecánicos por semana
          </p>
        </div>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={semanaAnterior}>
            <i className="bi bi-chevron-left" />
          </button>
          <span className="cal-rango">
            {dias[0].getDate()} {MESES[dias[0].getMonth()]} —{' '}
            {dias[6].getDate()} {MESES[dias[6].getMonth()]}{' '}
            {dias[0].getFullYear()}
          </span>
          <button className="cal-nav-btn" onClick={semanaSiguiente}>
            <i className="bi bi-chevron-right" />
          </button>
          <button className="cal-hoy-btn"
            onClick={() => setSemana(getSemanaActual())}>
            Hoy
          </button>
        </div>
      </div>

      {/* Leyenda mecánicos */}
      {mecanicosUnicos.length > 0 && (
        <div className="cal-leyenda">
          {mecanicosUnicos.map(m => (
            <div key={m.key} className="cal-ley-item">
              <span className="cal-ley-dot"
                style={{ background: colores[m.key] || '#999' }} />
              <span>{m.nombre}</span>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="loading-state">
          <i className="bi bi-arrow-repeat spin" /> Cargando calendario...
        </div>
      ) : (
        <div className="cal-grid-wrap">
          <div className="cal-grid">

            {/* Columna horas */}
            <div className="cal-col-horas">
              <div className="cal-col-header" />
              {HORAS.map(h => (
                <div key={h} className="cal-hora-label">
                  {formatHora12(h)}
                </div>
              ))}
            </div>

            {/* Columnas días */}
            {dias.map((dia, di) => {
              const fechaStr = fmtFecha(dia);
              const esHoy    = fechaStr === hoy;
              return (
                <div key={di} className="cal-col-dia">
                  <div className={`cal-col-header ${esHoy ? 'hoy' : ''}`}>
                    <span className="cal-dia-nombre">{DIAS_NOMBRES[di]}</span>
                    <span className={`cal-dia-num ${esHoy ? 'hoy' : ''}`}>
                      {dia.getDate()}
                    </span>
                  </div>
                  {HORAS.map(hora => {
                    const evts = eventosEnSlot(dia, hora);
                    return (
                      <div key={hora}
                        className={`cal-slot ${evts.length > 0 ? 'ocupado' : ''}`}>
                        {evts.map(ev => (
                          <div key={ev.id}
                            className="cal-evento"
                            style={{ background: colores[ev.idMecanico || 'sin'] }}
                            onClick={() => setPopover(
                              popover?.id === ev.id ? null : ev
                            )}>
                            <div className="cal-ev-titulo">
                              {ev.tipo === 'cita'
                                ? <i className="bi bi-calendar-event me-1" />
                                : <i className="bi bi-wrench me-1" />}
                              {ev.cliente.split(' ')[0]}
                            </div>
                            <div className="cal-ev-sub">{ev.servicio}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Popover detalle evento */}
      {popover && (
        <div className="cal-popover-overlay" onClick={() => setPopover(null)}>
          <div className="cal-popover" onClick={e => e.stopPropagation()}>
            <div className="cal-pop-header"
              style={{ borderLeft: `4px solid ${colores[popover.idMecanico || 'sin']}` }}>
              <div>
                <span className="cal-pop-tipo">
                  {popover.tipo === 'cita' ? '📅 Cita' : '🔧 Orden'}
                </span>
                <div className="cal-pop-id">#{String(popover.id).padStart(4,'0')}</div>
              </div>
              <button className="modal-close" onClick={() => setPopover(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="cal-pop-body">
              <div className="cal-pop-row">
                <i className="bi bi-person" />
                <span>{popover.cliente}</span>
              </div>
              <div className="cal-pop-row">
                <i className="bi bi-tools" />
                <span>{popover.servicio}</span>
              </div>
              <div className="cal-pop-row">
                <i className="bi bi-person-badge" />
                <span>{popover.mecanico}</span>
              </div>
              <div className="cal-pop-row">
                <i className="bi bi-clock" />
                <span>{formatHora12(popover.hora)}</span>
              </div>
              <div className="cal-pop-row">
                <i className="bi bi-flag" />
                <span
                  style={{ fontWeight:600,
                    color: popover.prioridad === 'urgente' ? '#b91c1c'
                         : popover.prioridad === 'alta'    ? '#b45309'
                         : '#374151'
                  }}>
                  {popover.prioridad}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}