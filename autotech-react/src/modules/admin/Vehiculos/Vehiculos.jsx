import { useState, useEffect } from 'react';
import './Vehiculos.css';
import { vehiculoService, marcaService, clienteAdminService } from '../../../services/adminService';

const COMBUSTIBLES = ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido', 'GLP'];

const COLORES_WRAP = [
  { value: 'blue',   label: 'Azul',     hex: '#2563eb' },
  { value: 'red',    label: 'Rojo',     hex: '#dc2626' },
  { value: 'green',  label: 'Verde',    hex: '#16a34a' },
  { value: 'yellow', label: 'Amarillo', hex: '#ca8a04' },
  { value: 'gray',   label: 'Gris',     hex: '#6b7280' },
  { value: 'black',  label: 'Negro',    hex: '#111827' },
  { value: 'white',  label: 'Blanco',   hex: '#d1d5db' },
  { value: 'orange', label: 'Naranja',  hex: '#ea580c' },
];

const TIPOS = [
  { val: 'car',   label: 'Auto',      icon: 'bi-car-front' },
  { val: 'truck', label: 'Camioneta', icon: 'bi-truck'     },
  { val: 'moto',  label: 'Moto',      icon: 'bi-bicycle'   },
  { val: 'van',   label: 'Van',       icon: 'bi-bus-front' },
];

const tipoIcon = (tipo) =>
  TIPOS.find(t => t.val === tipo)?.icon || 'bi-car-front';

const EMPTY_FORM = {
  placa: '',
  anio: new Date().getFullYear(),
  color: '',
  kilometraje: 0,
  combustible: 'Gasolina',
  tipoVehiculo: 'car',       // ← reemplaza icono
  colorWrap: 'blue',
  idMarca: '',
  modeloTexto: '',
  idCliente: '',
};

