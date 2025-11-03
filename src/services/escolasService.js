import api from './api'

const escolasService = {
  async getEscolas(params = {}) {
    const data = await api.get('/escolas', { params })
    return data
  },
}

export default escolasService
