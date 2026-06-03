import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Activar() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('cargando');
  const llamadaHecha = useRef(false); // ← NUEVO

  useEffect(() => {
    if (llamadaHecha.current) return; // ← bloquea el segundo mount de StrictMode
    llamadaHecha.current = true;

    const token = params.get('token');
    if (!token) {
      setEstado('error');
      return;
    }

    fetch(`https://localhost:7192/api/Auth/activar?token=${token}`)
      .then(r => {
        if (r.ok) setEstado('ok');
        else setEstado('error');
      })
      .catch(() => setEstado('error'));
  }, [params]);

  // Si está validando en el backend
  if (estado === 'cargando') {
    return (
      <div style={s.page}>
        <p style={{ fontWeight: '500', color: '#4b5563' }}>Activando tu cuenta...</p>
      </div>
    );
  }

  // Si el token falló, expiró o no existe
  if (estado === 'error') {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <span style={{ fontSize: '2rem' }}>❌</span>
          <h2 style={{ margin: '1rem 0 0.5rem 0', color: '#1f2937' }}>Enlace inválido</h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            El enlace ya fue usado, expiró o no es válido.
          </p>
          <button style={{ ...s.btn, background: '#dc2626' }} onClick={() => navigate('/page/login')}>
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  // Si la cuenta se activó correctamente
  return (
    <div style={s.page}>
      <div style={s.card}>
        <span style={{ fontSize: '2.5rem' }}>✅</span>
        <h2 style={{ margin: '1rem 0 0.5rem 0', color: '#1f2937' }}>¡Cuenta activada!</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Ya puedes iniciar sesión en AutoTech.
        </p>
        <button style={s.btn} onClick={() => navigate('/page/login')}>
          Ir al login
        </button>
      </div>
    </div>
  );
}

// Estilos rápidos en línea (puedes migrarlos a CSS si lo deseas)
const s = {
  page: { 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    background: '#f0f2f7',
    fontFamily: 'sans-serif'
  },
  card: { 
    background: '#fff', 
    borderRadius: '16px', 
    padding: '2.5rem', 
    textAlign: 'center', 
    boxShadow: '0 8px 32px rgba(0,0,0,.1)', 
    maxWidth: '380px', 
    width: '100%' 
  },
  btn: { 
    background: '#2563eb', 
    color: '#fff', 
    border: 'none', 
    padding: '.75rem 2rem', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '.95rem', 
    fontWeight: '600', 
    width: '100%'
  }
};