import api from './api'

/**
 * Serviço para gerenciar transações financeiras
 * Backend deve implementar endpoints em /api/financeiro
 */

const financeiroService = {
  /**
   * Busca todas as transações do cliente autenticado
   * @returns {Promise<Array>} Lista de transações
   */
  async getTransacoes() {
    try {
      const response = await api.get('/financeiro/transacoes')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
      // Fallback para dados mockados se backend não disponível
      return this.getMockTransacoes()
    }
  },

  /**
   * Busca uma transação específica por ID
   * @param {number} id - ID da transação
   * @returns {Promise<Object>} Transação
   */
  async getTransacaoById(id) {
    try {
      const response = await api.get(`/financeiro/transacoes/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar transação:', error)
      throw error
    }
  },

  /**
   * Cria uma nova transação
   * @param {Object} transacao - Dados da transação
   * @returns {Promise<Object>} Transação criada
   */
  async createTransacao(transacao) {
    try {
      const response = await api.post('/financeiro/transacoes', transacao)
      return response.data
    } catch (error) {
      console.error('Erro ao criar transação:', error)
      throw error
    }
  },

  /**
   * Atualiza uma transação existente
   * @param {number} id - ID da transação
   * @param {Object} transacao - Dados atualizados
   * @returns {Promise<Object>} Transação atualizada
   */
  async updateTransacao(id, transacao) {
    try {
      const response = await api.put(`/financeiro/transacoes/${id}`, transacao)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar transação:', error)
      throw error
    }
  },

  /**
   * Deleta uma transação
   * @param {number} id - ID da transação
   * @returns {Promise<void>}
   */
  async deleteTransacao(id) {
    try {
      await api.delete(`/financeiro/transacoes/${id}`)
    } catch (error) {
      console.error('Erro ao deletar transação:', error)
      throw error
    }
  },

  /**
   * Busca resumo financeiro (receitas, despesas, saldo)
   * @param {Object} filters - Filtros (período, categoria, etc)
   * @returns {Promise<Object>} Resumo financeiro
   */
  async getResumo(filters = {}) {
    try {
      const response = await api.get('/financeiro/resumo', { params: filters })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar resumo:', error)
      // Fallback para dados mockados
      return this.getMockResumo()
    }
  },

  /**
   * Busca transações por período
   * @param {string} dataInicio - Data inicial (YYYY-MM-DD)
   * @param {string} dataFim - Data final (YYYY-MM-DD)
   * @returns {Promise<Array>} Lista de transações
   */
  async getTransacoesPorPeriodo(dataInicio, dataFim) {
    try {
      const response = await api.get('/financeiro/transacoes', {
        params: { dataInicio, dataFim }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar transações por período:', error)
      return []
    }
  },

  /**
   * Busca categorias disponíveis
   * @returns {Promise<Array>} Lista de categorias
   */
  async getCategorias() {
    try {
      const response = await api.get('/financeiro/categorias')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      return this.getMockCategorias()
    }
  },
}

export default financeiroService
