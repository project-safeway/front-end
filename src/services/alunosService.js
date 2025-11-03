// src/services/alunosService.js
import api from './api'

const alunosService = {
  /**
   * Busca todos os alunos (ou com filtros)
   * @param {Object} params - Filtros opcionais, ex: { escolaId: 1 }
   * @returns {Promise<Array>}
   */
  async getAlunos(params = {}) {
    const data = await api.get('/alunos', { params })
    return data
  },

  /**
   * Busca alunos de uma escola específica
   * @param {number|string} escolaId
   * @returns {Promise<Array>}
   */
  async getAlunosByEscola(escolaId) {
    const data = await api.get(`/escolas/${escolaId}/alunos`)
    return data
  },

  /**
   * Busca um aluno por ID
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async getAlunoById(id) {
    const data = await api.get(`/alunos/${id}`)
    return data
  },

  /**
   * Cria um novo aluno
   * @param {Object} payload - Dados do aluno
   * @returns {Promise<Object>}
   */
  async createAluno(payload) {
    const data = await api.post('/alunos', payload)
    return data
  },

  /**
   * Atualiza os dados de um aluno
   * @param {number|string} id - ID do aluno
   * @param {Object} payload - Dados atualizados
   * @returns {Promise<Object>}
   */
  async updateAluno(id, payload) {
    const data = await api.put(`/alunos/${id}`, payload)
    return data
  },

  /**
   * Exclui um aluno
   * @param {number|string} id - ID do aluno
   * @returns {Promise<void>}
   */
  async deleteAluno(id) {
    const data = await api.delete(`/alunos/${id}`)
    return data
  },
}

export default alunosService
