import api from './api'

const mensalidadeService = {
  getMensalidadesPendentes: async (mes = null, ano = null) => {
    try {
      const params = new URLSearchParams()
      if (mes !== null) params.append('mes', mes)
      if (ano !== null) params.append('ano', ano)
      
      const response = await api.get(`/mensalidades/pendentes?${params.toString()}`)
      
      // Backend retorna Page<MensalidadeResponse>, então pegamos o conteúdo
      const data = response.content || response.data?.content || []
      
      return data
    } catch (error) {
      console.error('Erro ao buscar mensalidades pendentes:', error)
      throw error
    }
  },

  marcarComoPago: async (mensalidadeId, pagamentoId) => {
    try {
      const response = await api.put(
        `/mensalidades/${mensalidadeId}/marcar-pago?pagamentoId=${pagamentoId}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao marcar mensalidade como paga:', error)
      throw error
    }
  },

  agruparPorStatus: (mensalidades) => {
    // Verifica se mensalidades é um array válido
    if (!Array.isArray(mensalidades)) {
      return {
        pendentes: [],
        atrasadas: [],
        pagas: []
      }
    }
    
    return {
      pendentes: mensalidades.filter(m => m.status === 'PENDENTE'),
      atrasadas: mensalidades.filter(m => m.status === 'ATRASADO'),
      pagas: mensalidades.filter(m => m.status === 'PAGO')
    }
  },

  calcularTotais: (mensalidades) => {
    // Verifica se mensalidades é um array válido
    if (!Array.isArray(mensalidades)) {
      return {
        totalPendente: 0,
        totalAtrasado: 0,
        totalPago: 0,
        quantidadePendente: 0,
        quantidadeAtrasado: 0,
        quantidadePago: 0
      }
    }
    
    const grupos = mensalidadeService.agruparPorStatus(mensalidades)
    
    return {
      totalPendente: grupos.pendentes.reduce((sum, m) => sum + Number(m.valorMensalidade), 0),
      totalAtrasado: grupos.atrasadas.reduce((sum, m) => sum + Number(m.valorMensalidade), 0),
      totalPago: grupos.pagas.reduce((sum, m) => sum + Number(m.valorMensalidade), 0),
      quantidadePendente: grupos.pendentes.length,
      quantidadeAtrasado: grupos.atrasadas.length,
      quantidadePago: grupos.pagas.length
    }
  }
}

/**
 * Listar mensalidades com filtros compatíveis com o endpoint /mensalidades
 * params: { alunoId, dataInicio, dataFim, status, pageable }
 */
export async function listarMensalidades(params = {}) {
  // api.get deve retornar dados já tratados pelo wrapper (res.data) — ajusta se necessário
  return await api.get("/mensalidades", { params });
}

/**
 * Marcar mensalidade como paga (PATCH /mensalidades/pagar/{id})
 */
export async function pagarMensalidade(id) {
  return await api.patch(`/mensalidades/pagar/${id}`);
}

/**
 * Criar nova mensalidade (POST /mensalidades)
 * payload: { alunoId, dataVencimento, valorMensalidade, ... }
 */
export async function criarMensalidade(payload) {
  const res = await api.post("/mensalidades", payload);
  return res.data;
}

export default mensalidadeService