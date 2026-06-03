import { useState, useEffect, useRef } from 'react';
import './Facturacion.css';
import { facturaService } from '../../../services/adminService';

export default function Facturacion() {
  const [facturas,     setFacturas]     = useState([]);
  const [stats,        setStats]        = useState(null);
  const [ordenesPend,  setOrdenesPend]  = useState([]);
  const [detalle,      setDetalle]      = useState(null);
  const [detalleData,  setDetalleData]  = useState(null);
  const [loadingDet,   setLoadingDet]   = useState(false);
  const [showGenerar,  setShowGenerar]  = useState(false);
  const [ordenTarget,  setOrdenTarget]  = useState(null);
  const [genForm,      setGenForm]      = useState({ descuento: 0, notas: '' });
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [busqueda,     setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [fechaInicio,  setFechaInicio]  = useState('');
  const [fechaFin,     setFechaFin]     = useState('');
  const printRef = useRef(null);

  useEffect(() => {
    cargar();
    cargarStats();
    cargarOrdenesPend();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEstado !== 'todos') params.estado = filtroEstado;
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin)    params.fechaFin    = fechaFin;
      const data = await facturaService.getAll(params);
      setFacturas(data || []);
    } catch { setFacturas([]); }
    finally  { setLoading(false); }
  };

  const cargarStats = async () => {
    try {
      const data = await facturaService.getEstadisticas();
      setStats(data);
    } catch {}
  };

  const cargarOrdenesPend = async () => {
    try {
      const data = await facturaService.getOrdenesPendientes();
      setOrdenesPend(data || []);
    } catch {}
  };

  /* ── Detalle ── */
  const abrirDetalle = async (f) => {
    if (detalle?.id === f.id) { setDetalle(null); setDetalleData(null); return; }
    setDetalle(f);
    setDetalleData(null);
    try {
      setLoadingDet(true);
      const data = await facturaService.getById(f.id);
      setDetalleData(data);
    } catch {}
    finally { setLoadingDet(false); }
  };

  /* ── Generar factura ── */
  const abrirGenerar = (orden) => {
    setOrdenTarget(orden);
    setGenForm({ descuento: 0, notas: '' });
    setError('');
    setShowGenerar(true);
  };

  const confirmarGenerar = async () => {
    if (!ordenTarget) return;
    try {
      setSaving(true);
      await facturaService.generar(ordenTarget.id, {
        descuento: Number(genForm.descuento) || 0,
        notas:     genForm.notas || null,
      });
      setShowGenerar(false);
      cargar();
      cargarStats();
      cargarOrdenesPend();
    } catch (err) {
      setError(err.data || 'Error al generar factura.');
    } finally { setSaving(false); }
  };

  /* ── Marcar pagada ── */
  const marcarPagada = async (f, e) => {
    e?.stopPropagation();
    try {
      const res = await facturaService.marcarPagada(f.id);
      cargar();
      cargarStats();
      if (detalle?.id === f.id)
        setDetalle(prev => ({ ...prev, estado: res.estado }));
    } catch { alert('No se pudo actualizar.'); }
  };

  /* ── Imprimir ── */
  const imprimir = (data) => {
    const w = window.open('', '_blank', 'width=800,height=900');
    w.document.write(generarHtmlFactura(data));
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  const generarHtmlFactura = (f) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${f.numero}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',sans-serif; color:#111; padding:40px; }
    .header { display:flex; justify-content:space-between;
              align-items:flex-start; margin-bottom:32px; }
    .logo   { font-size:22px; font-weight:900; color:#111; }
    .logo span { color:#2563eb; }
    .fac-info { text-align:right; }
    .fac-num  { font-size:20px; font-weight:800; color:#2563eb; }
    .fac-fecha{ font-size:13px; color:#666; margin-top:4px; }
    .estado-badge { display:inline-block; padding:4px 12px;
                    border-radius:999px; font-size:12px; font-weight:700;
                    margin-top:6px; }
    .pagada   { background:#dcfce7; color:#15803d; }
    .pendiente{ background:#fef3c7; color:#b45309; }
    .divider  { border:none; border-top:1px solid #e5e7eb; margin:20px 0; }
    .grid2    { display:grid; grid-template-columns:1fr 1fr; gap:24px;
                margin-bottom:24px; }
    .section-title { font-size:11px; font-weight:700; text-transform:uppercase;
                     letter-spacing:.06em; color:#9ca3af; margin-bottom:8px; }
    .info-val { font-size:14px; color:#374151; margin-bottom:3px; }
    .info-val strong { color:#111; }
    table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    th    { background:#f9fafb; padding:10px 12px; text-align:left;
            font-size:11px; font-weight:700; text-transform:uppercase;
            letter-spacing:.05em; color:#6b7280;
            border-bottom:2px solid #e5e7eb; }
    td    { padding:10px 12px; border-bottom:1px solid #f3f4f6;
            font-size:13px; color:#374151; }
    .type-badge { padding:2px 8px; border-radius:4px; font-size:11px;
                  font-weight:700; }
    .svc  { background:#dbeafe; color:#1d4ed8; }
    .prd  { background:#fef3c7; color:#b45309; }
    .totales { margin-left:auto; width:280px; }
    .tot-row { display:flex; justify-content:space-between;
               padding:8px 12px; font-size:14px; color:#374151; }
    .tot-row.total { background:#f9fafb; border-radius:8px; padding:12px;
                     font-weight:800; font-size:16px; color:#111; }
    .notas { background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;
             padding:12px 16px; font-size:13px; color:#6b7280;
             margin-bottom:20px; }
    .footer { text-align:center; font-size:12px; color:#9ca3af;
              margin-top:32px; border-top:1px solid #e5e7eb; padding-top:16px; }
    @media print {
      body { padding:20px; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">AUTO<span>TECH</span>
      <div style="font-size:12px;font-weight:400;color:#9ca3af;margin-top:4px">
        Taller Automotriz
      </div>
    </div>
    <div class="fac-info">
      <div class="fac-num">${f.numero}</div>
      <div class="fac-fecha">Fecha: ${f.fechaCorta}</div>
      <span class="estado-badge ${f.estado}">
        ${f.estado === 'pagada' ? '✓ Pagada' : '⏳ Pendiente'}
      </span>
    </div>
  </div>

  <hr class="divider">

  <div class="grid2">
    <div>
      <div class="section-title">Cliente</div>
      <div class="info-val"><strong>${f.cliente.nombre}</strong></div>
      <div class="info-val">${f.cliente.documento}</div>
      <div class="info-val">${f.cliente.email}</div>
      <div class="info-val">${f.cliente.telefono || ''}</div>
    </div>
    <div>
      <div class="section-title">Vehículo</div>
      <div class="info-val"><strong>${f.vehiculo.nombre} ${f.vehiculo.anio}</strong></div>
      <div class="info-val">Placa: ${f.vehiculo.placa}</div>
      <div class="info-val">Color: ${f.vehiculo.color}</div>
      <div class="info-val">Mecánico: ${f.mecanico}</div>
    </div>
  </div>

  <div class="section-title">Servicios y productos</div>
  <table>
    <thead>
      <tr>
        <th>Tipo</th><th>Descripción</th>
        <th style="text-align:right">Cant.</th>
        <th style="text-align:right">Precio unit.</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${f.detalles.map(d => `
      <tr>
        <td><span class="type-badge ${d.tipo === 'servicio' ? 'svc' : 'prd'}">
          ${d.tipo === 'servicio' ? 'SVC' : 'PRD'}
        </span></td>
        <td>${d.nombre}${d.descripcion ? `<br><small style="color:#9ca3af">${d.descripcion}</small>` : ''}</td>
        <td style="text-align:right">${d.cantidad}</td>
        <td style="text-align:right">$${Number(d.precioUnit).toLocaleString('es-CO')}</td>
        <td style="text-align:right">$${Number(d.subtotal).toLocaleString('es-CO')}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="totales">
    <div class="tot-row">
      <span>Subtotal</span>
      <span>$${Number(f.subtotal).toLocaleString('es-CO')}</span>
    </div>
    ${f.descuento > 0 ? `
    <div class="tot-row" style="color:#dc2626">
      <span>Descuento</span>
      <span>-$${Number(f.descuento).toLocaleString('es-CO')}</span>
    </div>` : ''}
    <div class="tot-row total">
      <span>TOTAL</span>
      <span>$${Number(f.total).toLocaleString('es-CO')}</span>
    </div>
  </div>

  ${f.notas ? `<div class="notas">📝 ${f.notas}</div>` : ''}

  <div class="footer">
    Gracias por confiar en AutoTech — ${f.numero} — ${f.fechaCorta}
  </div>
</body>
</html>`;

  /* ── Filtros ── */
  const filtrados = facturas.filter(f => {
    const q = busqueda.toLowerCase();
    return (f.cliente  || '').toLowerCase().includes(q) ||
           (f.vehiculo || '').toLowerCase().includes(q) ||
           (f.numero   || '').toLowerCase().includes(q) ||
           (f.placa    || '').toLowerCase().includes(q);
  });

  const fmt = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;

  /* ════════════════════════════════
     RENDER
  ════════════════════════════════ */
  return (
    <div className={`fac-page ${detalle ? 'fac-has-detalle' : ''}`}>
      <div className="fac-main">

        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-receipt" /> Facturación
            </h1>
            <p className="page-subtitle">
              Gestiona las facturas del taller
            </p>
          </div>
          {ordenesPend.length > 0 && (
            <div className="fac-nueva-badge">
              <i className="bi bi-exclamation-circle me-1" />
              {ordenesPend.length} orden{ordenesPend.length > 1 ? 'es' : ''} por facturar
            </div>
          )}
        </div>

        {/* STATS */}
        {stats && (
          <div className="fac-stats">
            <div className="fac-stat-card">
              <span className="fac-stat-icon">🧾</span>
              <div>
                <span className="fac-stat-num">{stats.totalFacturas}</span>
                <span className="fac-stat-label">Total facturas</span>
              </div>
            </div>
            <div className="fac-stat-card ingreso">
              <span className="fac-stat-icon">💰</span>
              <div>
                <span className="fac-stat-num">{fmt(stats.ingresoTotal)}</span>
                <span className="fac-stat-label">Ingresos totales</span>
              </div>
            </div>
            <div className="fac-stat-card mes">
              <span className="fac-stat-icon">📅</span>
              <div>
                <span className="fac-stat-num">{fmt(stats.ingresoMes)}</span>
                <span className="fac-stat-label">Ingresos este mes</span>
              </div>
            </div>
            <div className="fac-stat-card pendiente">
              <span className="fac-stat-icon">⏳</span>
              <div>
                <span className="fac-stat-num">{fmt(stats.pendienteCobro)}</span>
                <span className="fac-stat-label">Pendiente de cobro</span>
              </div>
            </div>
          </div>
        )}

        {/* ÓRDENES SIN FACTURAR */}
        {ordenesPend.length > 0 && (
          <div className="fac-pendientes">
            <div className="fac-pend-title">
              <i className="bi bi-clock-history me-1" />
              Órdenes terminadas pendientes de facturación
            </div>
            <div className="fac-pend-list">
              {ordenesPend.map(o => (
                <div key={o.id} className="fac-pend-item">
                  <div>
                    <span className="fac-pend-num">{o.numero}</span>
                    <span className="fac-pend-cliente">{o.cliente}</span>
                    <span className="fac-pend-vehiculo">
                      {o.vehiculo} — {o.placa}
                    </span>
                  </div>
                  <div className="fac-pend-right">
                    <span className="fac-pend-total">{fmt(o.total)}</span>
                    <button className="btn-primary fac-btn-gen"
                      onClick={() => abrirGenerar(o)}>
                      <i className="bi bi-receipt me-1" />
                      Generar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOOLBAR */}
        <div className="fac-toolbar">
          <div className="search-bar">
            <i className="bi bi-search" />
            <input
              placeholder="Buscar por cliente, vehículo, placa o número..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="fac-clear" onClick={() => setBusqueda('')}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          <div className="fac-filtros">
            {['todos','pagada','pendiente'].map(fe => (
              <button key={fe}
                className={`fac-filtro-btn ${filtroEstado === fe ? 'active' : ''}`}
                onClick={() => { setFiltroEstado(fe); }}>
                {fe === 'todos' ? 'Todas' : fe.charAt(0).toUpperCase() + fe.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* FILTROS FECHA */}
        <div className="fac-fechas">
          <div className="fac-fecha-group">
            <label>Desde</label>
            <input type="date" value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)} />
          </div>
          <div className="fac-fecha-group">
            <label>Hasta</label>
            <input type="date" value={fechaFin}
              onChange={e => setFechaFin(e.target.value)} />
          </div>
          <button className="btn-secondary fac-buscar"
            onClick={cargar}>
            <i className="bi bi-funnel me-1" /> Filtrar
          </button>
          {(fechaInicio || fechaFin) && (
            <button className="btn-secondary"
              onClick={() => {
                setFechaInicio(''); setFechaFin(''); cargar();
              }}>
              <i className="bi bi-x" /> Limpiar
            </button>
          )}
        </div>

        {/* TABLA */}
        {loading ? (
          <div className="loading-state">
            <i className="bi bi-arrow-repeat spin" /> Cargando facturas...
          </div>
        ) : (
          <div className="table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Vehículo</th>
                  <th>Fecha</th>
                  <th>Subtotal</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      <i className="bi bi-inbox me-2" />
                      No hay facturas registradas.
                    </td>
                  </tr>
                ) : filtrados.map(f => (
                  <tr key={f.id}
                    className={detalle?.id === f.id ? 'fac-row-active' : ''}
                    onClick={() => abrirDetalle(f)}
                    style={{ cursor: 'pointer' }}>
                    <td>
                      <span className="fac-num-badge">{f.numero}</span>
                    </td>
                    <td>
                      <div className="fac-cliente">{f.cliente}</div>
                      <div className="fac-sub">{f.email}</div>
                    </td>
                    <td>
                      <div className="fac-cliente">{f.vehiculo}</div>
                      <div className="fac-sub">{f.placa}</div>
                    </td>
                    <td className="fac-fecha">{f.fecha}</td>
                    <td className="fac-precio">{fmt(f.subtotal)}</td>
                    <td className="fac-precio fac-total">{fmt(f.total)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className={`fac-estado-btn ${f.estado}`}
                        onClick={e => marcarPagada(f, e)}>
                        <i className={`bi ${f.estado === 'pagada'
                          ? 'bi-check-circle' : 'bi-clock'} me-1`} />
                        {f.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                      </button>
                    </td>
                    <td className="actions-cell" onClick={e => e.stopPropagation()}>
                      <button className="btn-icon fac-btn-print"
                        onClick={async e => {
                          e.stopPropagation();
                          const data = await facturaService.getById(f.id);
                          imprimir(data);
                        }}
                        title="Imprimir / PDF">
                        <i className="bi bi-printer" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── PANEL LATERAL ── */}
      {detalle && (
        <aside className="fac-detalle">
          <div className="fac-detalle-header">
            <div>
              <span className="fac-num-badge">{detalle.numero}</span>
              <div style={{ marginTop: '.4rem' }}>
                <span className={`fac-estado-btn ${detalle.estado}`}
                  style={{ fontSize: '.75rem', cursor: 'default' }}>
                  <i className={`bi ${detalle.estado === 'pagada'
                    ? 'bi-check-circle' : 'bi-clock'} me-1`} />
                  {detalle.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                </span>
              </div>
            </div>
            <button className="modal-close"
              onClick={() => { setDetalle(null); setDetalleData(null); }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="fac-detalle-body">
            {loadingDet ? (
              <div className="loading-state" style={{ padding: '2rem' }}>
                <i className="bi bi-arrow-repeat spin" />
              </div>
            ) : detalleData ? (
              <>
                {/* Cliente */}
                <div className="fac-det-section">
                  <p className="fac-det-title">Cliente</p>
                  <div className="fac-det-row">
                    <i className="bi bi-person" />
                    <span>{detalleData.cliente?.nombre}</span>
                  </div>
                  <div className="fac-det-row">
                    <i className="bi bi-person-badge" />
                    <span>{detalleData.cliente?.documento}</span>
                  </div>
                  <div className="fac-det-row">
                    <i className="bi bi-envelope" />
                    <span>{detalleData.cliente?.email}</span>
                  </div>
                </div>

                {/* Vehículo */}
                <div className="fac-det-section">
                  <p className="fac-det-title">Vehículo</p>
                  <div className="fac-det-row">
                    <i className="bi bi-car-front" />
                    <span>{detalleData.vehiculo?.nombre} {detalleData.vehiculo?.anio}</span>
                  </div>
                  <div className="fac-det-row">
                    <i className="bi bi-upc" />
                    <span>{detalleData.vehiculo?.placa}</span>
                  </div>
                </div>

                {/* Detalles */}
                <div className="fac-det-section">
                  <p className="fac-det-title">Servicios y Productos</p>
                  {detalleData.detalles?.map((d, i) => (
                    <div key={i} className="fac-det-item">
                      <div className="fac-det-item-info">
                        <span className={`fac-tipo-badge ${d.tipo}`}>
                          {d.tipo === 'servicio' ? 'SVC' : 'PRD'}
                        </span>
                        <span className="fac-det-nombre">{d.nombre}</span>
                      </div>
                      <div className="fac-det-item-precio">
                        {d.cantidad}x {fmt(d.precioUnit)}
                        <span className="fac-det-sub">= {fmt(d.subtotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="fac-det-section">
                  <p className="fac-det-title">Totales</p>
                  <div className="fac-tot-row">
                    <span>Subtotal</span>
                    <span>{fmt(detalleData.subtotal)}</span>
                  </div>
                  {detalleData.descuento > 0 && (
                    <div className="fac-tot-row descuento">
                      <span>Descuento</span>
                      <span>-{fmt(detalleData.descuento)}</span>
                    </div>
                  )}
                  <div className="fac-tot-row total">
                    <span>TOTAL</span>
                    <strong>{fmt(detalleData.total)}</strong>
                  </div>
                </div>

                {/* Notas */}
                {detalleData.notas && (
                  <div className="fac-det-section">
                    <p className="fac-det-title">Notas</p>
                    <p className="fac-notas-texto">{detalleData.notas}</p>
                  </div>
                )}
              </>
            ) : null}
          </div>

          <div className="fac-detalle-footer">
            <button className="btn-primary fac-w-full"
              onClick={async () => {
                if (!detalleData) return;
                imprimir(detalleData);
              }}>
              <i className="bi bi-printer me-1" /> Imprimir / PDF
            </button>
            <button
              className={`fac-w-full fac-pagar-btn ${detalle.estado}`}
              onClick={e => marcarPagada(detalle, e)}>
              <i className={`bi ${detalle.estado === 'pagada'
                ? 'bi-arrow-counterclockwise' : 'bi-check-circle'} me-1`} />
              {detalle.estado === 'pagada'
                ? 'Marcar pendiente' : 'Marcar como pagada'}
            </button>
          </div>
        </aside>
      )}

      {/* ══ MODAL GENERAR FACTURA ══ */}
      {showGenerar && ordenTarget && (
        <div className="modal-overlay" onClick={() => setShowGenerar(false)}>
          <div className="modal-card modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="bi bi-receipt me-2" />Generar Factura</h2>
              <button className="modal-close" onClick={() => setShowGenerar(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert-error">
                  <i className="bi bi-exclamation-triangle me-1" />{error}
                </div>
              )}

              <div className="fac-gen-resumen">
                <div className="fac-gen-row">
                  <span>Orden</span>
                  <strong>{ordenTarget.numero}</strong>
                </div>
                <div className="fac-gen-row">
                  <span>Cliente</span>
                  <span>{ordenTarget.cliente}</span>
                </div>
                <div className="fac-gen-row">
                  <span>Vehículo</span>
                  <span>{ordenTarget.vehiculo}</span>
                </div>
                <div className="fac-gen-row total">
                  <span>Subtotal calculado</span>
                  <strong>{fmt(ordenTarget.total)}</strong>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Descuento (opcional)</label>
                <div className="prd-precio-input">
                  <span>$</span>
                  <input type="number" min="0"
                    max={ordenTarget.total}
                    placeholder="0"
                    value={genForm.descuento}
                    onChange={e => setGenForm(p => ({
                      ...p, descuento: e.target.value
                    }))} />
                </div>
                {Number(genForm.descuento) > 0 && (
                  <p className="fac-gen-total-preview">
                    Total con descuento:
                    <strong>
                      {fmt(ordenTarget.total - Number(genForm.descuento))}
                    </strong>
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Notas adicionales</label>
                <textarea rows={2}
                  className="ord-textarea"
                  placeholder="Ej: Garantía de 30 días en piezas..."
                  value={genForm.notas}
                  onChange={e => setGenForm(p => ({
                    ...p, notas: e.target.value
                  }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary"
                onClick={() => setShowGenerar(false)}
                disabled={saving}>Cancelar</button>
              <button className="btn-primary" onClick={confirmarGenerar}
                disabled={saving}>
                {saving
                  ? <><i className="bi bi-arrow-repeat spin me-1" />Generando...</>
                  : <><i className="bi bi-receipt me-1" />Generar factura</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}