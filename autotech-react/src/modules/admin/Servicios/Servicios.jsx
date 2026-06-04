import { useState, useEffect } from 'react';
import './Servicios.css';
import { servicioService } from '../../../services/adminService';

const CATEGORIAS = [
  'General', 'Mantenimiento', 'Diagnóstico', 'Reparación',
  'Eléctrico', 'Carrocería', 'Frenos', 'Suspensión', 'Motor', 'Transmisión',
];

const CATEGORIA_COLOR = {
  'General':       { bg: '#f3f4f6', color: '#374151' },
  'Mantenimiento': { bg: '#dbeafe', color: '#1d4ed8' },
  'Diagnóstico':   { bg: '#ede9fe', color: '#6d28d9' },
  'Reparación':    { bg: '#fef3c7', color: '#b45309' },
  'Eléctrico':     { bg: '#fef9c3', color: '#a16207' },
  'Carrocería':    { bg: '#fce7f3', color: '#be185d' },
  'Frenos':        { bg: '#fee2e2', color: '#b91c1c' },
  'Suspensión':    { bg: '#dcfce7', color: '#15803d' },
  'Motor':         { bg: '#ffedd5', color: '#c2410c' },
  'Transmisión':   { bg: '#e0f2fe', color: '#0369a1' },
};

const EMPTY_FORM = {
  nombre: '', descripcion: '', precioBase: '', categoria: 'General',
};