export default function Vehiculos() {
  const [vehiculos,         setVehiculos]         = useState([]);
  const [marcas,            setMarcas]            = useState([]);
  const [modelos,           setModelos]           = useState([]);
  const [clientes,          setClientes]          = useState([]);
  const [form,              setForm]              = useState(EMPTY_FORM);
  const [editingId,         setEditingId]         = useState(null);
  const [showModal,         setShowModal]         = useState(false);
  const [showMarca,         setShowMarca]         = useState(false);
  const [nuevaMarca,        setNuevaMarca]        = useState('');
  const [loading,           setLoading]           = useState(true);
  const [loadMod,           setLoadMod]           = useState(false);
  const [saving,            setSaving]            = useState(false);
  const [error,             setError]             = useState('');
  const [busqueda,          setBusqueda]          = useState('');
  const [detalle,           setDetalle]           = useState(null);
  const [tipoAutoDetectado, setTipoAutoDetectado] = useState(false); // ← nuevo

  useEffect(() => {
    Promise.all([cargarVehiculos(), cargarMarcas(), cargarClientes()]);
  }, []);

  const cargarVehiculos = async () => {
    try {
      setLoading(true);
      const data = await vehiculoService.getAll();
      setVehiculos(data || []);
    } catch {
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarMarcas = async () => {
    try {
      const data = await marcaService.getAll();
      setMarcas((data || []).map(m => ({ id: String(m.idMarca), nombre: m.nombreMarca })));
    } catch {
      setMarcas([]);
    }
  };

  const cargarClientes = async () => {
    try {
      const data = await clienteAdminService.getAll();
      setClientes(data || []);
    } catch {
      setClientes([]);
    }
  };

  /* ── Cambio de marca → carga modelos ── */
  const handleMarcaChange = async (idMarca) => {
    setForm(f => ({ ...f, idMarca, modeloTexto: '' }));
    setModelos([]);
    setTipoAutoDetectado(false);
    if (!idMarca) return;
    try {
      setLoadMod(true);
      const data = await marcaService.getModelos(idMarca);
      // Los modelos ahora incluyen tipoVehiculo
      setModelos((data || []).map(mod => ({
        id:           String(mod.id),
        nombre:       mod.nombre,
        tipoVehiculo: mod.tipoVehiculo || 'car', // ← nuevo
      })));
    } catch {
      setModelos([]);
    } finally {
      setLoadMod(false);
    }
  };

  /* ── Cambio de modelo → detecta tipo automáticamente ── */
  const handleModeloChange = (texto) => {
    f('modeloTexto', texto);
    const match = modelos.find(
      m => m.nombre.toLowerCase() === texto.toLowerCase()
    );
    if (match) {
      f('tipoVehiculo', match.tipoVehiculo);
      setTipoAutoDetectado(true);
    } else {
      setTipoAutoDetectado(false);
    }
  };

  /* ── Modales ── */
  const abrirCrear = () => {
    setForm(EMPTY_FORM);
    setModelos([]);
    setEditingId(null);
    setError('');
    setTipoAutoDetectado(false);
    setShowModal(true);
  };

  const abrirEditar = async (v) => {
    setForm({
      placa:        v.placa,
      anio:         v.anio,
      color:        v.color,
      kilometraje:  v.kilometraje,
      combustible:  v.combustible,
      tipoVehiculo: v.tipoVehiculo || 'car', // ← reemplaza icono
      colorWrap:    v.colorWrap || 'blue',
      idMarca:      String(v.idMarca),
      modeloTexto:  String(v.modelo),
      idCliente:    String(v.idCliente),
    });
    try {
      setLoadMod(true);
      const data = await marcaService.getModelos(v.idMarca);
      const lista = (data || []).map(mod => ({
        id:           String(mod.id),
        nombre:       mod.nombre,
        tipoVehiculo: mod.tipoVehiculo || 'car',
      }));
      setModelos(lista);
      // Si el modelo ya existe en BD → tipo auto detectado
      const match = lista.find(
        m => m.nombre.toLowerCase() === v.modelo.toLowerCase()
      );
      setTipoAutoDetectado(!!match);
    } catch {
      setModelos([]);
      setTipoAutoDetectado(false);
    } finally {
      setLoadMod(false);
    }
    setEditingId(v.id);
    setError('');
    setShowModal(true);
  };

  const cerrarModal = () => { setShowModal(false); setError(''); };

  const guardar = async () => {
    if (!form.placa.trim() || !form.modeloTexto.trim() || !form.idCliente || !form.color.trim() || !form.idMarca) {
      setError('Todos los campos con asterisco (*) son requeridos.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const payload = {
        placa:        form.placa.trim().toUpperCase(),
        anio:         Number(form.anio),
        color:        form.color.trim(),
        kilometraje:  Number(form.kilometraje),
        combustible:  form.combustible,
        tipoVehiculo: form.tipoVehiculo, // ← reemplaza icono
        colorWrap:    form.colorWrap,
        nombreModelo: form.modeloTexto.trim(),
        idMarca:      Number(form.idMarca),
        idCliente:    Number(form.idCliente),
      };
      if (editingId) {
        await vehiculoService.actualizar(editingId, payload);
      } else {
        await vehiculoService.crear(payload);
      }
      cerrarModal();
      if (detalle) setDetalle(null);
      cargarVehiculos();
    } catch (err) {
      setError(err.response?.data || err.data || 'Error al guardar. Verifica los datos.');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este vehículo? Esta acción no se puede deshacer.')) return;
    try {
      await vehiculoService.eliminar(id);
      if (detalle?.id === id) setDetalle(null);
      cargarVehiculos();
    } catch (err) {
      alert(err.response?.data || err.data || 'No se pudo eliminar el vehículo.');
    }
  };

  const guardarMarcaRapida = async () => {
    if (!nuevaMarca.trim()) return;
    try {
      await marcaService.crear({ nombreMarca: nuevaMarca.trim() });
      await cargarMarcas();
      setNuevaMarca('');
      setShowMarca(false);
    } catch (err) {
      alert(err.response?.data || err.data || 'Error al crear marca.');
    }
  };

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const colorInfo = (val) => COLORES_WRAP.find(c => c.value === val) || COLORES_WRAP[0];

  const filtrados = vehiculos.filter(v =>
    (v.placa    || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (v.cliente  || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (v.marca    || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className={`veh-page ${detalle ? 'veh-has-detalle' : ''}`}>

      {/* ── COLUMNA PRINCIPAL ── */}
      <div className={`veh-main ${detalle ? 'con-panel' : ''}`}>
        <div className="page-header">
          <div>
            <h1 className="page-title"><i className="bi bi-car-front" /> Vehículos</h1>
            <p className="page-subtitle">Gestiona todos los vehículos registrados en el sistema</p>
          </div>
          <button className="btn-primary" type="button" onClick={abrirCrear}>
            <i className="bi bi-plus-lg" /> Nuevo Vehículo
          </button>
        </div>

        <div className="veh-toolbar">
          <div className="search-bar">
            <i className="bi bi-search" />
            <input
              placeholder="Buscar por placa, cliente o marca..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="veh-search-clear" type="button" onClick={() => setBusqueda('')}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>
          <span className="veh-count">
            {filtrados.length} vehículo{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            <i className="bi bi-arrow-repeat spin" /> Cargando vehículos...
          </div>
        ) : (
          <div className="table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Placa</th>
                  <th>Vehículo</th>
                  <th>Cliente</th>
                  <th>Año</th>
                  <th>Km</th>
                  <th>Combustible</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty-row">
                      <i className="bi bi-inbox me-2" />
                      {busqueda ? 'Sin resultados para la búsqueda.' : 'No hay vehículos registrados.'}
                    </td>
                  </tr>
                ) : filtrados.map((v, i) => (
                  <tr
                    key={v.id}
                    className={detalle?.id === v.id ? 'veh-row-active' : ''}
                    onClick={() => setDetalle(detalle?.id === v.id ? null : v)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="veh-td-num">{i + 1}</td>
                    <td>
                      <span className="badge-placa" style={{ borderLeft: `3px solid ${colorInfo(v.colorWrap).hex}` }}>
                        {v.placa}
                      </span>
                    </td>
                    <td>
                      {/* ← ícono viene del tipoVehiculo del modelo */}
                      <div className="mec-cell">
                        <i className={`bi ${tipoIcon(v.tipoVehiculo)}`} style={{ fontSize: '1.1rem', color: 'var(--accent)' }} />
                        <div>
                          <div className="veh-nombre">{v.marca} {v.modelo}</div>
                          <div className="veh-sub">{v.color}</div>
                        </div>
                      </div>
                    </td>
                    <td>{v.cliente}</td>
                    <td>{v.anio}</td>
                    <td className="veh-td-km">{v.kilometraje?.toLocaleString()} km</td>
                    <td><span className="veh-badge-comb">{v.combustible}</span></td>
                    <td>
                      <span className={`badge-estado ${v.estado === 'warn' ? 'warn' : 'ok'}`}>
                        {v.estado === 'warn' ? '⚠ Alto km' : '✓ OK'}
                      </span>
                    </td>
                    <td className="actions-cell" onClick={e => e.stopPropagation()}>
                      <button className="btn-icon edit" type="button" onClick={() => abrirEditar(v)} title="Editar">
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn-icon delete" type="button" onClick={() => eliminar(v.id)} title="Eliminar">
                        <i className="bi bi-trash" />
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
        <aside className="veh-detalle">
          <div className="veh-detalle-header">
            <div>
              <h3 className="veh-detalle-title">{detalle.marca} {detalle.modelo}</h3>
              <span className="badge-placa" style={{ borderLeft: `3px solid ${colorInfo(detalle.colorWrap).hex}` }}>
                {detalle.placa}
              </span>
            </div>
            <button className="modal-close" type="button" onClick={() => setDetalle(null)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="veh-color-strip" style={{ background: colorInfo(detalle.colorWrap).hex }} />

          <div className="veh-detalle-body">
            <p className="veh-section-title">Información del vehículo</p>
            <div className="veh-info-grid">
              <div className="veh-info-item">
                <span className="veh-info-label">Tipo</span>
                {/* ← muestra el tipo con ícono */}
                <span className="veh-info-val">
                  <i className={`bi ${tipoIcon(detalle.tipoVehiculo)} me-1`} />
                  {TIPOS.find(t => t.val === detalle.tipoVehiculo)?.label || 'Auto'}
                </span>
              </div>
              <div className="veh-info-item">
                <span className="veh-info-label">Año</span>
                <span className="veh-info-val">{detalle.anio}</span>
              </div>
              <div className="veh-info-item">
                <span className="veh-info-label">Color</span>
                <span className="veh-info-val">{detalle.color}</span>
              </div>
              <div className="veh-info-item">
                <span className="veh-info-label">Kilometraje</span>
                <span className="veh-info-val">{detalle.kilometraje?.toLocaleString()} km</span>
              </div>
              <div className="veh-info-item">
                <span className="veh-info-label">Combustible</span>
                <span className="veh-info-val">{detalle.combustible}</span>
              </div>
            </div>

            <p className="veh-section-title" style={{ marginTop: '1.25rem' }}>Propietario</p>
            <div className="veh-cliente-card">
              <div className="veh-avatar">{(detalle.cliente || 'C').charAt(0).toUpperCase()}</div>
              <div>
                <div className="veh-cliente-nombre">{detalle.cliente}</div>
              </div>
            </div>
          </div>

          <div className="veh-detalle-footer">
            <button className="btn-secondary veh-w-full" type="button" onClick={() => abrirEditar(detalle)}>
              <i className="bi bi-pencil me-1" /> Editar vehículo
            </button>
            <button className="btn-danger veh-w-full" type="button" onClick={() => eliminar(detalle.id)}>
              <i className="bi bi-trash me-1" /> Eliminar
            </button>
          </div>
        </aside>
      )}

      {/* ══ MODAL VEHÍCULO ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-card modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h2>
              <button className="modal-close" type="button" onClick={cerrarModal}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert-error">
                  <i className="bi bi-exclamation-triangle me-1" />{error}
                </div>
              )}

              {/* Propietario */}
              <div className="veh-form-section">
                <div className="veh-form-section-label"><i className="bi bi-person" /> Propietario</div>
                <div className="form-group">
                  <label>Cliente *</label>
                  <select value={form.idCliente} onChange={e => f('idCliente', e.target.value)}>
                    <option value="">— Selecciona un cliente —</option>
                    {clientes.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.nombre} — {c.email}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Identificación */}
              <div className="veh-form-section">
                <div className="veh-form-section-label"><i className="bi bi-tag" /> Identificación</div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Marca *</label>
                    <div className="input-with-btn">
                      <select value={form.idMarca} onChange={e => handleMarcaChange(e.target.value)}>
                        <option value="">— Selecciona marca —</option>
                        {marcas.map(m => (
                          <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                      </select>
                      <button className="btn-icon edit" title="Nueva marca" type="button" onClick={() => setShowMarca(true)}>
                        <i className="bi bi-plus-lg" />
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Modelo *</label>
                    <input
                      type="text"
                      list="lista-modelos-sugeridos"
                      placeholder={loadMod ? 'Cargando modelos...' : !form.idMarca ? '— Elige marca primero —' : 'Escribe o selecciona modelo'}
                      value={form.modeloTexto}
                      onChange={e => handleModeloChange(e.target.value)} // ← cambiado
                      disabled={!form.idMarca || loadMod}
                    />
                    <datalist id="lista-modelos-sugeridos">
                      {modelos.map(m => (
                        <option key={m.id} value={m.nombre} />
                      ))}
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label>Placa *</label>
                    <input type="text" placeholder="Ej: ABC-123" value={form.placa}
                      onChange={e => f('placa', e.target.value.toUpperCase())} className="veh-mono" />
                  </div>

                  <div className="form-group">
                    <label>Año *</label>
                    <input type="number" min="1990" max={new Date().getFullYear() + 1}
                      value={form.anio} onChange={e => f('anio', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Datos técnicos */}
              <div className="veh-form-section">
                <div className="veh-form-section-label"><i className="bi bi-gear" /> Datos técnicos</div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Color *</label>
                    <input type="text" placeholder="Ej: Blanco perla" value={form.color}
                      onChange={e => f('color', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Kilometraje</label>
                    <input type="number" min="0" value={form.kilometraje}
                      onChange={e => f('kilometraje', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Combustible</label>
                    <select value={form.combustible} onChange={e => f('combustible', e.target.value)}>
                      {COMBUSTIBLES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Color de tarjeta</label>
                    <div className="veh-color-picker">
                      {COLORES_WRAP.map(c => (
                        <button key={c.value} type="button"
                          className={`veh-color-dot ${form.colorWrap === c.value ? 'active' : ''}`}
                          style={{ background: c.hex }} title={c.label}
                          onClick={() => f('colorWrap', c.value)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipo — solo si el modelo es nuevo */}
              {!tipoAutoDetectado && (
                <div className="veh-form-section">
                  <div className="veh-form-section-label">
                    <i className="bi bi-collection" /> Tipo de vehículo
                    <span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 400, marginLeft: '.5rem' }}>
                      (modelo nuevo — se guardará para la próxima vez)
                    </span>
                  </div>
                  <div className="veh-tipo-row">
                    {TIPOS.map(opt => (
                      <button key={opt.val} type="button"
                        className={`veh-tipo-btn ${form.tipoVehiculo === opt.val ? 'active' : ''}`}
                        onClick={() => f('tipoVehiculo', opt.val)}>
                        <i className={`bi ${opt.icon}`} />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Si el tipo fue auto detectado, muéstralo como solo lectura */}
              {tipoAutoDetectado && (
                <div className="veh-form-section">
                  <div className="veh-form-section-label"><i className="bi bi-collection" /> Tipo de vehículo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-2)', fontSize: '.88rem' }}>
                    <i className={`bi ${tipoIcon(form.tipoVehiculo)}`} style={{ color: 'var(--accent)', fontSize: '1.2rem' }} />
                    <span>{TIPOS.find(t => t.val === form.tipoVehiculo)?.label}</span>
                    <span style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>— asignado automáticamente por el modelo</span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" type="button" onClick={cerrarModal} disabled={saving}>Cancelar</button>
              <button className="btn-primary" type="button" onClick={guardar} disabled={saving}>
                {saving
                  ? <><i className="bi bi-arrow-repeat spin me-1" /> Guardando...</>
                  : <><i className={`bi ${editingId ? 'bi-check-lg' : 'bi-plus-lg'} me-1`} /> {editingId ? 'Guardar cambios' : 'Registrar vehículo'}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MINI-MODAL MARCA ══ */}
      {showMarca && (
        <div className="modal-overlay" onClick={() => setShowMarca(false)}>
          <div className="modal-card modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva Marca</h2>
              <button className="modal-close" type="button" onClick={() => setShowMarca(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" placeholder="Ej: Toyota" value={nuevaMarca}
                  onChange={e => setNuevaMarca(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && guardarMarcaRapida()} autoFocus />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" type="button" onClick={() => setShowMarca(false)}>Cancelar</button>
              <button className="btn-primary" type="button" onClick={guardarMarcaRapida}>
                <i className="bi bi-check-lg me-1" /> Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}