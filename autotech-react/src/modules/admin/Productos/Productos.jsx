import { useState, useEffect } from 'react';
import './Productos.css';
import { productoService } from '../../../services/adminService';

const CATEGORIAS = [
  'General', 'Lubricantes', 'Filtros', 'Frenos',
  'Suspensión', 'Eléctrico', 'Motor', 'Carrocería',
  'Transmisión', 'Neumáticos',
];

const CAT_COLOR = {
  'General':      { bg: '#f3f4f6', color: '#374151' },
  'Lubricantes':  { bg: '#fef3c7', color: '#b45309' },
  'Filtros':      { bg: '#dbeafe', color: '#1d4ed8' },
  'Frenos':       { bg: '#fee2e2', color: '#b91c1c' },
  'Suspensión':   { bg: '#dcfce7', color: '#15803d' },
  'Eléctrico':    { bg: '#fef9c3', color: '#a16207' },
  'Motor':        { bg: '#ffedd5', color: '#c2410c' },
  'Carrocería':   { bg: '#fce7f3', color: '#be185d' },
  'Transmisión':  { bg: '#e0f2fe', color: '#0369a1' },
  'Neumáticos':   { bg: '#ede9fe', color: '#6d28d9' },
};

const STOCK_CONFIG = {
  ok:      { label: '✓ OK',      bg: '#dcfce7', color: '#15803d' },
  bajo:    { label: '⚠ Bajo',    bg: '#fef3c7', color: '#b45309' },
  agotado: { label: '✕ Agotado', bg: '#fee2e2', color: '#b91c1c' },
};

const EMPTY_FORM = {
  nombre: '', descripcion: '', stock: 0,
  stockMinimo: 5, precio: '', categoria: 'General',
};

const TABS = ['detalle', 'stock', 'historial'];

