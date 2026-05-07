import { Routes, Route } from 'react-router-dom'

import Inicio   from '../modules/autoTech/Inicio'
import Register from '../modules/autoTech/Register'
import Login    from '../modules/autoTech/Log'

import DashboardLayout from '../layouts/DashboardLayout'

import Admin     from '../modules/admin/admin'
import UsuarioOk from '../modules/Usuario/UsuarioDashboard'

// ── Mecánico — cada sección es una ruta independiente ──
import SecInicio        from '../modules/Mecanico/sections/SecInicio'
import SecOrdenes       from '../modules/Mecanico/sections/SecOrdenes'
import SecVehiculos     from '../modules/Mecanico/sections/SecVehiculos'
import SecObservaciones from '../modules/Mecanico/sections/SecObservaciones'

function AppRouter() {
  return (
    <Routes>

      <Route path="/"              element={<Inicio />}   />
      <Route path="/page/register" element={<Register />} />
      <Route path="/page/login"    element={<Login />}    />

      {/* ── Admin ── */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route path="inicio" element={<Admin />} />
        {/* Próximamente: */}
        {/* <Route path="clientes"   element={<Clientes />} /> */}
        {/* <Route path="mecanicos"  element={<Mecanicos />} /> */}
      </Route>

      {/* ── Mecánico ── */}
      <Route path="/mecanico" element={<DashboardLayout />}>
        <Route index                element={<SecInicio />}        />
        <Route path="ordenes"       element={<SecOrdenes />}       />
        <Route path="vehiculos"     element={<SecVehiculos />}     />
        <Route path="observaciones" element={<SecObservaciones />} />
      </Route>

      {/* ── Usuario/Cliente ── */}
      <Route path="/usuario" element={<DashboardLayout />}>
        <Route index element={<UsuarioOk />} />
      </Route>

    </Routes>
  )
}

export default AppRouter