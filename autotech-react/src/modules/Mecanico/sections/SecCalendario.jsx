import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getMecanicoOrdenes } from '../../../services/mecanicoService';
import './SecCalendario.css';

/* ── Colores por tipo ── */
const COLOR_CITA  = '#2563eb';
const COLOR_ORDEN = '#dc2626';

const HORAS = Array.from({ length: 20 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

const DIAS_NOMBRES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES_CORTO  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const MESES_MAP = {
  JAN:0, FEB:1, MAR:2, APR:3, MAY:4, JUN:5,
  JUL:6, AUG:7, SEP:8, OCT:9, NOV:10, DEC:11,
  ENE:0, ABR:3, AGO:7, DIC:11,
};

const fmt12 = (h24) => {
  if (!h24) return '';
  const [h, m] = h24.split(':').map(Number);
  const ap  = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
};

/* Convierte "HH:MM AM/PM" o "HH:MM" a {h, mi} en formato 24h
   El backend a veces devuelve "13:30 PM" (ya en 24h con periodo sobrante),
   por eso si h >= 12 con PM no sumamos 12 para evitar horas > 23 */
const parseHora = (horaStr = '') => {
  const partes   = horaStr.trim().split(' ');
  const [hh, mm] = (partes[0] ?? '').split(':').map(Number);
  const periodo  = partes[1];
  let h  = isNaN(hh) ? 8 : hh;
  const mi = isNaN(mm) ? 0 : mm;
  if (periodo === 'PM' && h < 12)  h += 12;   // 1:30 PM → 13
  if (periodo === 'AM' && h === 12) h  = 0;   // 12:00 AM → 0
  // si h ya es >= 12 con PM (e.g. "13:30 PM") no tocamos nada
  return { h, mi };
};

/* Convierte el objeto fecha {dia, mes} + hora a Date */
const toDate = (fechaObj, horaStr = '08:00') => {
  const mes = MESES_MAP[(fechaObj?.mes ?? '').toUpperCase()];
  if (mes === undefined) return null;
  const dia      = Number(fechaObj?.dia ?? 1);
  const { h, mi } = parseHora(horaStr);
  return new Date(new Date().getFullYear(), mes, dia, h, mi);
};

/* Normaliza hora a "HH:MM" (24h) para comparar con los slots */
const normalizarHora = (horaStr = '') => {
  const { h, mi } = parseHora(horaStr);
  return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
};

/* Obtiene el lunes de la semana de una fecha */
const getLunes = (fecha) => {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};

const fmtISO = (d) => d.toISOString().split('T')[0];

export default function SecCalendario() {
  const { user }  = useAuth();
  const idUsuario = user?.id;

  const [semana,   setSemana]   = useState(getLunes(new Date()));
  const [eventos,  setEventos]  = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');
  const [popover,  setPopover]  = useState(null);

  useEffect(() => {
    if (!idUsuario) return;
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUsuario, semana]);

  const cargar = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await getMecanicoOrdenes(idUsuario);

      // Filtrar solo los de esta semana y mapearlos a {fecha ISO, hora24, ...}
      const dias = getDiasSemana(semana);
      const ini  = fmtISO(dias[0]);
      const fin  = fmtISO(dias[6]);

      const mapped = (data || [])
        .map(o => {
          const d = toDate(o.fecha, o.hora);
          if (!d) return null;
          const fechaISO = fmtISO(d);
          const hora24   = normalizarHora(o.hora);
          return { ...o, fechaISO, hora24 };
        })
        .filter(o => o && o.fechaISO >= ini && o.fechaISO <= fin);

      setEventos(mapped);
    } catch (e) {
      console.error(e);
      setError('No se pudo cargar el calendario.');
    } finally {
      setCargando(false);
    }
  };

  const getDiasSemana = (lunes) =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return d;
    });

  const dias = getDiasSemana(semana);

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

  const hoyISO = fmtISO(new Date());

  const eventosEnSlot = (fecha, hora) =>
    eventos.filter(e => e.fechaISO === fmtISO(fecha) && e.hora24 === hora);

  /* Conteos para la tarjeta resumen */
  const totalSemana  = eventos.length;
  const pendientes   = eventos.filter(e => e.estado === 'pendiente').length;
  const enProceso    = eventos.filter(e => e.estado === 'en_proceso').length;
  const completadas  = eventos.filter(e => ['completada', 'terminada', 'facturada'].includes(e.estado)).length;

  return (
    <div className="scc-page">

      {/* ── Header ── */}
      <div className="scc-header">
        <div>
          <h2 className="scc-title">
            <i className="bi bi-calendar3 me-2" />
            Mi calendario
          </h2>
          <p className="scc-subtitle">Tus citas y órdenes de esta semana</p>
        </div>
        <div className="scc-nav">
          <button className="scc-nav-btn" onClick={semanaAnterior}>
            <i className="bi bi-chevron-left" />
          </button>
          <span className="scc-rango">
            {dias[0].getDate()} {MESES_CORTO[dias[0].getMonth()]} —{' '}
            {dias[6].getDate()} {MESES_CORTO[dias[6].getMonth()]}{' '}
            {dias[0].getFullYear()}
          </span>
          <button className="scc-nav-btn" onClick={semanaSiguiente}>
            <i className="bi bi-chevron-right" />
          </button>
          <button className="scc-hoy-btn" onClick={() => setSemana(getLunes(new Date()))}>
            Hoy
          </button>
        </div>
      </div>

      {/* ── Resumen semana ── */}
      {!cargando && !error && (
        <div className="scc-resumen">
          <div className="scc-res-card">
            <span className="scc-res-num">{totalSemana}</span>
            <span className="scc-res-label">Esta semana</span>
          </div>
          <div className="scc-res-card pendiente">
            <span className="scc-res-num">{pendientes}</span>
            <span className="scc-res-label">Pendientes</span>
          </div>
          <div className="scc-res-card en_proceso">
            <span className="scc-res-num">{enProceso}</span>
            <span className="scc-res-label">En proceso</span>
          </div>
          <div className="scc-res-card completada">
            <span className="scc-res-num">{completadas}</span>
            <span className="scc-res-label">Completadas</span>
          </div>
        </div>
      )}

      {/* ── Leyenda ── */}
      <div className="scc-leyenda">
        <div className="scc-ley-item">
          <span className="scc-ley-dot" style={{ background: COLOR_CITA }} />
          <span>Cita</span>
        </div>
        <div className="scc-ley-item">
          <span className="scc-ley-dot" style={{ background: COLOR_ORDEN }} />
          <span>Orden</span>
        </div>
      </div>

      {/* ── Grid ── */}
      {cargando ? (
        <div className="scc-loading">
          <i className="bi bi-arrow-repeat spin" /> Cargando calendario...
        </div>
      ) : error ? (
        <div className="scc-error">{error}</div>
      ) : (
        <div className="scc-grid-wrap">
          <div className="scc-grid">

            {/* Columna horas */}
            <div className="scc-col-horas">
              <div className="scc-col-header" />
              {HORAS.map(h => (
                <div key={h} className="scc-hora-label">{fmt12(h)}</div>
              ))}
            </div>

            {/* Columnas días */}
            {dias.map((dia, di) => {
              const fechaStr = fmtISO(dia);
              const esHoy    = fechaStr === hoyISO;
              return (
                <div key={di} className="scc-col-dia">
                  <div className={`scc-col-header ${esHoy ? 'hoy' : ''}`}>
                    <span className="scc-dia-nombre">{DIAS_NOMBRES[di]}</span>
                    <span className={`scc-dia-num ${esHoy ? 'hoy' : ''}`}>
                      {dia.getDate()}
                    </span>
                  </div>
                  {HORAS.map(hora => {
                    const evts = eventosEnSlot(dia, hora);
                    return (
                      <div key={hora} className={`scc-slot ${evts.length > 0 ? 'ocupado' : ''}`}>
                        {evts.map(ev => {
                          const esCita = ev.tipo === 'cita';
                          const color  = esCita ? COLOR_CITA : COLOR_ORDEN;
                          return (
                            <div
                              key={ev.id}
                              className="scc-evento"
                              style={{ background: color }}
                              onClick={() => setPopover(popover?.id === ev.id ? null : ev)}
                            >
                              <div className="scc-ev-titulo">
                                <i className={`bi bi-${esCita ? 'calendar-event' : 'wrench'} me-1`} />
                                {(ev.cliente || '').split(' ')[0]}
                              </div>
                              <div className="scc-ev-sub">{ev.servicio}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Popover detalle ── */}
      {popover && (
        <div className="scc-popover-overlay" onClick={() => setPopover(null)}>
          <div className="scc-popover" onClick={e => e.stopPropagation()}>
            <div
              className="scc-pop-header"
              style={{ borderLeft: `4px solid ${popover.tipo === 'cita' ? COLOR_CITA : COLOR_ORDEN}` }}
            >
              <div>
                <span className="scc-pop-tipo">
                  {popover.tipo === 'cita' ? '📅 Cita' : '🔧 Orden'}
                </span>
                <div className="scc-pop-id">#{String(popover.id).padStart(4, '0')}</div>
              </div>
              <button className="scc-pop-close" onClick={() => setPopover(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="scc-pop-body">
              <div className="scc-pop-row">
                <i className="bi bi-person" />
                <span>{popover.cliente}</span>
              </div>
              <div className="scc-pop-row">
                <i className="bi bi-tools" />
                <span>{popover.servicio}</span>
              </div>
              <div className="scc-pop-row">
                <i className="bi bi-car-front" />
                <span>{popover.vehiculo} — {popover.placa}</span>
              </div>
              <div className="scc-pop-row">
                <i className="bi bi-clock" />
                <span>{popover.hora}</span>
              </div>
              <div className="scc-pop-row">
                <i className="bi bi-flag" />
                <span
                  style={{
                    fontWeight: 600,
                    color: popover.prioridad === 'urgente' ? '#b91c1c'
                         : popover.prioridad === 'alta'    ? '#b45309'
                         : '#374151',
                  }}
                >
                  {popover.prioridad}
                </span>
              </div>
              <div className="scc-pop-row">
                <i className="bi bi-circle-fill"
                  style={{
                    color: popover.estado === 'en_proceso' ? '#7c3aed'
                         : ['completada','terminada','facturada'].includes(popover.estado) ? '#15803d'
                         : '#b45309',
                    fontSize: '8px',
                  }}
                />
                <span style={{ textTransform: 'capitalize' }}>
                  {popover.estado?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}