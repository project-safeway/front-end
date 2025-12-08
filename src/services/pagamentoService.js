import api from "./api";

/**
 * Criar pagamento (POST /pagamentos)
 * body: { dataPagamento, valorPagamento, descricao }
 */
export async function criarPagamento(body) {
  // body deve conter: dataPagamento, valorPagamento, descricao
  console.log('[pagamentoService] criarPagamento', body);
  return await api.post("/pagamentos", body);
}

/**
 * Atualizar pagamento (PUT /pagamentos/{id})
 * body: { dataPagamento, valorPagamento, descricao }
 */
export async function atualizarPagamento(id, body) {
  // body deve conter: dataPagamento, valorPagamento, descricao
  console.log('[pagamentoService] atualizarPagamento', { id, body });
  return await api.put(`/pagamentos/${id}`, body);
}

/**
 * Remover pagamento
 */
export async function excluirPagamento(id) {
  console.log('[pagamentoService] excluirPagamento', { id });
  return await api.delete(`/pagamentos/${id}`);
}

/**
 * Listar pagamentos (opcionalmente por filtros)
 */
export async function listarPagamentos(params = {}) {
  console.log('[pagamentoService] listarPagamentos', params);
  return await api.get("/pagamentos", { params });
}