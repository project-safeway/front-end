import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    // Verifica se há um token válido ao carregar a aplicação
    const initializeAuth = () => {
      if (authService.isAuthenticated()) {
        // Tenta recuperar do localStorage (último login)
        const nomeUsuario = localStorage.getItem('nomeUsuario')
        const idTransporte = localStorage.getItem('idTransporte')
        const userId = authService.getUserId()
        const role = authService.getUserRole()
        const transportId = authService.getTransportId() || idTransporte
        setUser({ id: userId, role, transportId, nomeUsuario })
      }
      setLoading(false)
    }
    initializeAuth()
  }, [])

  const login = async (email, senha) => {
    const response = await authService.login(email, senha)
    // Salva nomeUsuario e idTransporte vindos do backend
    if (response.nomeUsuario) localStorage.setItem('nomeUsuario', response.nomeUsuario)
    if (response.idTransporte) localStorage.setItem('idTransporte', response.idTransporte)
    const userId = authService.getUserId()
    const role = authService.getUserRole()
    const transportId = authService.getTransportId() || response.idTransporte
    setUser({ id: userId, role, transportId, nomeUsuario: response.nomeUsuario })
    return response
  }

  const register = async (userData) => {
    const response = await authService.register(userData)
    return response
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
