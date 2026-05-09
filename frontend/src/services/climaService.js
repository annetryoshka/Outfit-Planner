import api from './api'

const climaService = {
  async obtenerClima(ciudad) {
    const res = await api.get(`/clima/${ciudad}`)
    return res.data
  },

  async outfitPorClima(ciudad) {
    const res = await api.get(`/clima/${ciudad}/outfit`)
    return res.data
  },

  async outfitPorCoordenadas(lat, lon) {
    const res = await api.get(`/clima/coordenadas/outfit?lat=${lat}&lon=${lon}`)
    return res.data
  },

  obtenerUbicacion() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Tu navegador no soporta geolocalización'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => reject(new Error('No se pudo obtener tu ubicación'))
      )
    })
  },

  async outfitInteligente(lat, lon) {
  const res = await api.get(`/clima/outfit-inteligente?lat=${lat}&lon=${lon}`)
  return res.data
}
}

export default climaService