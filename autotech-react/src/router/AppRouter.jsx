import { Routes, Route, Navigate } from "react-router-dom";

import Inicio from "../modules/autoTech/Inicio";
import Register from "../modules/autoTech/Register";
import Login from "../modules/autoTech/Log";

import DashboardLayout from "../layouts/DashboardLayout";

import AdminDashboard from "../modules/admin/adminDashboard";
import UsuarioOk from "../modules/Usuario/UsuarioDashboard";
import MecanicoOK from "../modules/Mecanico/MecanicoDashboard";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/page/register" element={<Register />} />
      <Route path="/page/login" element={<Login />} />

      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<Navigate to="inicio" replace />} />

        <Route path="inicio" element={<AdminDashboard />} />
        <Route path="clientes" element={<AdminDashboard />} />
        <Route path="vehiculos" element={<AdminDashboard />} />
        <Route path="mecanicos" element={<AdminDashboard />} />
        <Route path="servicios" element={<AdminDashboard />} />
        <Route path="citas" element={<AdminDashboard />} />
        <Route path="facturacion" element={<AdminDashboard />} />
        <Route path="estadisticas" element={<AdminDashboard />} />
      </Route>

      <Route path="/mecanico" element={<DashboardLayout />}>
        <Route index element={<MecanicoOK />} />
      </Route>

      <Route path="/usuario" element={<DashboardLayout />}>
        <Route index element={<UsuarioOk />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
