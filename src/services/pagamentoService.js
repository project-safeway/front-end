import api from "./api";

/**
 * Criar pagamento (POST /pagamentos)
 * body: { dataPagamento, valorPagamento }
 * opcional: idFuncionario como query param
 */
export async function criarPagamento(body, idFuncionario) {
  const config = idFuncionario ? { params: { idFuncionario } } : undefined;
  return await api.post("/pagamentos", body, config);
}

/**
 * Atualizar pagamento (PUT /pagamentos/{id})
 */
export async function atualizarPagamento(id, body, idFuncionario) {
  const config = idFuncionario ? { params: { idFuncionario } } : undefined;
  return await api.put(`/pagamentos/${id}`, body, config);
}

/**
 * Remover pagamento
 */
export async function excluirPagamento(id) {
  return await api.delete(`/pagamentos/${id}`);
}

/**
 * Listar pagamentos (opcionalmente por filtros)
 */
export async function listarPagamentos(params = {}) {
  return await api.get("/pagamentos", { params });
}