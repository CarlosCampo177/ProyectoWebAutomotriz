import { useState, useEffect } from 'react';
import './Estadisticas.css';
import { estadisticaService } from '../../../services/adminService';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

/* ── Colores ── */
const COLORS_PIE = {
  'Pendiente':  '#f59e0b',
  'Confirmada': '#3b82f6',
  'En proceso': '#8b5cf6',
  'Terminada':  '#10b981',
  'Facturada':  '#06b6d4',
  'Cancelada':  '#ef4444',
};

const COLORS_PRI = {
  'Urgente': '#ef4444',
  'Alta':    '#f59e0b',
  'Normal':  '#3b82f6',
  'Baja':    '#9ca3af',
};

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;

/* ── Tooltip personalizado ── */
const TooltipIngreso = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="est-tooltip">
      <p className="est-tt-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0', fontSize: '.82rem' }}>
          {p.name}: {p.name === 'Ingresos' ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Estadisticas() {
  const [resumen,     setResumen]     = useState(null);
  const [ingresos,    setIngresos]    = useState([]);
  const [ordMes,      setOrdMes]      = useState([]);
  const [ordEstado,   setOrdEstado]   = useState([]);
  const [topSrv,      setTopSrv]      = useState([]);
  const [topPrd,      setTopPrd]      = useState([]);
  const [mecanicos,   setMecanicos]   = useState([]);
  const [clientes,    setClientes]    = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [anio]                        = useState(new Date().getFullYear());

  useEffect(() => { cargarTodo(); }, []);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [r, ing, om, oe, ts, tp, mc, cn, pr] = await Promise.all([
        estadisticaService.getResumen(),
        estadisticaService.getIngresosPorMes(),
        estadisticaService.getOrdenesPorMes(),
        estadisticaService.getOrdenesPorEstado(),
        estadisticaService.getTopServicios(),
        estadisticaService.getTopProductos(),
        estadisticaService.getMecanicosRendimiento(),
        estadisticaService.getClientesNuevos(),
        estadisticaService.getPrioridades(),
      ]);
      setResumen(r);
      setIngresos(ing   || []);
      setOrdMes(om      || []);
      setOrdEstado(oe   || []);
      setTopSrv(ts      || []);
      setTopPrd(tp      || []);
      setMecanicos(mc   || []);
      setClientes(cn    || []);
      setPrioridades(pr || []);
    } catch { }
    finally  { setLoading(false); }
  };

  if (loading) return (
    <div className="est-page">
      <div className="loading-state" style={{ paddingTop: '4rem' }}>
        <i className="bi bi-arrow-repeat spin" /> Cargando estadísticas...
      </div>
    </div>
  );

  /* ════════════════════════════════
     RENDER
  ════════════════════════════════ */
  return (
    <div className="est-page">

      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 className="page-title">
            <i className="bi bi-bar-chart-line" /> Estadísticas
          </h1>
          <p className="page-subtitle">
            Resumen operativo y financiero de AutoTech — {anio}
          </p>
        </div>
        <button className="btn-secondary" onClick={cargarTodo}>
          <i className="bi bi-arrow-repeat me-1" /> Actualizar
        </button>
      </div>

      {/* ── FILA 1: KPIs ── */}
      {resumen && (
        <div className="est-kpis">
          <div className="est-kpi">
            <div className="est-kpi-icon" style={{ background:'#dbeafe' }}>
              <i className="bi bi-people" style={{ color:'#2563eb' }} />
            </div>
            <div>
              <span className="est-kpi-num">{resumen.totalClientes}</span>
              <span className="est-kpi-label">Clientes</span>
            </div>
          </div>
          <div className="est-kpi">
            <div className="est-kpi-icon" style={{ background:'#dcfce7' }}>
              <i className="bi bi-person-badge" style={{ color:'#16a34a' }} />
            </div>
            <div>
              <span className="est-kpi-num">{resumen.totalMecanicos}</span>
              <span className="est-kpi-label">Mecánicos activos</span>
            </div>
          </div>
          <div className="est-kpi">
            <div className="est-kpi-icon" style={{ background:'#fce7f3' }}>
              <i className="bi bi-car-front" style={{ color:'#be185d' }} />
            </div>
            <div>
              <span className="est-kpi-num">{resumen.totalVehiculos}</span>
              <span className="est-kpi-label">Vehículos</span>
            </div>
          </div>
          <div className="est-kpi">
            <div className="est-kpi-icon" style={{ background:'#ede9fe' }}>
              <i className="bi bi-clipboard-check" style={{ color:'#7c3aed' }} />
            </div>
            <div>
              <span className="est-kpi-num">{resumen.ordenesActivas}</span>
              <span className="est-kpi-label">Órdenes activas</span>
            </div>
          </div>
          <div className="est-kpi">
            <div className="est-kpi-icon" style={{ background:'#fef9c3' }}>
              <i className="bi bi-calendar-event" style={{ color:'#a16207' }} />
            </div>
            <div>
              <span className="est-kpi-num">{resumen.citasPendientes}</span>
              <span className="est-kpi-label">Citas pendientes</span>
            </div>
          </div>
          <div className="est-kpi est-kpi-accent">
            <div className="est-kpi-icon" style={{ background:'rgba(255,255,255,.2)' }}>
              <i className="bi bi-currency-dollar" style={{ color:'#fff' }} />
            </div>
            <div>
              <span className="est-kpi-num">{fmt(resumen.ingresoMes)}</span>
              <span className="est-kpi-label" style={{ color:'rgba(255,255,255,.8)' }}>
                Ingresos este mes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── FILA 2: Ingresos por mes + Estado órdenes ── */}
      <div className="est-grid-2">

        {/* Ingresos por mes */}
        <div className="est-card">
          <div className="est-card-header">
            <span className="est-card-title">
              <i className="bi bi-graph-up me-2" />Ingresos por mes
            </span>
            <span className="est-card-sub">{anio}</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ingresos} margin={{ top:5, right:10, left:10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#9ca3af' }} />
              <YAxis tick={{ fontSize:11, fill:'#9ca3af' }}
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<TooltipIngreso />} />
              <Bar dataKey="total" name="Ingresos" fill="#2563eb"
                radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de órdenes — Pie */}
        <div className="est-card">
          <div className="est-card-header">
            <span className="est-card-title">
              <i className="bi bi-pie-chart me-2" />Estado de órdenes
            </span>
          </div>
          <div className="est-pie-wrap">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={ordEstado} dataKey="cantidad"
                  nameKey="estado" cx="50%" cy="50%"
                  outerRadius={80} innerRadius={45}
                  paddingAngle={3}>
                  {ordEstado.map((entry, i) => (
                    <Cell key={i}
                      fill={COLORS_PIE[entry.estado] || '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} órdenes`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="est-pie-legend">
              {ordEstado.map((item, i) => (
                <div key={i} className="est-pie-item">
                  <span className="est-pie-dot"
                    style={{ background: COLORS_PIE[item.estado] || '#9ca3af' }} />
                  <span className="est-pie-label">{item.estado}</span>
                  <span className="est-pie-val">{item.cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FILA 3: Citas y órdenes por mes + Prioridades ── */}
      <div className="est-grid-2">

        {/* Citas y órdenes por mes */}
        <div className="est-card">
          <div className="est-card-header">
            <span className="est-card-title">
              <i className="bi bi-calendar3 me-2" />Citas y órdenes por mes
            </span>
            <span className="est-card-sub">{anio}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ordMes} margin={{ top:5, right:10, left:0, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#9ca3af' }} />
              <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} />
              <Tooltip />
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize:'12px' }} />
              <Line type="monotone" dataKey="citas" name="Citas"
                stroke="#f59e0b" strokeWidth={2.5}
                dot={{ r:3 }} activeDot={{ r:5 }} />
              <Line type="monotone" dataKey="ordenes" name="Órdenes"
                stroke="#7c3aed" strokeWidth={2.5}
                dot={{ r:3 }} activeDot={{ r:5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Prioridades */}
        <div className="est-card">
          <div className="est-card-header">
            <span className="est-card-title">
              <i className="bi bi-flag me-2" />Distribución por prioridad
            </span>
          </div>
          <div className="est-pie-wrap">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={prioridades} dataKey="cantidad"
                  nameKey="prioridad" cx="50%" cy="50%"
                  outerRadius={80} innerRadius={45}
                  paddingAngle={3}>
                  {prioridades.map((entry, i) => (
                    <Cell key={i}
                      fill={COLORS_PRI[entry.prioridad] || '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} órdenes`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="est-pie-legend">
              {prioridades.map((item, i) => (
                <div key={i} className="est-pie-item">
                  <span className="est-pie-dot"
                    style={{ background: COLORS_PRI[item.prioridad] || '#9ca3af' }} />
                  <span className="est-pie-label">{item.prioridad}</span>
                  <span className="est-pie-val">{item.cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FILA 4: Top servicios + Top productos ── */}
      <div className="est-grid-2">

        {/* Top servicios */}
        <div className="est-card">
          <div className="est-card-header">
            <span className="est-card-title">
              <i className="bi bi-tools me-2" />Servicios más solicitados
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topSrv} layout="vertical"
              margin={{ top:5, right:10, left:10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11, fill:'#9ca3af' }} />
              <YAxis type="category" dataKey="nombre" width={130}
                tick={{ fontSize:11, fill:'#374151' }} />
              <Tooltip formatter={(v, n) =>
                n === 'cantidad' ? [`${v} veces`] : [fmt(v)]} />
              <Bar dataKey="cantidad" name="cantidad"
                fill="#2563eb" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top productos */}
        <div className="est-card">
          <div className="est-card-header">
            <span className="est-card-title">
              <i className="bi bi-box-seam me-2" />Productos más utilizados
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topPrd} layout="vertical"
              margin={{ top:5, right:10, left:10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11, fill:'#9ca3af' }} />
              <YAxis type="category" dataKey="nombre" width={130}
                tick={{ fontSize:11, fill:'#374151' }} />
              <Tooltip formatter={(v, n) =>
                n === 'cantidad' ? [`${v} unidades`] : [fmt(v)]} />
              <Bar dataKey="cantidad" name="cantidad"
                fill="#7c3aed" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── FILA 5: Mecánicos + Clientes nuevos ── */}
      <div className="est-grid-2">

        {/* Rendimiento mecánicos */}
        <div className="est-card">
          <div className="est-card-header">
            <span className="est-card-title">
              <i className="bi bi-person-badge me-2" />Rendimiento mecánicos
            </span>
          </div>
          {mecanicos.length === 0 ? (
            <p className="est-empty">Sin datos de mecánicos.</p>
          ) : (
            <div className="est-mec-list">
              {mecanicos.map((m, i) => {
                const pct = m.total > 0
                  ? Math.round((m.completadas / m.total) * 100) : 0;
                return (
                  <div key={i} className="est-mec-row">
                    <div className="est-mec-avatar">
                      {m.nombre.split(' ').map(n=>n[0]).slice(0,2).join('')}
                    </div>
                    <div className="est-mec-info">
                      <div className="est-mec-nombre">{m.nombre}</div>
                      <div className="est-mec-bar-wrap">
                        <div className="est-mec-bar"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="est-mec-stats">
                      <span className="est-mec-completadas">
                        {m.completadas} ✓
                      </span>
                      <span className="est-mec-activas">
                        {m.activas} ⏳
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clientes nuevos */}
        <div className="est-card">
          <div className="est-card-header">
            <span className="est-card-title">
              <i className="bi bi-person-plus me-2" />Clientes nuevos por mes
            </span>
            <span className="est-card-sub">{anio}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clientes}
              margin={{ top:5, right:10, left:0, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#9ca3af' }} />
              <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} />
              <Tooltip formatter={(v) => [`${v} clientes`]} />
              <Bar dataKey="cantidad" name="Clientes"
                fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}