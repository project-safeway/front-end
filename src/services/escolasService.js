import axios from 'axios'
import config from '../config/config'

const API_URL = config.API_BASE_URL

const escolasAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

escolasAxios.interceptors.request.use((request) => {
  const token = localStorage.getItem('token')
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }
  return request
})

escolasAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

class EscolasService {
  async _executarComRetry(fn, tentativas = 3, delay = 1000) {
    for (let i = 0; i < tentativas; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === tentativas - 1) throw error
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  async createEscola(escolaData) {
    return this._executarComRetry(async () => {
      const usuarioId = localStorage.getItem('userId')
      const response = await escolasAxios.post('/escolas', escolaData, {
        params: { usuarioId }
      })
      return response.data
    })
  }

  async getEscolas() {
    return this._executarComRetry(async () => {
      const response = await escolasAxios.get('/escolas')
      return response.data
    })
  }

  async getEscolaById(id) {
    return this._executarComRetry(async () => {
      const response = await escolasAxios.get(`/escolas/${id}`)
      return response.data
    })
  }

  async getEnderecoEscola(escolaId) {
    return this._executarComRetry(async () => {
      const response = await escolasAxios.get(`/escolas/${escolaId}/endereco`)
      return response.data
    })
  }
}

export default new EscolasService()