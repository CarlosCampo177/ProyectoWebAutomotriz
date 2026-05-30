import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

export default function RutasProtegidas({ rolesPermitidos }) {
  const { user } = useAuth();

  // Si nadie ha iniciado sesión, los saca volando al login
  if (!user) {
    return <Navigate to="/page/login" replace />;
  }

  // Si hay sesión pero el rol del usuario no está autorizado para este grupo de rutas
  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    if (user.rol === "mecanico") return <Navigate to="/mecanico" replace />;
    if (user.rol === "cliente")  return <Navigate to="/usuario" replace />;
    return <Navigate to="/page/login" replace />;
  }

  // Si todo está en orden, renderiza las pantallas hijas
  return <Outlet />;
}