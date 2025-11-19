import api from "./api";

/**
 * Lista todos os funcionários
 */
export async function listarFuncionarios() {
  const res = await api.get("/funcionario");
  return res.data;
}

/**
 * Obtém funcionário por id
 * @param {number} id
 */
export async function obterFuncionario(id) {
  const res = await api.get(`/funcionario/${id}`);
  return res.data;
}

/**
 * Atualiza funcionário por id
 * @param {number} id
 * @param {object} payload
 */
export async function atualizarFuncionario(id, payload) {
  const res = await api.put(`/funcionario/${id}`, payload);
  return res.data;
}

/**
 * Remove funcionário por id
 * @param {number} id
 */
export async function excluirFuncionario(id) {
  const res = await api.delete(`/funcionario/${id}`);
  return res.data;
}