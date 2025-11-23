import axios from 'axios'
import config from '../config/config'

const API_URL = config.API_BASE_URL

const itinerarioAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

itinerarioAxios.interceptors.request.use((request) => {
  const token = localStorage.getItem('token')
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }
  return request
})

itinerarioAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Itinerario API Error]', {
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

class ItinerarioService {

  async _executarComRetry(fn, tentativas = 3, delay = 1000) {
    for (let i = 0; i < tentativas; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === tentativas - 1) throw error;

        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }

        console.log(`[ItinerarioService] Tentativa ${i + 1} falhou. Tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  _formatarHorario(horario) {
    if (!horario) return null;
    if (horario.split(':').length === 3) return horario;
    return `${horario}:00`;
  }

  _prepararDados(itinerarioData) {
    const dados = { ...itinerarioData };
    
    if (dados.horarioInicio) {
      dados.horarioInicio = this._formatarHorario(dados.horarioInicio);
    }
    
    if (dados.horarioFim) {
      dados.horarioFim = this._formatarHorario(dados.horarioFim);
    }
    
    return dados;
  }

  async listarTodos() {
    return this._executarComRetry(async () => {
      const response = await itinerarioAxios.get('/itinerarios');
      return response.data;
    });
  }

  async buscarPorId(id) {
    return this._executarComRetry(async () => {
      const response = await itinerarioAxios.get(`/itinerarios/${id}`);
      return response.data;
    })
  }

  async criar(itinerarioData) {
    const dataFormatada = this._prepararDados(itinerarioData);

    return this._executarComRetry(async () => {
      const response = await itinerarioAxios.post('/itinerarios', dataFormatada)
      return response.data
    })
  }

  async atualizar(id, itinerarioData) {
    const dataFormatada = this._prepararDados(itinerarioData);
    
    console.log('========================================');
    console.log('[ItinerarioService] ATUALIZANDO ITINERÁRIO');
    console.log('ID:', id);
    console.log('Dados enviados:', JSON.stringify(dataFormatada, null, 2));
    console.log('Quantidade de alunos:', dataFormatada.alunos?.length || 0);
    console.log('Quantidade de escolas:', dataFormatada.escolas?.length || 0);
    console.log('========================================');
    
    return this._executarComRetry(async () => {
      const response = await itinerarioAxios.put(`/itinerarios/${id}`, dataFormatada)
      console.log('[ItinerarioService] Resposta do backend:', response.data);
      return response.data
    })
  }

  async desativar(id) {
    return this._executarComRetry(async () => {
      await itinerarioAxios.delete(`/itinerarios/${id}`)
    })
  }

  async adicionarAluno(itinerarioId, alunoData) {
    return this._executarComRetry(async () => {
      const response = await itinerarioAxios.post(`/itinerarios/${itinerarioId}/alunos`, alunoData)
      return response.data
    })
  }

  async removerAluno(itinerarioId, alunoId) {
    return this._executarComRetry(async () => {
      await itinerarioAxios.delete(`/itinerarios/${itinerarioId}/alunos/${alunoId}`)
    })
  }

  async reordenarAlunos(itinerarioId, novaOrdemIds) {
    console.log('========================================');
    console.log('[ItinerarioService] REORDENANDO ALUNOS');
    console.log('Itinerário ID:', itinerarioId);
    console.log('Nova ordem de IDs:', novaOrdemIds);
    console.log('URL:', `/itinerarios/${itinerarioId}/alunos/ordem`);
    console.log('========================================');
    
    return this._executarComRetry(async () => {
      const response = await itinerarioAxios.patch(`/itinerarios/${itinerarioId}/alunos/ordem`, novaOrdemIds)
      console.log('[ItinerarioService] Resposta reordenação alunos:', response.data);
      return response.data;
    })
  }

  /**
   * ===============================================
   * MÉTODOS PARA ESCOLAS
   * ===============================================
   */

  /**
   * Adiciona uma escola ao itinerário
   * @param {number} itinerarioId - ID do itinerário
   * @param {Object} escolaData - Dados da escola
   * @param {number} escolaData.escolaId - ID da escola
   * @param {number} escolaData.ordemVisita - Ordem de visita
   * @param {number} escolaData.enderecoId - ID do endereço (opcional)
   */
  async adicionarEscola(itinerarioId, escolaData) {
    return this._executarComRetry(async () => {
      const response = await itinerarioAxios.post(`/itinerarios/${itinerarioId}/escolas`, escolaData)
      return response.data
    })
  }

  /**
   * Remove uma escola do itinerário
   * @param {number} itinerarioId - ID do itinerário
   * @param {number} escolaId - ID da escola
   */
  async removerEscola(itinerarioId, escolaId) {
    return this._executarComRetry(async () => {
      await itinerarioAxios.delete(`/itinerarios/${itinerarioId}/escolas/${escolaId}`)
    })
  }

  /**
   * Reordena as escolas de um itinerário
   * @param {number} itinerarioId - ID do itinerário
   * @param {Array<number>} novaOrdemIds - Array com IDs das escolas na nova ordem
   */
  async reordenarEscolas(itinerarioId, novaOrdemIds) {
    console.log('========================================');
    console.log('[ItinerarioService] REORDENANDO ESCOLAS');
    console.log('Itinerário ID:', itinerarioId);
    console.log('Nova ordem de IDs:', novaOrdemIds);
    console.log('URL:', `/itinerarios/${itinerarioId}/escolas/ordem`);
    console.log('========================================');
    
    return this._executarComRetry(async () => {
      const response = await itinerarioAxios.patch(`/itinerarios/${itinerarioId}/escolas/ordem`, novaOrdemIds)
      console.log('[ItinerarioService] Resposta reordenação escolas:', response.data);
      return response.data;
    })
  }

  _tratarErro(error, mensagemPadrao) {
    console.error('[ItinerarioService] Erro:', error);

    let mensagemUsuario = mensagemPadrao;

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 400:
          mensagemUsuario = 'Dados inválidos. Verifique as informações enviadas.';
          break;
        case 401:
          mensagemUsuario = 'Sessão expirada. Faça login novamente.';
          window.location.href = '/login';
          break;
        case 403:
          mensagemUsuario = 'Você não tem permissão para realizar esta ação.';
          break;
        case 404:
          mensagemUsuario = 'Recurso não encontrado.';
          break;
        case 422:
          mensagemUsuario = error.response.data?.message || 'Dados inválidos.';
          break;
        case 500:
          mensagemUsuario = 'Erro no servidor. Tente novamente mais tarde.';
          break;
        case 503:
          mensagemUsuario = 'Serviço temporariamente indisponível.';
          break;
        default:
          mensagemUsuario = error.response.data?.message || mensagemPadrao;
      }
    } else if (error.request) {
      mensagemUsuario = 'Sem resposta do servidor. Verifique sua conexão.';
    } else {
      mensagemUsuario = error.message || mensagemPadrao;
    }

    const errorObj = new Error(mensagemUsuario);
    errorObj.status = error.response?.status;
    errorObj.originalError = error;
    throw errorObj;
  }
}

export default new ItinerarioService()