export default function Productos() {
  const [productos,    setProductos]    = useState([]);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [editingId,    setEditingId]    = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [showStock,    setShowStock]    = useState(false);
  const [stockForm,    setStockForm]    = useState({ cantidad: '', motivo: '', tipo: 'entrada' });
  const [stockTarget,  setStockTarget]  = useState(null);
  const [detalle,      setDetalle]      = useState(null);
  const [tabDetalle,   setTabDetalle]   = useState('detalle');
  const [historial,    setHistorial]    = useState([]);
  const [loadingHist,  setLoadingHist]  = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [errorStock,   setErrorStock]   = useState('');
  const [busqueda,     setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroStock,  setFiltroStock]  = useState('todos');
  const [filtroCat,    setFiltroCat]    = useState('todas');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await productoService.getAll();
      setProductos(data || []);
    } catch { setProductos([]); }
    finally  { setLoading(false); }
  };

  /* ── Detalle panel ── */
  const abrirDetalle = async (p) => {
    if (detalle?.id === p.id) { setDetalle(null); return; }
    setDetalle(p);
    setTabDetalle('detalle');
    setHistorial([]);
  };

  const cargarHistorial = async () => {
    if (!detalle || historial.length > 0) return;
    try {
      setLoadingHist(true);
      const data = await productoService.getHistorial(detalle.id);
      setHistorial(data || []);
    } catch { setHistorial([]); }
    finally  { setLoadingHist(false); }
  };

  const handleTab = (tab) => {
    setTabDetalle(tab);
    if (tab === 'historial') cargarHistorial();
  };

  /* ── Modal producto ── */
  const abrirCrear = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowModal(true);
  };

  const abrirEditar = (p) => {
    setForm({
      nombre:      p.nombre,
      descripcion: p.descripcion || '',
      stock:       p.stock,
      stockMinimo: p.stockMinimo,
      precio:      p.precio,
      categoria:   p.categoria || 'General',
    });
    setEditingId(p.id);
    setError('');
    setShowModal(true);
  };

  const cerrarModal = () => { setShowModal(false); setError(''); };

  const guardar = async () => {
    if (!form.nombre.trim()) {
      setError('El nombre es requerido.'); return;
    }
    if (!form.precio || Number(form.precio) < 0) {
      setError('El precio debe ser un número válido.'); return;
    }
    try {
      setSaving(true);
      setError('');
      const payload = {
        nombre:      form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        stock:       Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
        precio:      Number(form.precio),
        categoria:   form.categoria,
      };
      if (editingId) {
        await productoService.actualizar(editingId, payload);
      } else {
        await productoService.crear(payload);
      }
      cerrarModal();
      setDetalle(null);
      cargar();
    } catch (err) {
      setError(err.data || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Modal stock ── */
  const abrirStock = (p, e) => {
    e?.stopPropagation();
    setStockTarget(p);
    setStockForm({ cantidad: '', motivo: '', tipo: 'entrada' });
    setErrorStock('');
    setShowStock(true);
  };

  const guardarStock = async () => {
    if (!stockForm.cantidad || Number(stockForm.cantidad) <= 0) {
      setErrorStock('Ingresa una cantidad válida mayor a 0.'); return;
    }
    try {
      const delta = stockForm.tipo === 'entrada'
        ? Number(stockForm.cantidad)
        : -Number(stockForm.cantidad);

      const res = await productoService.actualizarStock(stockTarget.id, {
        cantidad: delta,
        motivo: stockForm.motivo,
      });
      setShowStock(false);
      // Actualiza en lista sin recargar todo
      setProductos(prev => prev.map(p =>
        p.id === stockTarget.id
          ? { ...p, stock: res.stock, stockEstado: res.stockEstado }
          : p
      ));
      if (detalle?.id === stockTarget.id)
        setDetalle(prev => ({
          ...prev, stock: res.stock, stockEstado: res.stockEstado
        }));
    } catch (err) {
      setErrorStock(err.data || 'Error al actualizar stock.');
    }
  };

  const cambiarEstado = async (p, e) => {
    e?.stopPropagation();
    try {
      await productoService.cambiarEstado(p.id);
      cargar();
      if (detalle?.id === p.id)
        setDetalle(prev => ({
          ...prev,
          estado: prev.estado === 'activo' ? 'inactivo' : 'activo'
        }));
    } catch { alert('No se pudo cambiar el estado.'); }
  };

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const catColor = (cat) => CAT_COLOR[cat] || CAT_COLOR['General'];

  const categoriasUsadas = ['todas',
    ...new Set(productos.map(p => p.categoria).filter(Boolean))];

  const filtrados = productos.filter(p => {
    const q = busqueda.toLowerCase();
    const matchQ =
      (p.nombre      || '').toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q) ||
      (p.categoria   || '').toLowerCase().includes(q);
    const matchE = filtroEstado === 'todos' || p.estado === filtroEstado;
    const matchS = filtroStock  === 'todos' || p.stockEstado === filtroStock;
    const matchC = filtroCat    === 'todas' || p.categoria   === filtroCat;
    return matchQ && matchE && matchS && matchC;
  });

  const resumen = {
    total:   productos.length,
    activos: productos.filter(p => p.estado === 'activo').length,
    bajos:   productos.filter(p => p.stockEstado === 'bajo').length,
    agotados:productos.filter(p => p.stockEstado === 'agotado').length,
  };

  /* ════════════════════════════════════
     RENDER
  ════════════════════════════════════ */
  return (
    <div className={`prd-page ${detalle ? 'prd-has-detalle' : ''}`}>
      <div className="prd-main">

        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-shop" /> Productos
            </h1>
            <p className="page-subtitle">
              Gestiona el inventario de productos del taller
            </p>
          </div>
          <button className="btn-primary" onClick={abrirCrear}>
            <i className="bi bi-plus-lg" /> Nuevo Producto
          </button>
        </div>

        {/* CARDS RESUMEN */}
        <div className="prd-resumen">
          <div className="prd-res-card">
            <span className="prd-res-num">{resumen.total}</span>
            <span className="prd-res-label">Total productos</span>
          </div>
          <div className="prd-res-card activos">
            <span className="prd-res-num">{resumen.activos}</span>
            <span className="prd-res-label">Activos</span>
          </div>
          <div className="prd-res-card bajos"
            style={{ cursor: 'pointer' }}
            onClick={() => setFiltroStock(
              filtroStock === 'bajo' ? 'todos' : 'bajo')}>
            <span className="prd-res-num">{resumen.bajos}</span>
            <span className="prd-res-label">Stock bajo</span>
          </div>
          <div className="prd-res-card agotados"
            style={{ cursor: 'pointer' }}
            onClick={() => setFiltroStock(
              filtroStock === 'agotado' ? 'todos' : 'agotado')}>
            <span className="prd-res-num">{resumen.agotados}</span>
            <span className="prd-res-label">Agotados</span>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="prd-toolbar">
          <div className="search-bar">
            <i className="bi bi-search" />
            <input
              placeholder="Buscar por nombre, descripción o categoría..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="prd-clear" onClick={() => setBusqueda('')}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>
          <div className="prd-filtros">
            {['todos', 'activo', 'inactivo'].map(fe => (
              <button key={fe}
                className={`prd-filtro-btn ${filtroEstado === fe ? 'active' : ''}`}
                onClick={() => setFiltroEstado(fe)}>
                {fe.charAt(0).toUpperCase() + fe.slice(1)}
              </button>
            ))}
          </div>
          <span className="prd-count">
            {filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* FILTRO CATEGORÍAS */}
        <div className="prd-cats">
          {categoriasUsadas.map(cat => (
            <button key={cat}
              className={`prd-cat-btn ${filtroCat === cat ? 'active' : ''}`}
              style={filtroCat === cat && cat !== 'todas'
                ? { background: catColor(cat).bg,
                    color: catColor(cat).color,
                    borderColor: catColor(cat).color }
                : {}}
              onClick={() => setFiltroCat(cat)}>
              {cat === 'todas' ? 'Todas' : cat}
            </button>
          ))}
          {filtroStock !== 'todos' && (
            <button className="prd-cat-btn active prd-stock-filtro"
              onClick={() => setFiltroStock('todos')}>
              <i className="bi bi-x me-1" />
              {filtroStock === 'bajo' ? 'Stock bajo' : 'Agotados'}
            </button>
          )}
        </div>

        {/* TABLA */}
        {loading ? (
          <div className="loading-state">
            <i className="bi bi-arrow-repeat spin" /> Cargando productos...
          </div>
        ) : (
          <div className="table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-row">
                      <i className="bi bi-inbox me-2" />
                      {busqueda ? 'Sin resultados.' : 'No hay productos registrados.'}
                    </td>
                  </tr>
                ) : filtrados.map((p, i) => (
                  <tr key={p.id}
                    className={detalle?.id === p.id ? 'prd-row-active' : ''}
                    onClick={() => abrirDetalle(p)}
                    style={{ cursor: 'pointer' }}>
                    <td className="prd-td-num">{i + 1}</td>
                    <td>
                      <div className="prd-nombre">{p.nombre}</div>
                      <div className="prd-desc">{p.descripcion || '—'}</div>
                    </td>
                    <td>
                      <span className="prd-badge-cat"
                        style={{ background: catColor(p.categoria).bg,
                                 color: catColor(p.categoria).color }}>
                        {p.categoria}
                      </span>
                    </td>
                    <td className="prd-precio">
                      ${Number(p.precio).toLocaleString('es-CO')}
                    </td>
                    <td>
                      <div className="prd-stock-cell">
                        <span className="prd-stock-num">{p.stock}</span>
                        <span className="prd-badge-stock"
                          style={{ background: STOCK_CONFIG[p.stockEstado]?.bg,
                                   color: STOCK_CONFIG[p.stockEstado]?.color }}>
                          {STOCK_CONFIG[p.stockEstado]?.label}
                        </span>
                      </div>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className={`prd-estado-btn ${p.estado}`}
                        onClick={e => cambiarEstado(p, e)}>
                        <i className={`bi ${p.estado === 'activo'
                          ? 'bi-toggle-on' : 'bi-toggle-off'}`} />
                        {p.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="actions-cell" onClick={e => e.stopPropagation()}>
                      <button className="btn-icon edit"
                        onClick={() => abrirEditar(p)} title="Editar">
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn-icon prd-stock-btn"
                        onClick={e => abrirStock(p, e)} title="Actualizar stock">
                        <i className="bi bi-box-arrow-in-down" />
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
        <aside className="prd-detalle">
          <div className="prd-detalle-header">
            <div className="prd-detalle-icon"
              style={{ background: catColor(detalle.categoria).bg,
                       color: catColor(detalle.categoria).color }}>
              <i className="bi bi-box-seam" />
            </div>
            <button className="modal-close" onClick={() => setDetalle(null)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="prd-detalle-info">
            <h3 className="prd-detalle-nombre">{detalle.nombre}</h3>
            <span className="prd-badge-cat"
              style={{ background: catColor(detalle.categoria).bg,
                       color: catColor(detalle.categoria).color }}>
              {detalle.categoria}
            </span>
          </div>

          {/* Tabs */}
          <div className="prd-tabs">
            {TABS.map(tab => (
              <button key={tab}
                className={`prd-tab ${tabDetalle === tab ? 'active' : ''}`}
                onClick={() => handleTab(tab)}>
                {tab === 'detalle'   && <><i className="bi bi-info-circle me-1" />Info</>}
                {tab === 'stock'     && <><i className="bi bi-boxes me-1" />Stock</>}
                {tab === 'historial' && <><i className="bi bi-clock-history me-1" />Historial</>}
              </button>
            ))}
          </div>

          <div className="prd-tab-content">

            {/* TAB INFO */}
            {tabDetalle === 'detalle' && (
              <div className="prd-tab-body">
                <div className="prd-precio-card">
                  <span className="prd-precio-label">Precio unitario</span>
                  <span className="prd-precio-val">
                    ${Number(detalle.precio).toLocaleString('es-CO')}
                  </span>
                </div>
                <p className="prd-section-title">Descripción</p>
                <p className="prd-desc-full">
                  {detalle.descripcion || 'Sin descripción.'}
                </p>
                <p className="prd-section-title" style={{ marginTop: '1rem' }}>
                  Uso en órdenes
                </p>
                <div className="prd-stat">
                  <span className="prd-stat-num">{detalle.vecesUsado}</span>
                  <span className="prd-stat-label">veces utilizado</span>
                </div>
              </div>
            )}

            {/* TAB STOCK */}
            {tabDetalle === 'stock' && (
              <div className="prd-tab-body">
                <div className="prd-stock-panel">
                  <div className="prd-stock-big">
                    <span className="prd-stock-big-num"
                      style={{ color: STOCK_CONFIG[detalle.stockEstado]?.color }}>
                      {detalle.stock}
                    </span>
                    <span className="prd-stock-big-label">unidades en stock</span>
                  </div>
                  <div className="prd-stock-info-row">
                    <div className="prd-stock-info-item">
                      <span className="prd-info-label">Stock mínimo</span>
                      <span className="prd-info-val">{detalle.stockMinimo}</span>
                    </div>
                    <div className="prd-stock-info-item">
                      <span className="prd-info-label">Estado</span>
                      <span className="prd-badge-stock"
                        style={{ background: STOCK_CONFIG[detalle.stockEstado]?.bg,
                                 color: STOCK_CONFIG[detalle.stockEstado]?.color }}>
                        {STOCK_CONFIG[detalle.stockEstado]?.label}
                      </span>
                    </div>
                  </div>
                  <button className="btn-primary prd-w-full"
                    style={{ marginTop: '.75rem' }}
                    onClick={e => abrirStock(detalle, e)}>
                    <i className="bi bi-box-arrow-in-down me-1" />
                    Actualizar stock
                  </button>
                </div>
              </div>
            )}

            {/* TAB HISTORIAL */}
            {tabDetalle === 'historial' && (
              <div className="prd-historial">
                {loadingHist ? (
                  <div className="loading-state" style={{ padding: '2rem' }}>
                    <i className="bi bi-arrow-repeat spin" />
                  </div>
                ) : historial.length === 0 ? (
                  <p className="empty-row" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    Sin uso registrado.
                  </p>
                ) : historial.map((h, i) => (
                  <div key={i} className="prd-hist-card">
                    <div className="prd-hist-top">
                      <span className="prd-hist-orden">Orden #{h.idOrden}</span>
                      <span className={`prd-hist-estado ${h.estado}`}>
                        {h.estado.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="prd-hist-row">
                      <i className="bi bi-car-front" />{h.vehiculo}
                    </div>
                    <div className="prd-hist-row">
                      <i className="bi bi-person" />{h.cliente}
                    </div>
                    <div className="prd-hist-footer">
                      <span>{h.cantidad} und × ${Number(h.precio).toLocaleString('es-CO')}</span>
                      <span className="prd-hist-fecha">{h.fecha}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="prd-detalle-footer">
            <button className="btn-secondary prd-w-full"
              onClick={() => abrirEditar(detalle)}>
              <i className="bi bi-pencil me-1" /> Editar producto
            </button>
            <button
              className={`prd-w-full prd-toggle-btn ${detalle.estado}`}
              onClick={e => cambiarEstado(detalle, e)}>
              <i className={`bi ${detalle.estado === 'activo'
                ? 'bi-toggle-off' : 'bi-toggle-on'} me-1`} />
              {detalle.estado === 'activo' ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </aside>
      )}

      {/* ══ MODAL PRODUCTO ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-card modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className={`bi ${editingId
                  ? 'bi-pencil' : 'bi-plus-circle'} me-2`} />
                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button className="modal-close" onClick={cerrarModal}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert-error">
                  <i className="bi bi-exclamation-triangle me-1" />{error}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Nombre *</label>
                <input type="text" placeholder="Ej: Filtro de aceite"
                  value={form.nombre}
                  onChange={e => f('nombre', e.target.value)} />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Descripción</label>
                <textarea rows={2}
                  placeholder="Describe brevemente el producto..."
                  value={form.descripcion}
                  onChange={e => f('descripcion', e.target.value)}
                  className="prd-textarea" />
              </div>

              <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Precio *</label>
                  <div className="prd-precio-input">
                    <span>$</span>
                    <input type="number" min="0" placeholder="0"
                      value={form.precio}
                      onChange={e => f('precio', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select value={form.categoria}
                    onChange={e => f('categoria', e.target.value)}>
                    {CATEGORIAS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {!editingId && (
                  <div className="form-group">
                    <label>Stock inicial</label>
                    <input type="number" min="0"
                      value={form.stock}
                      onChange={e => f('stock', e.target.value)} />
                  </div>
                )}
                <div className="form-group">
                  <label>Stock mínimo</label>
                  <input type="number" min="1"
                    value={form.stockMinimo}
                    onChange={e => f('stockMinimo', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={cerrarModal}
                disabled={saving}>Cancelar</button>
              <button className="btn-primary" onClick={guardar}
                disabled={saving}>
                {saving
                  ? <><i className="bi bi-arrow-repeat spin me-1" />Guardando...</>
                  : <><i className={`bi ${editingId
                      ? 'bi-check-lg' : 'bi-plus-lg'} me-1`} />
                      {editingId ? 'Guardar cambios' : 'Crear producto'}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL STOCK ══ */}
      {showStock && (
        <div className="modal-overlay" onClick={() => setShowStock(false)}>
          <div className="modal-card modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="bi bi-boxes me-2" />
                Actualizar Stock
              </h2>
              <button className="modal-close" onClick={() => setShowStock(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              {errorStock && (
                <div className="alert-error">
                  <i className="bi bi-exclamation-triangle me-1" />{errorStock}
                </div>
              )}

              <div className="prd-stock-actual">
                <span>Stock actual de <strong>{stockTarget?.nombre}</strong></span>
                <span className="prd-stock-act-num">{stockTarget?.stock} und</span>
              </div>

              {/* Tipo entrada/salida */}
              <div className="prd-tipo-row" style={{ marginBottom: '1rem' }}>
                {['entrada', 'salida'].map(tipo => (
                  <button key={tipo} type="button"
                    className={`prd-tipo-btn ${stockForm.tipo === tipo ? 'active' : ''}`}
                    style={stockForm.tipo === tipo ? {
                      background: tipo === 'entrada' ? '#dcfce7' : '#fee2e2',
                      color:      tipo === 'entrada' ? '#15803d' : '#b91c1c',
                      borderColor:tipo === 'entrada' ? '#86efac' : '#fca5a5',
                    } : {}}
                    onClick={() => setStockForm(p => ({ ...p, tipo }))}>
                    <i className={`bi ${tipo === 'entrada'
                      ? 'bi-box-arrow-in-down' : 'bi-box-arrow-up'} me-1`} />
                    {tipo === 'entrada' ? 'Entrada' : 'Salida'}
                  </button>
                ))}
              </div>

              <div className="form-group" style={{ marginBottom: '.75rem' }}>
                <label>Cantidad *</label>
                <input type="number" min="1" placeholder="Ej: 10"
                  value={stockForm.cantidad}
                  onChange={e => setStockForm(p => ({
                    ...p, cantidad: e.target.value
                  }))}
                  autoFocus />
              </div>

              <div className="form-group">
                <label>Motivo (opcional)</label>
                <input type="text"
                  placeholder={stockForm.tipo === 'entrada'
                    ? 'Ej: Compra a proveedor'
                    : 'Ej: Utilizado en orden #123'}
                  value={stockForm.motivo}
                  onChange={e => setStockForm(p => ({
                    ...p, motivo: e.target.value
                  }))} />
              </div>

              {/* Preview */}
              {stockForm.cantidad && Number(stockForm.cantidad) > 0 && (
                <div className="prd-stock-preview">
                  <span>Nuevo stock estimado:</span>
                  <strong style={{
                    color: stockForm.tipo === 'entrada' ? '#15803d' : '#b91c1c'
                  }}>
                    {stockForm.tipo === 'entrada'
                      ? stockTarget?.stock + Number(stockForm.cantidad)
                      : stockTarget?.stock - Number(stockForm.cantidad)
                    } und
                  </strong>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary"
                onClick={() => setShowStock(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarStock}>
                <i className="bi bi-check-lg me-1" /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}