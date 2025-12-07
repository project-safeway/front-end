import api from './api'

const mensalidadeService = {
  getMensalidadesPendentes: async (mes = null, ano = null) => {
    try {
      const params = new URLSearchParams()
      if (mes !== null) params.append('mes', mes)
      if (ano !== null) params.append('ano', ano)
      
      console.log('[mensalidadeService] getMensalidadesPendentes', { mes, ano })
      const response = await api.get(`/mensalidades/pendentes?${params.toString()}`)
      
      return response.content || []
    } catch (error) {
      console.error('Erro ao buscar mensalidades pendentes:', error)
      throw error
    }
  },

  getMensalidadesPagas: async (mes = null, ano = null) => {
    try {
      const params = new URLSearchParams()
      if (mes !== null) params.append('mes', mes)
      if (ano !== null) params.append('ano', ano)
      
      console.log('[mensalidadeService] getMensalidadesPagas', { mes, ano })
      const response = await api.get(`/mensalidades/pagas?${params.toString()}`)
      
      return response.content || []
    } catch (error) {
      console.error('Erro ao buscar mensalidades pagas:', error)
      throw error
    }
  },

  agruparPorStatus: (mensalidades) => {
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
      totalPendente: grupos.pendentes.reduce((sum, m) => sum + Number(m.valorMensalidade || 0), 0),
      totalAtrasado: grupos.atrasadas.reduce((sum, m) => sum + Number(m.valorMensalidade || 0), 0),
      totalPago: grupos.pagas.reduce((sum, m) => sum + Number(m.valorMensalidade || 0), 0),
      quantidadePendente: grupos.pendentes.length,
      quantidadeAtrasado: grupos.atrasadas.length,
      quantidadePago: grupos.pagas.length
    }
  }
}

export async function listarMensalidades(params = {}) {
  try {
    console.log('[listarMensalidades] Chamando API com params:', params)
    const data = await api.get("/mensalidades", { params })
    console.log('[listarMensalidades] Resposta da API:', data)
    return data
  } catch (error) {
    console.error('[listarMensalidades] Erro:', error)
    throw error
  }
}

export async function pagarMensalidade(id) {
  try {
    console.log('[pagarMensalidade] ID:', id)
    const data = await api.patch(`/mensalidades/pagar/${id}`)
    return data
  } catch (error) {
    console.error('[pagarMensalidade] Erro:', error)
    throw error
  }
}

export async function criarMensalidade(payload) {
  try {
    console.log('[criarMensalidade] Payload:', payload)
    const data = await api.post("/mensalidades", payload)
    return data
  } catch (error) {
    console.error('[criarMensalidade] Erro:', error)
    throw error
  }
}

/**
 * Gera mensalidades para todos os alunos ativos
 */
export async function gerarMensalidadesMesAtual() {
  try {
    console.log('[gerarMensalidadesMesAtual] Gerando mensalidades...')
    // CORRIGIDO: endpoint completo com /api
    const data = await api.post("/api/test/gerar-mensalidades")
    console.log('[gerarMensalidadesMesAtual] Resposta:', data)
    return data
  } catch (error) {
    console.error('[gerarMensalidadesMesAtual] Erro:', error)
    throw error
  }
}

export default mensalidadeService