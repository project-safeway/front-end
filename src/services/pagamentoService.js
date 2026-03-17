import api from "./apiFinanceiro";

/**
 * Criar pagamento (POST /pagamentos)
 * body: { dataPagamento, valorPagamento, descricao }
 */
export async function criarPagamento(body) {
  // body deve conter: dataPagamento, valorPagamento, descricao
  console.log('[pagamentoService] criarPagamento', body);
  return await api.post("/api/v1/pagamentos/registrar", body);
}

/**
 * Atualizar pagamento (PUT /pagamentos/{id})
 * body: { dataPagamento, valorPagamento, descricao }
 */
export async function atualizarPagamento(id, body) {
  // body deve conter: dataPagamento, valorPagamento, descricao
  console.log('[pagamentoService] atualizarPagamento', { id, body });
  return await api.patch(`/api/v1/pagamentos/${id}`, body);
}

/**
 * Remover pagamento
 */
export async function excluirPagamento(id) {
  console.log('[pagamentoService] excluirPagamento', { id });
  return await api.delete(`/api/v1/pagamentos/${id}`);
}

/**
 * Listar pagamentos (opcionalmente por filtros)
 */
export async function listarPagamentos(params = {}) {
  console.log('[pagamentoService] listarPagamentos', params);
  return await api.get("/api/v1/pagamentos", { params });
}

/**
 * Buscar pagamento por ID (GET /api/v1/pagamentos/{id})
 */
export async function buscarPagamentoPorId(id) {
  console.log('[pagamentoService] buscarPagamentoPorId', id);
  return await api.get(`/api/v1/pagamentos/${id}`);
}