import axios from 'axios'
import config from '../config/config'

const API_URL = config.API_BASE_URL

const alunoAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

alunoAxios.interceptors.request.use((request) => {
  const token = localStorage.getItem('token')
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }
  return request
})

alunoAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

class AlunosService {
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

  async createAluno(alunoData) {
    return this._executarComRetry(async () => {
      const response = await alunoAxios.post('/alunos', alunoData)
      return response.data
    })
  }

  async getEnderecosByAluno(alunoId) {
    return this._executarComRetry(async () => {
      const response = await alunoAxios.get(`/alunos/${alunoId}/enderecos`)
      return response.data
    })
  }


}

export default new AlunosService()