// Serviço de autenticação para gerenciar login, registro e tokens JWT
import axios from 'axios'
import config from '../config/config'

const API_URL = `${config.API_BASE_URL}${config.AUTH_ENDPOINTS.LOGIN.replace('/login', '')}`

const authAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

class AuthService {
  /**
   * Realiza o login do usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} Dados de autenticação (token e expiresIn)
   */
  async login(email, senha) {
    try {
      console.log('[AuthService] Tentando fazer login...')
      
      const response = await authAxios.post('/login', { email, senha })
      const data = response.data
      
      // Salva o token e a data de expiração no localStorage
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken)
        localStorage.setItem('tokenExpiration', Date.now() + data.expiresIn * 1000)
        console.log('[AuthService] Login bem-sucedido, token salvo')
      }

      return data
    } catch (error) {
      console.error('[AuthService] Erro no login:', error.message)
      
      // Trata erro do axios
      if (error.response) {
        // Servidor respondeu com erro (4xx, 5xx)
        const message = error.response.data?.message || error.response.data || 'Erro ao fazer login'
        throw new Error(message)
      } else if (error.request) {
        // Requisição foi feita mas não houve resposta
        throw new Error('Sem resposta do servidor. Verifique sua conexão.')
      } else {
        // Erro ao configurar a requisição
        throw new Error(error.message || 'Erro ao fazer login')
      }
    }
  }

  /**
   * Realiza o registro de um novo usuário
   * @param {Object} userData - Dados do usuário para registro
   * @returns {Promise<string>} Mensagem de sucesso
   */
  async register(userData) {
    try {
      console.log('[AuthService] Tentando registrar usuário...')
      
      const response = await authAxios.post('/register', userData)

      console.log('[AuthService] Usuário registrado com sucesso')

      // Backend pode retornar texto ou JSON
      return typeof response.data === 'string' ? response.data : response.data.message || 'Usuário registrado com sucesso'
    } catch (error) {
      console.error('[AuthService] Erro no registro:', error.message)

      // Trata erro do axios
      if (error.response) {
        const message = error.response.data?.message || error.response.data || 'Erro ao registrar usuário'
        throw new Error(message)
      } else if (error.request) {
        throw new Error('Sem resposta do servidor. Verifique sua conexão.')
      } else {
        throw new Error(error.message || 'Erro ao registrar usuário')
      }
    }
  }

  /**
   * Realiza o logout do usuário
   */
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('tokenExpiration')
  }

  /**
   * Retorna o token JWT armazenado
   * @returns {string|null} Token JWT ou null
   */
  getToken() {
    const token = localStorage.getItem('token')
    const expiration = localStorage.getItem('tokenExpiration')

    // Verifica se o token expirou
    if (token && expiration && Date.now() < parseInt(expiration)) {
      return token
    }

    // Token expirado, remove do localStorage
    this.logout()
    return null
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.getToken() !== null
  }

  /**
   * Decodifica o token JWT (não valida a assinatura)
   * @returns {Object|null} Payload do token ou null
   */
  getTokenPayload() {
    const token = this.getToken()
    if (!token) return null

    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )

      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Erro ao decodificar token:', error)
      return null
    }
  }

  /**
   * Retorna o ID do usuário do token
   * @returns {string|null}
   */
  getUserId() {
    const payload = this.getTokenPayload()
    return payload?.sub || null
  }

  /**
   * Retorna o role do usuário do token
   * @returns {string|null}
   */
  getUserRole() {
    const payload = this.getTokenPayload()
    return payload?.role || null
  }
}

export default new AuthService()
