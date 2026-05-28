import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Inicializamos el estado intentando recuperar si había una sesión activa al recargar la página
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    // Si necesitas persistir los datos básicos del usuario, podrías guardarlos serializados,
    // pero por ahora mantengamos el flujo del token.
    return null; 
  })

  const login = (userData) => {
    // 1. Guardamos el token en el navegador apenas inicia sesión
    if (userData && userData.token) {
      localStorage.setItem('token', userData.token);
    }
    // 2. Guardamos el resto de los datos en el estado global de React
    setUser(userData);
  }

  const logout = () => {
    // 1. Limpiamos el token por completo del navegador para cerrar las puertas
    localStorage.removeItem('token');
    // 2. Limpiamos el usuario en React
    setUser(null);
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