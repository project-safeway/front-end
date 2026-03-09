import api from './apiFinanceiro'

const mensalidadeService = {
  getMensalidadesPendentes: async () => {
    try {
      console.log('[mensalidadeService] getMensalidadesPendentes')
      const response = await api.get('/api/v1/mensalidades/pendentes')
      return response.content || response.data?.content || []
    } catch (error) {
      console.error('Erro ao buscar mensalidades pendentes:', error)
      throw error
    }
  },

  getMensalidadesPagas: async () => {
    try {
      const response = await api.get('/api/v1/mensalidades', { params: { status: 'PAGO' } })
      const data = response.content || response.data?.content || []
      return data
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
    const data = await api.get("/api/v1/mensalidades", { params })
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
    const data = await api.patch(`/api/v1/mensalidades/pagar/${id}`)
    return data
  } catch (error) {
    console.error('[pagarMensalidade] Erro:', error)
    throw error
  }
}

export async function cancelarMensalidade(id) {
  try {
    console.log('[cancelarMensalidade] ID:', id)
    const data = await api.patch(`/api/v1/mensalidades/cancelar/${id}`)
    return data
  } catch (error) {
    console.error('[cancelarMensalidade] Erro:', error)
    throw error
  }
}

export async function criarMensalidade(payload) {
  try {
    console.log('[criarMensalidade] Payload:', payload)
    const data = await api.post("/api/v1/mensalidades/criar", payload)
    return data
  } catch (error) {
    console.error('[criarMensalidade] Erro:', error)
    throw error
  }
}

export async function buscarMensalidadePorId(id) {
  try {
    console.log('[buscarMensalidadePorId] ID:', id)
    const data = await api.get(`/api/v1/mensalidades/${id}`)
    return data
  } catch (error) {
    console.error('[buscarMensalidadePorId] Erro:', error)
    throw error
  }
}

export async function aplicarDesconto(id, valorDesconto) {
  try {
    console.log('[aplicarDesconto] ID:', id, 'Desconto:', valorDesconto)
    const data = await api.patch(`/api/v1/mensalidades/desconto/${id}`, null, { params: { valorDesconto } })
    return data
  } catch (error) {
    console.error('[aplicarDesconto] Erro:', error)
    throw error
  }
}

export default mensalidadeService