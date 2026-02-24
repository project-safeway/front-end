import api from "./api";

/**
 * Lista todos os funcionários
 */
export async function listarFuncionarios() {
  console.log('[funcionarioService] listarFuncionarios')
  const res = await api.get("/funcionario");
  // res é um axios response; retorna o payload (res.data) para consumo no front
  return res.data;
}

/**
 * Criar funcionário (POST /funcionario)
 * payload deve seguir FuncionarioRequest (transporte, endereco, nome, cpf)
 */
export async function criarFuncionario(payload) {
  console.log('[funcionarioService] criarFuncionario', payload)
  const res = await api.post('/funcionario', payload)
  return res.data
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