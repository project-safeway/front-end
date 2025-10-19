import axios from 'axios'
import authService from './authService'
import config from '../config/config'

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * ===============================================
 * INTERCEPTOR DE REQUISIÇÃO
 * ===============================================
 * Executado ANTES de cada requisição ser enviada ao servidor
 * 
 * Responsabilidades:
 * 1. Pegar o token do authService
 * 2. Verificar se o token ainda é válido
 * 3. Adicionar o token no header Authorization
 */
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    
    // Se houver token válido, adiciona no header
    if (token && authService.isAuthenticated()) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log de debug (remova em produção)
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`)
    
    return config
  },
  (error) => {
    console.error('[API] Erro ao configurar requisição:', error)
    return Promise.reject(error)
  }
)

/**
 * ===============================================
 * INTERCEPTOR DE RESPOSTA
 * ===============================================
 * Executado DEPOIS de receber a resposta do servidor
 * 
 * Responsabilidades:
 * 1. Tratar erro 401 (token inválido/expirado)
 * 2. Fazer logout automático
 * 3. Redirecionar para login
 * 4. Tratar outros erros de forma consistente
 */
api.interceptors.response.use(
  (response) => {
    // Resposta bem-sucedida (2xx)
    console.log(`[API] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`)
    return response
  },
  (error) => {
    // Erro na resposta
    if (error.response) {
      const { status, config: requestConfig } = error.response
      
      console.error(`[API] ${requestConfig.method.toUpperCase()} ${requestConfig.url} - ${status}`)

      // ERRO 401: Token inválido ou expirado
      if (status === 401) {
        console.warn('[API] Token inválido ou expirado. Fazendo logout...')
        authService.logout()
        
        // Evita loop infinito se já estiver na página de login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      // ERRO 403: Sem permissão
      if (status === 403) {
        console.error('[API] Acesso negado. Usuário sem permissão.')
      }

      // ERRO 404: Recurso não encontrado
      if (status === 404) {
        console.error('[API] Recurso não encontrado.')
      }

      // ERRO 500: Erro no servidor
      if (status >= 500) {
        console.error('[API] Erro no servidor.')
      }
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      console.error('[API] Sem resposta do servidor. Verifique sua conexão.')
    } else {
      // Erro ao configurar a requisição
      console.error('[API] Erro ao configurar requisição:', error.message)
    }

    return Promise.reject(error)
  }
)

/**
 * ===============================================
 * WRAPPER DE MÉTODOS HTTP
 * ===============================================
 * Facilita o uso e adiciona tratamento de erros consistente
 */
const apiService = {
  /**
   * GET - Buscar dados
   * @param {string} endpoint - Endpoint da API (ex: '/alunos', '/rotas/1')
   * @param {Object} config - Configurações adicionais do axios (params, headers, etc)
   * @returns {Promise<any>} Dados da resposta
   * 
   * @example
   * // Buscar todos os alunos
   * const alunos = await api.get('/alunos')
   * 
   * // Buscar com query params
   * const alunos = await api.get('/alunos', { params: { nome: 'João' } })
   */
  async get(endpoint, config = {}) {
    try {
      const response = await api.get(endpoint, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * POST - Criar novo recurso
   * @param {string} endpoint - Endpoint da API
   * @param {Object} data - Dados a serem enviados
   * @param {Object} config - Configurações adicionais do axios
   * @returns {Promise<any>} Dados da resposta
   * 
   * @example
   * const novoAluno = await api.post('/alunos', { nome: 'João', idade: 10 })
   */
  async post(endpoint, data, config = {}) {
    try {
      const response = await api.post(endpoint, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * PUT - Atualizar recurso completo
   * @param {string} endpoint - Endpoint da API
   * @param {Object} data - Dados completos do recurso
   * @param {Object} config - Configurações adicionais do axios
   * @returns {Promise<any>} Dados da resposta
   * 
   * @example
   * const alunoAtualizado = await api.put('/alunos/1', { nome: 'João Silva', idade: 11 })
   */
  async put(endpoint, data, config = {}) {
    try {
      const response = await api.put(endpoint, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * PATCH - Atualizar recurso parcialmente
   * @param {string} endpoint - Endpoint da API
   * @param {Object} data - Campos a serem atualizados
   * @param {Object} config - Configurações adicionais do axios
   * @returns {Promise<any>} Dados da resposta
   * 
   * @example
   * const alunoAtualizado = await api.patch('/alunos/1', { idade: 11 })
   */
  async patch(endpoint, data, config = {}) {
    try {
      const response = await api.patch(endpoint, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * DELETE - Remover recurso
   * @param {string} endpoint - Endpoint da API
   * @param {Object} config - Configurações adicionais do axios
   * @returns {Promise<any>} Dados da resposta
   * 
   * @example
   * await api.delete('/alunos/1')
   */
  async delete(endpoint, config = {}) {
    try {
      const response = await api.delete(endpoint, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Tratamento consistente de erros do axios
   * @param {Error} error - Erro capturado
   * @returns {Error} Erro formatado com mensagem amigável
   */
  handleError(error) {
    if (error.response) {
      // Servidor respondeu com status de erro (4xx, 5xx)
      const message = error.response.data?.message 
        || error.response.data?.error
        || error.response.data 
        || error.message
      
      const status = error.response.status
      
      return new Error(`[${status}] ${message}`)
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      return new Error('Sem resposta do servidor. Verifique sua conexão com a internet.')
    } else {
      // Erro ao configurar a requisição
      return new Error(error.message || 'Erro desconhecido ao fazer requisição.')
    }
  },
}

/**
 * Exporta o wrapper (recomendado para uso geral)
 * e a instância do axios (para casos especiais)
 */
export { api as axiosInstance }
export default apiService
