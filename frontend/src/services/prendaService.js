import api from './api'

const prendaService = {
  async obtenerTodas() {
    const res = await api.get('/prendas')
    return res.data
  },
  async obtenerPorId(id) {
    const res = await api.get(`/prendas/${id}`)
    return res.data
  },
  /** @param {FormData} formData — campo archivo: `imagen`, resto como en POST /api/prendas */
  async crear(formData) {
    const res = await api.post('/prendas', formData)
    return res.data
  }
}

export default prendaService