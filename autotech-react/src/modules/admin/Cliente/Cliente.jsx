import { useState, useEffect } from 'react';
import './Cliente.css';
import { clienteAdminService } from '../../../services/adminService';

const EMPTY_FORM = {
  primerNombre: '', segundoNombre: '',
  primerApellido: '', segundoApellido: '',
  documento: '', username: '',
  email: '', telefono: '',
  direccion: '', password: '',
};

export default function Clientes() {
  const [clientes,   setClientes]   = useState([]);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [editingId,  setEditingId]  = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [detalle,    setDetalle]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [busqueda,   setBusqueda]   = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await clienteAdminService.getAll();
      setClientes(data || []);
    } catch { setClientes([]); }
    finally  { setLoading(false); }
  };

  /* ── Modal ── */
  const abrirCrear = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowModal(true);
  };

  const abrirEditar = (c) => {
    setForm({
      primerNombre:   c.primerNombre   || '',
      segundoNombre:  c.segundoNombre  || '',
      primerApellido: c.primerApellido || '',
      segundoApellido:c.segundoApellido|| '',
      documento:      c.documento      || '',
      username:       c.username       || '',
      email:          c.email          || '',
      telefono:       c.telefono       || '',
      direccion:      c.direccion      || '',
      password:       '',
    });
    setEditingId(c.id);
    setError('');
    setShowModal(true);
  };

  const cerrarModal = () => { setShowModal(false); setError(''); };

  const guardar = async () => {
    if (!form.primerNombre.trim() || !form.primerApellido.trim() ||
        !form.email.trim() || !form.documento.trim() || !form.username.trim()) {
      setError('Nombre, apellido, documento, username y email son requeridos.');
      return;
    }
    if (!editingId && !form.password.trim()) {
      setError('La contraseña es requerida al crear un cliente.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      if (editingId) {
        await clienteAdminService.actualizar(editingId, form);
      } else {
        await clienteAdminService.crear(form);
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

  const cambiarEstado = async (c, e) => {
    e.stopPropagation();
    try {
      await clienteAdminService.cambiarEstado(c.id);
      cargar();
      if (detalle?.id === c.id)
        setDetalle(prev => ({
          ...prev,
          estado: prev.estado === 'activo' ? 'inactivo' : 'activo'
        }));
    } catch {
      alert('No se pudo cambiar el estado.');
    }
  };

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  /* ── Filtros ── */
  const filtrados = clientes.filter(c => {
    const q = busqueda.toLowerCase();
    const matchBusqueda =
      (c.nombre    || '').toLowerCase().includes(q) ||
      (c.email     || '').toLowerCase().includes(q) ||
      (c.telefono  || '').toLowerCase().includes(q) ||
      (c.documento || '').toLowerCase().includes(q);
    const matchEstado =
      filtroEstado === 'todos' ||
      c.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const iniciales = (nombre) =>
    (nombre || 'C').split(' ').slice(0, 2)
      .map(n => n[0]).join('').toUpperCase();

  /* ════════════════════════════════════
     RENDER
  ════════════════════════════════════ */
  return (
    <div className={`cli-page ${detalle ? 'cli-has-detalle' : ''}`}>

      {/* ── COLUMNA PRINCIPAL ── */}
      <div className="cli-main">

        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-people" /> Clientes
            </h1>
            <p className="page-subtitle">
              Gestiona los clientes registrados en el sistema
            </p>
          </div>
          <button className="btn-primary" onClick={abrirCrear}>
            <i className="bi bi-person-plus" /> Nuevo Cliente
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="cli-toolbar">
          <div className="search-bar">
            <i className="bi bi-search" />
            <input
              placeholder="Buscar por nombre, correo, teléfono o documento..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="cli-clear" onClick={() => setBusqueda('')}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>

          <div className="cli-filtros">
            {['todos', 'activo', 'inactivo'].map(f => (
              <button
                key={f}
                className={`cli-filtro-btn ${filtroEstado === f ? 'active' : ''}`}
                onClick={() => setFiltroEstado(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <span className="cli-count">
            {filtrados.length} cliente{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* TABLA */}
        {loading ? (
          <div className="loading-state">
            <i className="bi bi-arrow-repeat spin" /> Cargando clientes...
          </div>
        ) : (
          <div className="table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Documento</th>
                  <th>Contacto</th>
                  <th>Vehículos</th>
                  <th>Órdenes</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      <i className="bi bi-inbox me-2" />
                      {busqueda ? 'Sin resultados.' : 'No hay clientes registrados.'}
                    </td>
                  </tr>
                ) : filtrados.map((c, i) => (
                  <tr
                    key={c.id}
                    className={detalle?.id === c.id ? 'cli-row-active' : ''}
                    onClick={() => setDetalle(detalle?.id === c.id ? null : c)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="cli-td-num">{i + 1}</td>
                    <td>
                      <div className="cli-cell">
                        <div
                          className="cli-avatar"
                          style={{ opacity: c.estado === 'inactivo' ? 0.4 : 1 }}
                        >
                          {iniciales(c.nombre)}
                        </div>
                        <div>
                          <div className="cli-nombre">{c.nombre}</div>
                          <div className="cli-username">@{c.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="cli-doc">{c.documento}</td>
                    <td>
                      <div className="cli-nombre">{c.email}</div>
                      <div className="cli-username">{c.telefono}</div>
                    </td>
                    <td>
                      <span className="cli-badge-num">
                        <i className="bi bi-car-front me-1" />
                        {c.totalVehiculos}
                      </span>
                    </td>
                    <td>
                      <span className="cli-badge-num">
                        <i className="bi bi-clipboard-check me-1" />
                        {c.totalOrdenes}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className={`cli-estado-btn ${c.estado}`}
                        onClick={e => cambiarEstado(c, e)}
                        title={c.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      >
                        <i className={`bi ${c.estado === 'activo'
                          ? 'bi-toggle-on' : 'bi-toggle-off'}`}
                        />
                        {c.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="actions-cell" onClick={e => e.stopPropagation()}>
                      <button className="btn-icon edit"
                        onClick={() => abrirEditar(c)} title="Editar">
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

      {/* ── PANEL LATERAL ── */}
      {detalle && (
        <aside className="cli-detalle">
          <div className="cli-detalle-header">
            <div className="cli-detalle-avatar">
              {iniciales(detalle.nombre)}
            </div>
            <button className="modal-close" onClick={() => setDetalle(null)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="cli-detalle-body">
            <h3 className="cli-detalle-nombre">{detalle.nombre}</h3>
            <span className={`cli-estado-btn ${detalle.estado}`}
              style={{ fontSize: '.75rem', padding: '.2rem .7rem' }}>
              <i className={`bi ${detalle.estado === 'activo'
                ? 'bi-toggle-on' : 'bi-toggle-off'} me-1`} />
              {detalle.estado}
            </span>

            <div className="cli-detalle-section">
              <p className="cli-section-title">Información personal</p>
              <div className="cli-info-list">
                <div className="cli-info-row">
                  <i className="bi bi-person-badge" />
                  <span>{detalle.documento}</span>
                </div>
                <div className="cli-info-row">
                  <i className="bi bi-at" />
                  <span>@{detalle.username}</span>
                </div>
                <div className="cli-info-row">
                  <i className="bi bi-envelope" />
                  <span>{detalle.email}</span>
                </div>
                <div className="cli-info-row">
                  <i className="bi bi-telephone" />
                  <span>{detalle.telefono || 'Sin teléfono'}</span>
                </div>
                <div className="cli-info-row">
                  <i className="bi bi-geo-alt" />
                  <span>{detalle.direccion || 'Sin dirección'}</span>
                </div>
              </div>
            </div>

            <div className="cli-detalle-section">
              <p className="cli-section-title">Actividad</p>
              <div className="cli-stats-row">
                <div className="cli-stat">
                  <span className="cli-stat-num">{detalle.totalVehiculos}</span>
                  <span className="cli-stat-label">Vehículos</span>
                </div>
                <div className="cli-stat">
                  <span className="cli-stat-num">{detalle.totalOrdenes}</span>
                  <span className="cli-stat-label">Órdenes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="cli-detalle-footer">
            <button className="btn-secondary cli-w-full"
              onClick={() => abrirEditar(detalle)}>
              <i className="bi bi-pencil me-1" /> Editar cliente
            </button>
            <button
              className={`cli-w-full cli-toggle-btn ${detalle.estado}`}
              onClick={e => cambiarEstado(detalle, e)}
            >
              <i className={`bi ${detalle.estado === 'activo'
                ? 'bi-toggle-off' : 'bi-toggle-on'} me-1`} />
              {detalle.estado === 'activo' ? 'Desactivar cliente' : 'Activar cliente'}
            </button>
          </div>
        </aside>
      )}

      {/* ══ MODAL CLIENTE ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-card modal-lg" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <h2>
                <i className={`bi ${editingId ? 'bi-pencil' : 'bi-person-plus'} me-2`} />
                {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
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

              {/* Nombres */}
              <div className="cli-form-section">
                <div className="cli-form-label">
                  <i className="bi bi-person" /> Datos personales
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Primer nombre *</label>
                    <input type="text" placeholder="Ej: Carlos"
                      value={form.primerNombre}
                      onChange={e => f('primerNombre', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Segundo nombre</label>
                    <input type="text" placeholder="Ej: Andrés"
                      value={form.segundoNombre}
                      onChange={e => f('segundoNombre', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Primer apellido *</label>
                    <input type="text" placeholder="Ej: Posada"
                      value={form.primerApellido}
                      onChange={e => f('primerApellido', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Segundo apellido</label>
                    <input type="text" placeholder="Ej: López"
                      value={form.segundoApellido}
                      onChange={e => f('segundoApellido', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Identificación */}
              <div className="cli-form-section">
                <div className="cli-form-label">
                  <i className="bi bi-person-badge" /> Identificación y acceso
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Documento *</label>
                    <input type="text" placeholder="Ej: 1001234567"
                      value={form.documento}
                      onChange={e => f('documento', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input type="text" placeholder="Ej: cposada"
                      autoComplete="one-time-code"
                      value={form.username}
                      onChange={e => f('username', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Contraseña {editingId ? '(dejar vacío para no cambiar)' : '*'}</label>
                    <input type="password"
                      autoComplete="new-password"
                      placeholder={editingId ? 'Nueva contraseña (opcional)' : 'Contraseña inicial'}
                      value={form.password}
                      onChange={e => f('password', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="cli-form-section">
                <div className="cli-form-label">
                  <i className="bi bi-telephone" /> Contacto
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" placeholder="Ej: carlos@email.com"
                      value={form.email}
                      onChange={e => f('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input type="text" placeholder="Ej: 3001234567"
                      value={form.telefono}
                      onChange={e => f('telefono', e.target.value)} />
                  </div>
                  <div className="form-group form-span-2">
                    <label>Dirección</label>
                    <input type="text" placeholder="Ej: Calle 45 # 23-10"
                      value={form.direccion}
                      onChange={e => f('direccion', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={cerrarModal} disabled={saving}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={guardar} disabled={saving}>
                {saving
                  ? <><i className="bi bi-arrow-repeat spin me-1" /> Guardando...</>
                  : <><i className={`bi ${editingId ? 'bi-check-lg' : 'bi-person-plus'} me-1`} />
                      {editingId ? 'Guardar cambios' : 'Registrar cliente'}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}