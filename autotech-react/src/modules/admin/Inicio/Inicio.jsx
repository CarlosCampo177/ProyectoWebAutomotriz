import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inicio.css';
import { useAuth } from '../../../context/AuthContext';
import {
  estadisticaService,
  ordenService,
  productoService,
} from '../../../services/adminService';

/* ── Helpers ── */
const getSaludo = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

const getFechaLarga = () => {
  return new Date().toLocaleDateString('es-CO', {
    weekday:'long', year:'numeric',
    month:'long', day:'numeric'
  });
};

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;

const ESTADO_CFG = {
  pendiente:  { color:'#b45309', bg:'#fef3c7', label:'Pendiente'  },
  confirmada: { color:'#1d4ed8', bg:'#dbeafe', label:'Confirmada' },
  en_proceso: { color:'#6d28d9', bg:'#ede9fe', label:'En proceso' },
  terminada:  { color:'#15803d', bg:'#dcfce7', label:'Terminada'  },
  facturada:  { color:'#0369a1', bg:'#e0f2fe', label:'Facturada'  },
  cancelada:  { color:'#b91c1c', bg:'#fee2e2', label:'Cancelada'  },
};

export default function AdminInicio() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [resumen,    setResumen]    = useState(null);
  const [citasPend,  setCitasPend]  = useState([]);
  const [ordenesRec, setOrdenesRec] = useState([]);
  const [stockBajo,  setStockBajo]  = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [res, citas, ordenes, prods] = await Promise.all([
        estadisticaService.getResumen(),
        ordenService.getAll({ tipo: 'cita', estado: 'pendiente' }),
        ordenService.getAll({ tipo: 'orden' }),
        productoService.getAll(),
      ]);
      setResumen(res);
      setCitasPend((citas   || []).slice(0, 5));
      setOrdenesRec((ordenes || []).slice(0, 5));
      setStockBajo((prods   || [])
        .filter(p => p.stockEstado === 'bajo' || p.stockEstado === 'agotado')
        .slice(0, 5));
    } catch { }
    finally  { setLoading(false); }
  };

  const nombre = user?.nombre?.split(' ')[0] || 'Admin';

  /* ════════════════════════════════
     RENDER
  ════════════════════════════════ */
  return (
    <div className="ini-page">

      {/* ── HERO BANNER ── */}
      <div className="ini-hero">
        <div className="ini-hero-content">
          <p className="ini-hero-saludo">
            {getSaludo()} · {getFechaLarga()}
          </p>
          <h1 className="ini-hero-titulo">
            Hola, {nombre}
            <i className="bi bi-shield-check ms-2" />
          </h1>
          <p className="ini-hero-sub">
            Panel de administración — AutoTech
          </p>
          <div className="ini-hero-actions">
            <button className="ini-hero-btn"
              onClick={() => navigate('/admin/citas')}>
              <i className="bi bi-plus-lg me-1" /> Nueva orden
            </button>
            <button className="ini-hero-btn-ghost"
              onClick={() => navigate('/admin/estadisticas')}>
              <i className="bi bi-bar-chart-line me-1" /> Ver estadísticas
            </button>
          </div>
        </div>
        <div className="ini-hero-deco">
          <div className="ini-deco-circle c1" />
          <div className="ini-deco-circle c2" />
          <div className="ini-deco-circle c3" />
          <i className="bi bi-gear-wide-connected ini-deco-icon" />
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      {resumen && (
        <div className="ini-kpis">
          <div className="ini-kpi"
            onClick={() => navigate('/admin/clientes')}
            style={{ cursor:'pointer' }}>
            <div className="ini-kpi-icon" style={{ background:'#dbeafe' }}>
              <i className="bi bi-people" style={{ color:'#2563eb' }} />
            </div>
            <div className="ini-kpi-data">
              <span className="ini-kpi-num">{resumen.totalClientes}</span>
              <span className="ini-kpi-label">Clientes</span>
            </div>
          </div>

          <div className="ini-kpi"
            onClick={() => navigate('/admin/mecanicos')}
            style={{ cursor:'pointer' }}>
            <div className="ini-kpi-icon" style={{ background:'#dcfce7' }}>
              <i className="bi bi-person-badge" style={{ color:'#16a34a' }} />
            </div>
            <div className="ini-kpi-data">
              <span className="ini-kpi-num">{resumen.totalMecanicos}</span>
              <span className="ini-kpi-label">Mecánicos activos</span>
            </div>
          </div>

          <div className="ini-kpi"
            onClick={() => navigate('/admin/citas')}
            style={{ cursor:'pointer' }}>
            <div className="ini-kpi-icon" style={{ background:'#fef9c3' }}>
              <i className="bi bi-calendar-event" style={{ color:'#a16207' }} />
            </div>
            <div className="ini-kpi-data">
              <span className="ini-kpi-num">{resumen.citasPendientes}</span>
              <span className="ini-kpi-label">Citas pendientes</span>
            </div>
            {resumen.citasPendientes > 0 && (
              <span className="ini-kpi-alert">!</span>
            )}
          </div>

          <div className="ini-kpi"
            onClick={() => navigate('/admin/citas')}
            style={{ cursor:'pointer' }}>
            <div className="ini-kpi-icon" style={{ background:'#ede9fe' }}>
              <i className="bi bi-clipboard-check" style={{ color:'#7c3aed' }} />
            </div>
            <div className="ini-kpi-data">
              <span className="ini-kpi-num">{resumen.ordenesActivas}</span>
              <span className="ini-kpi-label">Órdenes activas</span>
            </div>
          </div>

          <div className="ini-kpi"
            onClick={() => navigate('/admin/vehiculos')}
            style={{ cursor:'pointer' }}>
            <div className="ini-kpi-icon" style={{ background:'#fce7f3' }}>
              <i className="bi bi-car-front" style={{ color:'#be185d' }} />
            </div>
            <div className="ini-kpi-data">
              <span className="ini-kpi-num">{resumen.totalVehiculos}</span>
              <span className="ini-kpi-label">Vehículos</span>
            </div>
          </div>

          <div className="ini-kpi ini-kpi-money"
            onClick={() => navigate('/admin/facturacion')}
            style={{ cursor:'pointer' }}>
            <div className="ini-kpi-icon"
              style={{ background:'rgba(255,255,255,.2)' }}>
              <i className="bi bi-currency-dollar" style={{ color:'#fff' }} />
            </div>
            <div className="ini-kpi-data">
              <span className="ini-kpi-num">{fmt(resumen.ingresoMes)}</span>
              <span className="ini-kpi-label"
                style={{ color:'rgba(255,255,255,.75)' }}>
                Ingresos del mes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── ACCIONES RÁPIDAS ── */}
      <div className="ini-section-title">
        <i className="bi bi-lightning-charge me-2" />
        Acciones rápidas
      </div>
      <div className="ini-acciones">
        {[
          { icon:'bi-person-plus',     label:'Nuevo cliente',    color:'#dbeafe', c:'#2563eb', path:'/admin/clientes'     },
          { icon:'bi-calendar-plus',   label:'Nueva cita',       color:'#fef9c3', c:'#a16207', path:'/admin/citas'        },
          { icon:'bi-car-front',       label:'Nuevo vehículo',   color:'#fce7f3', c:'#be185d', path:'/admin/vehiculos'    },
          { icon:'bi-person-badge',    label:'Nuevo mecánico',   color:'#dcfce7', c:'#16a34a', path:'/admin/mecanicos'    },
          { icon:'bi-tools',           label:'Nuevo servicio',   color:'#ffedd5', c:'#c2410c', path:'/admin/servicios'    },
          { icon:'bi-box-seam',        label:'Nuevo producto',   color:'#ede9fe', c:'#7c3aed', path:'/admin/producto'     },
          { icon:'bi-receipt',         label:'Facturación',      color:'#e0f2fe', c:'#0369a1', path:'/admin/facturacion'  },
          { icon:'bi-bar-chart-line',  label:'Estadísticas',     color:'#f3f4f6', c:'#374151', path:'/admin/estadisticas' },
        ].map(a => (
          <button key={a.path} className="ini-accion"
            onClick={() => navigate(a.path)}>
            <div className="ini-accion-icon"
              style={{ background: a.color }}>
              <i className={`bi ${a.icon}`} style={{ color: a.c }} />
            </div>
            <span className="ini-accion-label">{a.label}</span>
          </button>
        ))}
      </div>

      {/* ── FILA INFERIOR ── */}
      <div className="ini-bottom-grid">

        {/* Citas pendientes */}
        <div className="ini-card">
          <div className="ini-card-header">
            <span className="ini-card-title">
              <i className="bi bi-calendar-event me-2"
                style={{ color:'#a16207' }} />
              Citas pendientes
            </span>
            <button className="ini-ver-todas"
              onClick={() => navigate('/admin/citas')}>
              Ver todas →
            </button>
          </div>

          {loading ? (
            <div className="ini-loading">
              <i className="bi bi-arrow-repeat spin" />
            </div>
          ) : citasPend.length === 0 ? (
            <div className="ini-empty">
              <i className="bi bi-calendar-check" />
              <span>Sin citas pendientes</span>
            </div>
          ) : citasPend.map(c => (
            <div key={c.id} className="ini-list-item">
              <div className="ini-li-avatar ini-li-cita">
                {(c.cliente || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="ini-li-info">
                <div className="ini-li-nombre">{c.cliente}</div>
                <div className="ini-li-sub">
                  <i className="bi bi-car-front me-1" />
                  {c.placa} — {c.servicio}
                </div>
              </div>
              <div className="ini-li-right">
                <div className="ini-li-fecha">{c.fechaProgramada}</div>
                {c.hora && (
                  <div className="ini-li-hora">{c.hora}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Órdenes recientes */}
        <div className="ini-card">
          <div className="ini-card-header">
            <span className="ini-card-title">
              <i className="bi bi-clipboard-check me-2"
                style={{ color:'#7c3aed' }} />
              Órdenes recientes
            </span>
            <button className="ini-ver-todas"
              onClick={() => navigate('/admin/citas')}>
              Ver todas →
            </button>
          </div>

          {loading ? (
            <div className="ini-loading">
              <i className="bi bi-arrow-repeat spin" />
            </div>
          ) : ordenesRec.length === 0 ? (
            <div className="ini-empty">
              <i className="bi bi-inbox" />
              <span>Sin órdenes registradas</span>
            </div>
          ) : ordenesRec.map(o => (
            <div key={o.id} className="ini-list-item">
              <span className="ini-ord-num">
                #{String(o.id).padStart(4,'0')}
              </span>
              <div className="ini-li-info">
                <div className="ini-li-nombre">{o.cliente}</div>
                <div className="ini-li-sub">
                  {o.mecanico
                    ? <><i className="bi bi-person-badge me-1" />{o.mecanico}</>
                    : <span style={{ color:'#f59e0b' }}>Sin mecánico</span>
                  }
                </div>
              </div>
              <span className="ini-ord-estado"
                style={{ background: ESTADO_CFG[o.estado]?.bg,
                         color:      ESTADO_CFG[o.estado]?.color }}>
                {ESTADO_CFG[o.estado]?.label}
              </span>
            </div>
          ))}
        </div>

        {/* Alertas de stock */}
        <div className="ini-card">
          <div className="ini-card-header">
            <span className="ini-card-title">
              <i className="bi bi-exclamation-triangle me-2"
                style={{ color:'#dc2626' }} />
              Alertas de inventario
            </span>
            <button className="ini-ver-todas"
              onClick={() => navigate('/admin/producto')}>
              Ver todas →
            </button>
          </div>

          {loading ? (
            <div className="ini-loading">
              <i className="bi bi-arrow-repeat spin" />
            </div>
          ) : stockBajo.length === 0 ? (
            <div className="ini-empty ini-empty-ok">
              <i className="bi bi-check-circle" />
              <span>Inventario en buen estado</span>
            </div>
          ) : stockBajo.map(p => (
            <div key={p.id} className="ini-list-item">
              <div className={`ini-stock-icon ${p.stockEstado}`}>
                <i className="bi bi-box-seam" />
              </div>
              <div className="ini-li-info">
                <div className="ini-li-nombre">{p.nombre}</div>
                <div className="ini-li-sub">{p.categoria}</div>
              </div>
              <div className="ini-li-right">
                <span className={`ini-stock-badge ${p.stockEstado}`}>
                  {p.stockEstado === 'agotado'
                    ? '✕ Agotado'
                    : `⚠ ${p.stock} und`}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}