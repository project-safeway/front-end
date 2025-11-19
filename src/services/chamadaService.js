import axios from 'axios';
import config from '../config/config';

const API_URL = config.API_BASE_URL;

const chamadaAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

chamadaAxios.interceptors.request.use((request) => {
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

chamadaAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Chamada API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

class ChamadaService {
  async _executarComRetry(fn, tentativas = 3, delay = 1000) {
    for (let i = 0; i < tentativas; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === tentativas - 1) throw error;
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }
        console.log(`[ChamadaService] Tentativa ${i + 1} falhou. Tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Inicia uma nova chamada para um itinerário
   * @param {number} itinerarioId - ID do itinerário
   * @returns {Promise<Object>} Dados da chamada criada
   */
  async iniciarChamada(itinerarioId) {
    return this._executarComRetry(async () => {
      const response = await chamadaAxios.post(`/chamada/iniciar/${itinerarioId}`);
      return response.data;
    });
  }

  /**
   * Altera o status de uma chamada
   * @param {number} chamadaId - ID da chamada
   * @param {string} status - Novo status (EM_ANDAMENTO, FINALIZADA, CANCELADA)
   * @returns {Promise<Object>} Dados da chamada atualizada
   */
  async alterarStatusChamada(chamadaId, status) {
    return this._executarComRetry(async () => {
      const response = await chamadaAxios.put(`/chamada/alterar/${chamadaId}?status=${status}`);
      return response.data;
    });
  }

  /**
   * Registra a presença dos alunos
   * @param {number} chamadaId - ID da chamada
   * @param {Object} presencas - Mapa de alunoId -> StatusPresencaEnum (PRESENTE, AUSENTE)
   * @returns {Promise<void>}
   */
  async registrarPresenca(chamadaId, presencas) {
    return this._executarComRetry(async () => {
      await chamadaAxios.put(`/chamada/${chamadaId}/registrar-presenca`, presencas);
    });
  }

  _tratarErro(error, mensagemPadrao) {
    console.error('[ChamadaService] Erro:', error);
    
    let mensagemUsuario = mensagemPadrao;

    if (error.response) {
      const status = error.response.status;
      const mensagemBackend = error.response.data?.message || error.response.data;

      switch (status) {
        case 400:
          mensagemUsuario = typeof mensagemBackend === 'string' 
            ? mensagemBackend 
            : 'Dados inválidos. Verifique as informações enviadas.';
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
          mensagemUsuario = mensagemBackend || 'Dados inválidos.';
          break;
        case 500:
          mensagemUsuario = 'Erro no servidor. Tente novamente mais tarde.';
          break;
        case 503:
          mensagemUsuario = 'Serviço temporariamente indisponível.';
          break;
        default:
          mensagemUsuario = mensagemBackend || mensagemPadrao;
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

export default new ChamadaService();