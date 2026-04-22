import api from './api'

const outfitService = {
  async crear(datos) {
    const res = await api.post('/outfits', datos)
    return res.data
  },

  async obtenerTodos() {
    const res = await api.get('/outfits')
    return res.data
  },

  async obtenerPorId(id) {
    const res = await api.get(`/outfits/${id}`)
    return res.data
  },

  async obtenerPorFecha(fecha) {
    const res = await api.get(`/outfits/fecha/${fecha}`)
    return res.data
  },

  async actualizar(id, datos) {
    const res = await api.put(`/outfits/${id}`, datos)
    return res.data
  },

  async eliminar(id) {
    const res = await api.delete(`/outfits/${id}`)
    return res.data
  }
}

export default outfitService