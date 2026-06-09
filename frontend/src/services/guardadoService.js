import api from './api'

const guardadoService = {
  // Guardar una prenda ajena en mi perfil
  async guardar(prendaId) {
    const res = await api.post(`/guardados/${prendaId}`)
    return res.data
  },

  // Quitar una prenda de mis guardados
  async desguardar(prendaId) {
    const res = await api.delete(`/guardados/${prendaId}`)
    return res.data
  },

  // Obtener todas mis prendas guardadas (devuelve array de prendas completas)
  async obtenerMisGuardados() {
    const res = await api.get('/guardados')
    return res.data
  },

  // Verificar si una prenda específica ya está guardada → { guardado: boolean }
  async verificarEstado(prendaId) {
    const res = await api.get(`/guardados/${prendaId}/estado`)
    return res.data
  },
}

export default guardadoService
