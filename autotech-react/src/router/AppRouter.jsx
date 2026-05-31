import { Routes, Route } from 'react-router-dom'

// Públicas
import Inicio    from '../modules/autoTech/Inicio'
import Register  from '../modules/autoTech/Register'
import Login     from '../modules/autoTech/Log'

import DashboardLayout from '../layouts/DashboardLayout'

// Admin
import AdminInicio      from '../modules/admin/Inicio/Inicio'
import Clientes         from '../modules/admin/Cliente/Cliente'
import Vehiculos        from '../modules/admin/Vehiculos/Vehiculos'
import Mecanicos        from '../modules/admin/Mecanicos/Mecanicos'
import Servicios        from '../modules/admin/Servicios/Servicios'
import Productos        from '../modules/admin/Productos/Productos'
import Ordenes          from '../modules/admin/Ordenes/Ordenes'
import Facturacion      from '../modules/admin/Facturacion/Facturacion'
import Estadisticas     from '../modules/admin/Estadisticas/Estadisticas'

// Mecánico
import SecInicio        from '../modules/Mecanico/sections/SecInicio'
import SecOrdenes       from '../modules/Mecanico/sections/SecOrdenes'
import SecVehiculos     from '../modules/Mecanico/sections/SecVehiculos'
import SecObservaciones from '../modules/Mecanico/sections/SecObservaciones'
import RutasProtegidas from './RutasProtegidas'


// Usuario
import SecInicioUsuario from '../modules/Usuario/sections/SecInicioU'
import SecCitas         from '../modules/Usuario/sections/SecCitasU'
import SecConsultaIA   from '../modules/Usuario/sections/SecConsultaIA'
import SecFacturas     from '../modules/Usuario/sections/SecFacturas'
import SecHistorial    from '../modules/Usuario/sections/SecHistorial'
import SecMVehiculos     from '../modules/Usuario/sections/SecVehiculosU'
import SecPerfil       from '../modules/Usuario/sections/SecPerfil'

function AppRouter() {
  return (
    <Routes>

      {/* ── Públicas ── */}
      <Route path="/"              element={<Inicio />}   />
      <Route path="/page/register" element={<Register />} />
      <Route path="/page/login"    element={<Login />}    />

      {/* ── Admin ── */}
      <Route element={<RutasProtegidas rolesPermitidos={['admin']} />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route path="inicio"       element={<AdminInicio />}  />
          <Route path="clientes"     element={<Clientes/>} />
          <Route path="vehiculos"    element={<Vehiculos />}    />
          <Route path="mecanicos"    element={<Mecanicos />}    />
          <Route path="servicios"    element={<Servicios />}    />
          <Route path="producto"     element={<Productos />}    />
          <Route path="citas"        element={<Ordenes />}      />
          <Route path="facturacion"  element={<Facturacion />}  />
          <Route path="estadisticas" element={<Estadisticas />} />
        </Route>
      </Route>

      {/* ── Mecánico ── */}
      <Route element={<RutasProtegidas rolesPermitidos={['mecanico']} />}>
        <Route path="/mecanico" element={<DashboardLayout />}>
          <Route index                element={<SecInicio />}        />
          <Route path="ordenes"       element={<SecOrdenes />}       />
          <Route path="vehiculos"     element={<SecVehiculos />}     />
          <Route path="observaciones" element={<SecObservaciones />} />
        </Route>
      </Route>

      {/* ── Usuario/Cliente ── */}
      <Route element={<RutasProtegidas rolesPermitidos={['cliente']} />}>
        <Route path="/usuario" element={<DashboardLayout />}>
          <Route index                element={<SecInicioUsuario />} />
          <Route path="citas"         element={<SecCitas />}         />
          <Route path="vehiculos"      element={<SecMVehiculos />}     />
          <Route path="facturas"      element={<SecFacturas />}      />
          <Route path="historial"     element={<SecHistorial />}     />
          <Route path="perfil"        element={<SecPerfil/>}       />

        </Route>
      </Route>

    </Routes>
  )
}

export default AppRouter