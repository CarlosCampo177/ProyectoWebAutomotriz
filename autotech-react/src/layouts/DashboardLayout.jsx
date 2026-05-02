// src/layouts/DashboardLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { menuConfig } from '../router/menuConfig'
import './DashboardLayout.css'

// Títulos según rol
const tituloPorRol = {
  admin:    'Panel Admin',
  cliente:  'Panel Cliente',
  mecanico: 'Panel Mecánico',
}

// Badge con color según rol
const badgeClase = {
  admin:    'badge-admin',
  cliente:  'badge-cliente',
  mecanico: 'badge-mecanico',
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menuItems = menuConfig[user?.rol] ?? []

  const handleLogout = () => {
    logout()
    navigate('/page/login')  // ← ya redirige correctamente
  }

  return (
    <div style={{ display: 'flex' }}>

      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div className="sidebar-logo">AUTO<span>TECH</span></div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{user?.iniciales}</div>
          <div>
            <p className="sidebar-user-name">{user?.nombre}</p>
            {/* ← muestra el rol real, no hardcodeado */}
            <p className="sidebar-user-rol">{user?.rol}</p>
          </div>
        </div>

        <nav className="sidebar-nav mt-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-logout"
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <i className="bi bi-box-arrow-left"></i> Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="main">
        <div className="topbar">
          {/* ← título dinámico según rol, no hardcodeado */}
          <h5 id="titulo-pagina">{tituloPorRol[user?.rol] ?? 'Panel'}</h5>
          <div className="topbar-right">
            <span className="topbar-fecha">{getFechaHoy()}</span>
            {/* ← badge con el rol real */}
            <span className={`topbar-badge ${badgeClase[user?.rol] ?? ''}`}>
              {user?.rol === 'cliente'  ? 'Cliente'  :
               user?.rol === 'mecanico' ? 'Mecánico' : 'Admin'}
            </span>
          </div>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>

    </div>
  )
}

function getFechaHoy() {
  const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const hoy   = new Date()
  return `${dias[hoy.getDay()]} ${hoy.getDate()} ${meses[hoy.getMonth()]}`
}