export default function Servicios() {
  const [servicios,    setServicios]    = useState([]);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [editingId,    setEditingId]    = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [detalle,      setDetalle]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [fieldErrors,  setFieldErrors]  = useState({});
  const [busqueda,     setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCat,    setFiltroCat]    = useState('todas');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await servicioService.getAll();
      setServicios(data || []);
    } catch { setServicios([]); }
    finally  { setLoading(false); }
  };

  /* ── Modal ── */
  const abrirCrear = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setFieldErrors({});
    setShowModal(true);
  };

  const abrirEditar = (s) => {
    setForm({
      nombre:      s.nombre,
      descripcion: s.descripcion || '',
      precioBase:  s.precioBase,
      categoria:   s.categoria || 'General',
    });
    setEditingId(s.id);
    setError('');
    setFieldErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setError('');
    setFieldErrors({});
  };

  /* ── Validación ── */
  const validar = () => {
    const errs = {};

    if (!form.nombre.trim())
      errs.nombre = 'El nombre es requerido.';
    else if (form.nombre.trim().length < 3)
      errs.nombre = 'El nombre debe tener al menos 3 caracteres.';

    if (form.precioBase === '' || form.precioBase === null)
      errs.precioBase = 'El precio base es requerido.';
    else if (isNaN(Number(form.precioBase)) || Number(form.precioBase) < 0)
      errs.precioBase = 'El precio debe ser un número mayor o igual a 0.';

    if (!form.categoria)
      errs.categoria = 'La categoría es requerida.';

    return errs;
  };

  const guardar = async () => {
    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError('Corrige los errores para guardar el servicio.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      setFieldErrors({});
      const payload = {
        nombre:      form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precioBase:  Number(form.precioBase),
        categoria:   form.categoria,
      };
      if (editingId) {
        await servicioService.actualizar(editingId, payload);
      } else {
        await servicioService.crear(payload);
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

  const cambiarEstado = async (s, e) => {
    e?.stopPropagation();
    try {
      await servicioService.cambiarEstado(s.id);
      cargar();
      if (detalle?.id === s.id)
        setDetalle(prev => ({
          ...prev,
          estado: prev.estado === 'activo' ? 'inactivo' : 'activo'
        }));
    } catch { alert('No se pudo cambiar el estado.'); }
  };

  const f = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setFieldErrors(p => ({ ...p, [key]: '' }));
  };

  const catColor = (cat) => CATEGORIA_COLOR[cat] || CATEGORIA_COLOR['General'];

  const categoriasUsadas = ['todas',
    ...new Set(servicios.map(s => s.categoria).filter(Boolean))];

  const filtrados = servicios.filter(s => {
    const q = busqueda.toLowerCase();
    const matchQ =
      (s.nombre      || '').toLowerCase().includes(q) ||
      (s.descripcion || '').toLowerCase().includes(q) ||
      (s.categoria   || '').toLowerCase().includes(q);
    const matchE = filtroEstado === 'todos' || s.estado === filtroEstado;
    const matchC = filtroCat   === 'todas'  || s.categoria === filtroCat;
    return matchQ && matchE && matchC;
  });

  /* ════════════════════════════════
      RENDER
     ════════════════════════════════ */
  return (
    <div className={`srv-page ${detalle ? 'srv-has-detalle' : ''}`}>

      {/* ── COLUMNA PRINCIPAL ── */}
      <div className="srv-main">

        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title"><i className="bi bi-tools" /> Servicios</h1>
            <p className="page-subtitle">Gestiona el catálogo de servicios del taller</p>
          </div>
          <button className="btn-primary" onClick={abrirCrear}>
            <i className="bi bi-plus-lg" /> Nuevo Servicio
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="srv-toolbar">
          <div className="search-bar">
            <i className="bi bi-search" />
            <input
              placeholder="Buscar por nombre, descripción o categoría..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="srv-clear" onClick={() => setBusqueda('')}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>
          <div className="srv-filtros">
            {['todos', 'activo', 'inactivo'].map(fe => (
              <button key={fe}
                className={`srv-filtro-btn ${filtroEstado === fe ? 'active' : ''}`}
                onClick={() => setFiltroEstado(fe)}>
                {fe.charAt(0).toUpperCase() + fe.slice(1)}
              </button>
            ))}
          </div>
          <span className="srv-count">
            {filtrados.length} servicio{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* FILTRO CATEGORÍAS */}
        <div className="srv-cats">
          {categoriasUsadas.map(cat => (
            <button key={cat}
              className={`srv-cat-btn ${filtroCat === cat ? 'active' : ''}`}
              style={filtroCat === cat && cat !== 'todas'
                ? { background: catColor(cat).bg, color: catColor(cat).color,
                    borderColor: catColor(cat).color }
                : {}}
              onClick={() => setFiltroCat(cat)}>
              {cat === 'todas' ? 'Todas las categorías' : cat}
            </button>
          ))}
        </div>

        {/* TABLA */}
        {loading ? (
          <div className="loading-state">
            <i className="bi bi-arrow-repeat spin" /> Cargando servicios...
          </div>
        ) : (
          <div className="table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th><th>Servicio</th><th>Categoría</th>
                  <th>Precio base</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      <i className="bi bi-inbox me-2" />
                      {busqueda ? 'Sin resultados.' : 'No hay servicios registrados.'}
                    </td>
                  </tr>
                ) : filtrados.map((s, i) => (
                  <tr key={s.id}
                    className={detalle?.id === s.id ? 'srv-row-active' : ''}
                    onClick={() => setDetalle(detalle?.id === s.id ? null : s)}
                    style={{ cursor: 'pointer' }}>
                    <td className="srv-td-num">{i + 1}</td>
                    <td>
                      <div className="srv-nombre">{s.nombre}</div>
                      <div className="srv-desc">{s.descripcion || '—'}</div>
                    </td>
                    <td>
                      <span className="srv-badge-cat"
                        style={{ background: catColor(s.categoria).bg,
                                 color: catColor(s.categoria).color }}>
                        {s.categoria}
                      </span>
                    </td>
                    <td className="srv-precio">
                      ${Number(s.precioBase).toLocaleString('es-CO')}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className={`srv-estado-btn ${s.estado}`}
                        onClick={e => cambiarEstado(s, e)}>
                        <i className={`bi ${s.estado === 'activo' ? 'bi-toggle-on' : 'bi-toggle-off'}`} />
                        {s.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="actions-cell" onClick={e => e.stopPropagation()}>
                      <button className="btn-icon edit"
                        onClick={() => abrirEditar(s)} title="Editar">
                        <i className="bi bi-pencil" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── PANEL LATERAL DETALLE ── */}
      {detalle && (
        <aside className="srv-detalle">
          <div className="srv-detalle-header">
            <div className="srv-detalle-icon"
              style={{ background: catColor(detalle.categoria).bg,
                       color: catColor(detalle.categoria).color }}>
              <i className="bi bi-tools" />
            </div>
            <button className="modal-close" onClick={() => setDetalle(null)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="srv-detalle-body">
            <h3 className="srv-detalle-nombre">{detalle.nombre}</h3>
            <span className="srv-badge-cat"
              style={{ background: catColor(detalle.categoria).bg,
                       color: catColor(detalle.categoria).color }}>
              {detalle.categoria}
            </span>
            <div style={{ marginTop: '.6rem' }}>
              <span className={`srv-estado-btn ${detalle.estado}`}
                style={{ fontSize: '.75rem' }}>
                <i className={`bi ${detalle.estado === 'activo'
                  ? 'bi-toggle-on' : 'bi-toggle-off'} me-1`} />
                {detalle.estado}
              </span>
            </div>
            <div className="srv-detalle-precio">
              <span className="srv-precio-label">Precio base</span>
              <span className="srv-precio-val">
                ${Number(detalle.precioBase).toLocaleString('es-CO')}
              </span>
            </div>
            <div className="srv-detalle-section">
              <p className="srv-section-title">Descripción</p>
              <p className="srv-desc-full">
                {detalle.descripcion || 'Sin descripción registrada.'}
              </p>
            </div>
          </div>

          <div className="srv-detalle-footer">
            <button className="btn-secondary srv-w-full"
              onClick={() => abrirEditar(detalle)}>
              <i className="bi bi-pencil me-1" /> Editar servicio
            </button>
            <button className={`srv-w-full srv-toggle-btn ${detalle.estado}`}
              onClick={e => cambiarEstado(detalle, e)}>
              <i className={`bi ${detalle.estado === 'activo'
                ? 'bi-toggle-off' : 'bi-toggle-on'} me-1`} />
              {detalle.estado === 'activo' ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </aside>
      )}

      {/* ══ DRAWER LATERAL — NUEVO / EDITAR SERVICIO ══ */}
      {showModal && (
        <div className="srv-modal-overlay" onClick={cerrarModal}>
          <div className="srv-modal-lateral" onClick={e => e.stopPropagation()}>

            {/* Encabezado */}
            <div className="srv-modal-header">
              <h2 className="srv-modal-title">
                <i className={`bi ${editingId ? 'bi-pencil' : 'bi-plus-circle'} me-2`} />
                {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h2>
              <button className="srv-modal-close" onClick={cerrarModal}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="srv-modal-body">
              {error && (
                <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
                  <i className="bi bi-exclamation-triangle me-1" />{error}
                </div>
              )}

              {/* Sección: Información del servicio */}
              <div className="srv-form-section">
                <div className="srv-form-label">
                  <i className="bi bi-tools" /> Información del servicio
                </div>

                <div className="form-group">
                  <label>Nombre *</label>
                  <input type="text" placeholder="Ej: Cambio de aceite"
                    value={form.nombre}
                    onChange={e => f('nombre', e.target.value)}
                    className={fieldErrors.nombre ? 'input-error' : ''}
                  />
                  {fieldErrors.nombre && (
                    <span className="field-error-msg">{fieldErrors.nombre}</span>
                  )}
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Descripción</label>
                  <textarea rows={3}
                    placeholder="Describe brevemente el servicio..."
                    value={form.descripcion}
                    onChange={e => f('descripcion', e.target.value)}
                    className="srv-textarea"
                  />
                </div>
              </div>

              {/* Sección: Precio y categoría */}
              <div className="srv-form-section">
                <div className="srv-form-label">
                  <i className="bi bi-tag" /> Precio y categoría
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Precio base *</label>
                    <div className={`srv-precio-input ${fieldErrors.precioBase ? 'input-error-wrap' : ''}`}>
                      <span>$</span>
                      <input type="number" min="0" placeholder="0"
                        value={form.precioBase}
                        onChange={e => f('precioBase', e.target.value)}
                        className={fieldErrors.precioBase ? 'input-error' : ''}
                      />
                    </div>
                    {fieldErrors.precioBase && (
                      <span className="field-error-msg">{fieldErrors.precioBase}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Categoría *</label>
                    <select value={form.categoria}
                      onChange={e => f('categoria', e.target.value)}
                      className={fieldErrors.categoria ? 'input-error' : ''}>
                      {CATEGORIAS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {fieldErrors.categoria && (
                      <span className="field-error-msg">{fieldErrors.categoria}</span>
                    )}
                  </div>
                </div>

                {/* Preview categoría */}
                <div className="srv-cat-preview">
                  <span className="srv-badge-cat"
                    style={{ background: catColor(form.categoria).bg,
                             color: catColor(form.categoria).color }}>
                    {form.categoria}
                  </span>
                  <span className="srv-preview-label">Vista previa de categoría</span>
                </div>
              </div>

              {/* Footer del drawer */}
              <div style={{
                marginTop: '2rem',
                padding: '1rem 0 0',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
              }}>
                <button className="btn-secondary" onClick={cerrarModal} disabled={saving}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={guardar} disabled={saving}>
                  {saving
                    ? <><i className="bi bi-arrow-repeat spin me-1" />Guardando...</>
                    : <><i className={`bi ${editingId ? 'bi-check-lg' : 'bi-plus-lg'} me-1`} />
                        {editingId ? 'Guardar cambios' : 'Crear servicio'}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}