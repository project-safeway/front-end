import api from './api'

/**
 * ===============================================
 * SERVIÇO DE EVENTOS
 * ===============================================
 * Gerencia todas as operações relacionadas a eventos
 * Integra com a API backend para persistência em banco de dados
 */

const eventService = {
  /**
   * Busca todos os eventos do cliente logado
   * @returns {Promise<Array>} Lista de eventos
   */
  async getEvents() {
    try {
      const response = await api.get('/eventos')
      return response.data || response
    } catch (error) {
      console.error('[EventService] Erro ao buscar eventos:', error)
      throw error
    }
  },

  /**
   * Busca eventos de um período específico
   * @param {Date} startDate - Data inicial
   * @param {Date} endDate - Data final
   * @returns {Promise<Array>} Lista de eventos filtrados
   */
  async getEventsByPeriod(startDate, endDate) {
    try {
      const response = await api.get('/eventos', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      })
      return response.data || response
    } catch (error) {
      console.error('[EventService] Erro ao buscar eventos por período:', error)
      throw error
    }
  },

  /**
   * Cria um novo evento
   * @param {Object} eventData - Dados do evento
   * @param {string} eventData.title - Título do evento
   * @param {Date} eventData.date - Data do evento
   * @param {string} eventData.type - Tipo (manutencao, reuniao, vencimento, treinamento)
   * @param {string} eventData.priority - Prioridade (alta, media, baixa)
   * @param {string} eventData.description - Descrição opcional
   * @returns {Promise<Object>} Evento criado
   */
  async createEvent(eventData) {
    try {
      const response = await api.post('/eventos', eventData)
      return response.data || response
    } catch (error) {
      console.error('[EventService] Erro ao criar evento:', error)
      throw error
    }
  },

  /**
   * Atualiza um evento existente
   * @param {number} eventId - ID do evento
   * @param {Object} eventData - Dados atualizados
   * @returns {Promise<Object>} Evento atualizado
   */
  async updateEvent(eventId, eventData) {
    try {
      const response = await api.put(`/eventos/${eventId}`, eventData)
      return response.data || response
    } catch (error) {
      console.error('[EventService] Erro ao atualizar evento:', error)
      throw error
    }
  },

  /**
   * Deleta um evento
   * @param {number} eventId - ID do evento
   * @returns {Promise<void>}
   */
  async deleteEvent(eventId) {
    try {
      await api.delete(`/eventos/${eventId}`)
    } catch (error) {
      console.error('[EventService] Erro ao deletar evento:', error)
      throw error
    }
  },

  /**
   * Busca um evento específico por ID
   * @param {number} eventId - ID do evento
   * @returns {Promise<Object>} Dados do evento
   */
  async getEventById(eventId) {
    try {
      const response = await api.get(`/eventos/${eventId}`)
      return response.data || response
    } catch (error) {
      console.error('[EventService] Erro ao buscar evento:', error)
      throw error
    }
  },
}

export default eventService
