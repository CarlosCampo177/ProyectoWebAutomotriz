// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../services/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const token     = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user_data');

      // Si no hay token o datos guardados, no hay nada que verificar
      if (!token || !savedUser) {
        setLoading(false);
        return;
      }

      try {
        // Llama al backend con el token actual — si responde 401, el catch limpia todo
        await apiClient.get('Auth/verify');
        // Token válido → restaura la sesión en memoria
        setUser(JSON.parse(savedUser));
      } catch {
        // Token expirado, manipulado o inválido → borra todo y fuerza login
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, []);

  const login = (userData) => {
    if (userData && userData.token) {
      // Limpia cualquier sesión anterior antes de guardar la nueva
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');

      localStorage.setItem('token', userData.token);

      const infoUsuario = {
        id:        userData.id,
        nombre:    userData.nombre,
        email:     userData.email,
        rol:       userData.rol,
        iniciales: userData.iniciales,
        cedula:    userData.cedula,
        telefono:  userData.telefono,
        direccion: userData.direccion,
      };

      localStorage.setItem('user_data', JSON.stringify(infoUsuario));
      setUser(infoUsuario);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setUser(null);
    // RutasProtegidas detecta user=null y redirige sola a /page/login
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Verificando sesión...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}