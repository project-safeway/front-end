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

  async getEnderecoById(enderecoId) {
    return this._executarComRetry(async () => {
      const response = await alunoAxios.get(`/enderecos/${enderecoId}`)
      console.log('Resposta getEnderecoById:', response.data)
      return response.data
    })
  }

  async getAlunoById(alunoId) {
    return this._executarComRetry(async () => {
      const response = await alunoAxios.get(`/alunos/${alunoId}`)
      console.log('Resposta getAlunoById:', response.data)
      return response.data
    })
  }

  async updateAluno(alunoId, alunoData) {
    return this._executarComRetry(async () => {
      const response = await alunoAxios.put(`/alunos/${alunoId}`, alunoData)
      return response.data
    })
  }

  async updateResponsavel(responsavelId, responsavelData) {
    return this._executarComRetry(async () => {
      const response = await alunoAxios.put(`/responsavel/${responsavelId}`, responsavelData)
      return response.data
    })
  }

  async createResponsavel(responsavelData) {
    return this._executarComRetry(async () => {
      const response = await alunoAxios.post('/responsavel', responsavelData)
      return response.data
    })
  }

  async updateEndereco(enderecoId, enderecoData) {
    return this._executarComRetry(async () => {
      const response = await alunoAxios.put(`/enderecos/${enderecoId}`, enderecoData)
      return response.data
    })
  }

  async createEndereco(enderecoData) {
    return this._executarComRetry(async () => {
      const response = await alunoAxios.post('/enderecos', enderecoData)
      return response.data
    })
  }

  async deletarResponsavel(responsavelId) {
    return this._executarComRetry(async () => {
      const response = await alunoAxios.delete(`/responsavel/${responsavelId}`)
      return response.data
    })
  }
}

export default new AlunosService()