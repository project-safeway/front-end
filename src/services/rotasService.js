import { data } from 'react-router-dom'
import api from './api'

/**
 * ===============================================
 * ROTAS SERVICE
 * ===============================================
 * Serviço para gerenciar otimização de rotas
 */

const rotasService = {
    /**
     * Otimiza a rota de um itinerário
     * @param {Object} dados - Dados para otimização
     * @param {Object} dados.veiculo - Informações do veículo
     * @param {Array} dados.pontosParada - Lista de pontos de parada
     * @param {boolean} dados.otimizarOrdem - Se deve otimizar a ordem
     * @returns {Promise<Object>} Rota otimizada
     */
    async otimizarRota(dados) {
        try {
            console.log('[RotasService] Enviando requisição:', dados);
            const response = await api.post('/rotas/otimizar', dados)
            console.log('[RotasService] Resposta da API:', response);

            // O backend já retorna processado, não precisa processar novamente
            return response;
        } catch (error) {
            console.error('[RotasService] Erro ao otimizar rota:', error)
            throw error
        }
    },

    /**
     * Busca alunos de um itinerário específico
     * @param {string|number} itinerarioId - ID do itinerário
     * @returns {Promise<Array>} Lista de alunos do itinerário
     */
    async buscarAlunosDoItinerario(itinerarioId) {
        try {
            const response = await api.get(`/itinerarios/${itinerarioId}/alunos`)
            console.log('[RotasService] Resposta raw de alunos:', JSON.stringify(response, null, 2))
            return response
        } catch (error) {
            console.error('[RotasService] Erro ao buscar alunos do itinerário:', error)
            throw error
        }
    },

    /**
     * Busca dados completos de um itinerário
     * @param {string|number} itinerarioId - ID do itinerário
     * @returns {Promise<Object>} Dados do itinerário
     */
    async buscarItinerario(itinerarioId) {
        try {
            const response = await api.get(`/itinerarios/${itinerarioId}`)
            return response
        } catch (error) {
            console.error('[RotasService] Erro ao buscar itinerário:', error)
            throw error
        }
    },

    /**
     * Adiciona um aluno a um itinerário
     * @param {string|number} itinerarioId - ID do itinerário
     * @param {Object} alunoData - Dados do aluno
     * @param {number} alunoData.alunoId - ID do aluno
     * @param {number} alunoData.ordemEmbarque - Ordem de embarque
     * @param {number} alunoData.enderecoId - ID do endereço
     * @returns {Promise<void>}
     * 
     * @example
     * await rotasService.adicionarAlunoAoItinerario(1, {
     *   alunoId: 5,
     *   ordemEmbarque: 1,
     *   enderecoId: 10
     * })
     */
    async adicionarAlunoAoItinerario(itinerarioId, alunoData) {
        try {
            // Valida os dados obrigatórios
            if (!alunoData.alunoId || !alunoData.enderecoId) {
                throw new Error('alunoId e enderecoId são obrigatórios')
            }

            // Garante que os valores sejam números
            const request = {
                alunoId: Number(alunoData.alunoId),
                ordemEmbarque: Number(alunoData.ordemEmbarque) || 1,
                enderecoId: Number(alunoData.enderecoId)
            }

            const response = await api.post(`/itinerarios/${itinerarioId}/alunos`, request)
            return response
        } catch (error) {
            console.error('[RotasService] Erro ao adicionar aluno ao itinerário:', error)

            // Tratamento específico de erros
            if (error.response?.status === 400) {
                throw new Error('Dados inválidos. Verifique as informações enviadas.')
            } else if (error.response?.status === 404) {
                throw new Error('Itinerário ou aluno não encontrado.')
            } else if (error.response?.status === 409) {
                throw new Error('Aluno já está cadastrado neste itinerário.')
            }

            throw error
        }
    },

    /**
     * Remove um aluno de um itinerário
     * @param {string|number} itinerarioId - ID do itinerário
     * @param {string|number} alunoId - ID do aluno
     * @returns {Promise<void>}
     */
    async removerAlunoDoItinerario(itinerarioId, alunoId) {
        try {
            const response = await api.delete(`/itinerarios/${itinerarioId}/alunos/${alunoId}`)
            return response
        } catch (error) {
            console.error('[RotasService] Erro ao remover aluno do itinerário:', error)
            throw error
        }
    },

    /**
     * Reordena os alunos de um itinerário
     * @param {string|number} itinerarioId - ID do itinerário
     * @param {Array<number>} novaOrdemIds - Array com IDs dos alunos na nova ordem
     * @returns {Promise<void>}
     */
    async reordenarAlunos(itinerarioId, novaOrdemIds) {
        try {
            const response = await api.patch(`/itinerarios/${itinerarioId}/alunos/ordem`, novaOrdemIds)
            return response
        } catch (error) {
            console.error('[RotasService] Erro ao reordenar alunos:', error)
            throw error
        }
    }
}

export default rotasService
