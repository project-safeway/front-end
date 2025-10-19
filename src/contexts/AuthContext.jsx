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
        const userId = authService.getUserId()
        const role = authService.getUserRole()
        setUser({ id: userId, role })
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email, senha) => {
    try {
      const response = await authService.login(email, senha)
      const userId = authService.getUserId()
      const role = authService.getUserRole()
      setUser({ id: userId, role })
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error) {
      throw error
    }
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
