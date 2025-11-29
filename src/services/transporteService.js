import axios from 'axios'
import config from '../config/config'

const API_URL = config.API_BASE_URL

const transporteAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

transporteAxios.interceptors.request.use((request) => {
  const token = localStorage.getItem('token')
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }
  return request
})

transporteAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Transporte API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    })

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

class TransporteService {
  async _executarComRetry(fn, tentativas = 3, delay = 1000) {
    for (let i = 0; i < tentativas; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === tentativas - 1) throw error

        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error
        }

        console.log(`[TransporteService] Tentativa ${i + 1} falhou. Tentando novamente em ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  async buscarPorId(id) {
    return this._executarComRetry(async () => {
      console.log(`[TransporteService] Buscando transporte ID ${id}`)
      const response = await transporteAxios.get(`/transporte/${id}`)
      return response.data
    })
  }

  async getUserTransport() {
    return this._executarComRetry(async () => {
      console.log('[TransporteService] Buscando transporte do usuário logado')
      const response = await transporteAxios.get('/transporte')
      return response.data
    })
  }

  async listarAlunos(transporteId) {
    return this._executarComRetry(async () => {
      try {
        const response = await transporteAxios.get(`/transporte/${transporteId}/alunos`)
        
        let alunos = []
        
        if (response.data.alunosTransportes) {
          alunos = response.data.alunosTransportes
        } else if (response.data.alunos) {
          alunos = response.data.alunos
        } else if (Array.isArray(response.data)) {
          alunos = response.data
        } else {
          throw new Error('Formato de dados inesperado do backend ao listar alunos do transporte')
        }
        
        // Se não encontrou alunos, retorna array vazio
        if (!alunos || alunos.length === 0) {
          return []
        }
        
        // Mapear para formato consistente
        return alunos.map(item => {
          // Se item tem propriedade 'aluno', é alunoTransporte
          const alunoData = item.aluno || item
          
          return {
            id: alunoData.idAluno || alunoData.id,
            nomeAluno: alunoData.nome,
            responsavel: alunoData.nomeResponsavel || alunoData.responsavel,
            escola: alunoData.escola?.nome || alunoData.escola || 'Não informado',
            // Dados completos caso precise
            ...alunoData
          }
        })
      } catch (error) {
        // Tratar erro específico de referência circular
        if (error.message && error.message.includes('nesting depth')) {
          throw new Error('Erro ao carregar alunos. O backend precisa corrigir referências circulares nas entidades.')
        }
        throw error
      }
    })
  }

  async listarTransportesUsuario() {
    return this._executarComRetry(async () => {
      const response = await transporteAxios.get('/transporte')
      return response.data
    })
  }

  _tratarErro(error, mensagemPadrao) {
    console.error('[TransporteService] Erro:', error)

    let mensagemUsuario = mensagemPadrao

    if (error.response) {
      const status = error.response.status

      switch (status) {
        case 400:
          mensagemUsuario = 'Dados inválidos. Verifique as informações enviadas.'
          break
        case 401:
          mensagemUsuario = 'Sessão expirada. Faça login novamente.'
          window.location.href = '/login'
          break
        case 403:
          mensagemUsuario = 'Você não tem permissão para realizar esta ação.'
          break
        case 404:
          mensagemUsuario = 'Transporte não encontrado.'
          break
        case 500:
          mensagemUsuario = 'Erro no servidor. Tente novamente mais tarde.'
          break
        default:
          mensagemUsuario = error.response.data?.message || mensagemPadrao
      }
    } else if (error.request) {
      mensagemUsuario = 'Sem resposta do servidor. Verifique sua conexão.'
    } else {
      mensagemUsuario = error.message || mensagemPadrao
    }

    const errorObj = new Error(mensagemUsuario)
    errorObj.status = error.response?.status
    errorObj.originalError = error
    throw errorObj
  }
}

export default new TransporteService()