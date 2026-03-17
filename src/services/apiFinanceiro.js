import axios from 'axios'
import authService from './authService'
import config from '../config/config'

const apiFinanceiro = axios.create({
  baseURL: config.API_FINANCEIRO_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  },
})

apiFinanceiro.interceptors.request.use(
  (reqConfig) => {
    const token = authService.getToken()

    if (token && authService.isAuthenticated()) {
      reqConfig.headers.Authorization = `Bearer ${token}`
    }

    console.log(`[API Financeiro] ${reqConfig.method.toUpperCase()} ${reqConfig.url}`)

    return reqConfig
  },
  (error) => {
    console.error('[API Financeiro] Erro ao configurar requisição:', error)
    return Promise.reject(error)
  },
)

apiFinanceiro.interceptors.response.use(
  (response) => {
    console.log(`[API Financeiro] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`)
    return response
  },
  (error) => {
    if (error.response) {
      const { status, config: requestConfig } = error.response

      console.error(`[API Financeiro] ${requestConfig.method.toUpperCase()} ${requestConfig.url} - ${status}`)

      if (status === 401) {
        console.warn('[API Financeiro] Token inválido ou expirado. Fazendo logout...')
        authService.logout()

        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      if (status === 403) {
        console.error('[API Financeiro] Acesso negado.')
      }

      if (status === 404) {
        console.error('[API Financeiro] Recurso não encontrado.')
      }

      if (status >= 500) {
        console.error('[API Financeiro] Erro no servidor.')
      }
    } else if (error.request) {
      console.error('[API Financeiro] Sem resposta do servidor. Verifique sua conexão.')
    } else {
      console.error('[API Financeiro] Erro ao configurar requisição:', error.message)
    }

    return Promise.reject(error)
  },
)

const apiFinanceiroService = {
  async get(endpoint, config = {}) {
    const response = await apiFinanceiro.get(endpoint, config)
    return response.data
  },

  async post(endpoint, data, config = {}) {
    const response = await apiFinanceiro.post(endpoint, data, config)
    return response.data
  },

  async put(endpoint, data, config = {}) {
    const response = await apiFinanceiro.put(endpoint, data, config)
    return response.data
  },

  async patch(endpoint, data, config = {}) {
    const response = await apiFinanceiro.patch(endpoint, data, config)
    return response.data
  },

  async delete(endpoint, config = {}) {
    const response = await apiFinanceiro.delete(endpoint, config)
    return response.data
  },
}

export default apiFinanceiroService
