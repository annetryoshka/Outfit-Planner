import api from './api'

const climaService = {
  async obtenerClima(ciudad) {
    const res = await api.get(`/clima/${ciudad}`)
    return res.data
  },

  async outfitPorClima(ciudad) {
    const res = await api.get(`/clima/${ciudad}/outfit`)
    return res.data
  }
}

export default climaService