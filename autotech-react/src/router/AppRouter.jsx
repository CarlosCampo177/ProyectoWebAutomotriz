import { Routes, Route } from 'react-router-dom'

import Inicio    from '../modules/autoTech/Inicio'
import Register  from '../modules/autoTech/Register'
import Login     from '../modules/autoTech/Log'

import DashboardLayout from '../layouts/DashboardLayout'

import Admin         from '../modules/admin/admin'
import UsuarioOk     from '../modules/Usuario/UsuarioDashboard'
import MecanicoOK    from '../modules/Mecanico/mecanico'

function AppRouter() {
  return (
    <Routes>
      <Route path="/"               element={<Inicio />}   />
      <Route path="/page/register"  element={<Register />} />
      <Route path="/page/login"     element={<Login />}    />

      <Route path="/admin" element={<DashboardLayout />}>
        <Route path="inicio" element={<Admin />} />
        {/* Próximamente: */}
        {/* <Route path="clientes"    element={<Clientes />} /> */}
        {/* <Route path="mecanicos"   element={<Mecanicos />} /> */}
      </Route>

      {/* ── Mecánico (con DashboardLayout) ── */}
      <Route path="/mecanico" element={<DashboardLayout />}>
        <Route index element={<MecanicoOK />} />
      </Route>

      {/* ── Usuario/Cliente (con DashboardLayout) ── */}
      <Route path="/usuario" element={<DashboardLayout />}>
        <Route index element={<UsuarioOk />} />
      </Route>

    </Routes>
  )
}

export default AppRouter