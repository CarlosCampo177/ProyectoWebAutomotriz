import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Usuario simulado — luego vendrá del backend
const MOCK_USER = {
  nombre: 'Admin General',
  rol: 'admin',      // admin,mecanico,cliente
  iniciales: 'A',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_USER)

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para consumir el contexto en cualquier componente
export function useAuth() {
  return useContext(AuthContext)
}