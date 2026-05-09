import api from './api'

const prendaService = {
  async obtenerTodas() {
    const res = await api.get('/prendas')
    return res.data
  },
  async obtenerPorId(id) {
    const res = await api.get(`/prendas/${id}`)
    return res.data
  }
}

export default prendaService