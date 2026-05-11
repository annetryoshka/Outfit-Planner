import api from './api'

const outfitService = {
  async crear(formData) {
    const res = await api.post('/outfits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
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

  async actualizar(id, formData) {
    const res = await api.put(`/outfits/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return res.data
  },

  async eliminar(id) {
    const res = await api.delete(`/outfits/${id}`)
    return res.data
  },

  async agregarPrenda(outfitId, prendaId) {
    const res = await api.post(`/outfits/${outfitId}/prendas`, { prenda_id: prendaId })
    return res.data
  },

  async quitarPrenda(outfitId, prendaId) {
    const res = await api.delete(`/outfits/${outfitId}/prendas`, { 
      data: { prenda_id: prendaId } 
    })
    return res.data
  },

  async probarOutfit(id) {
    const res = await api.post(`/outfits/${id}/probar`)
    return res.data
  }
}

export default outfitService