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

    return reqConfig
  },
  (error) => Promise.reject(error),
)

apiFinanceiro.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, config: requestConfig } = error.response

      if (status === 401) {
        authService.logout()

        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      void requestConfig
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
