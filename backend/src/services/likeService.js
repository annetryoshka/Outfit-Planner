import api from './api'

const likeService = {
  async darLike(prenda_id) {
    const response = await api.post('/likes', { prenda_id })
    return response.data
  },

  async quitarLike(prenda_id) {
    const response = await api.delete(`/likes/${prenda_id}`)
    return response.data
  },

  async obtenerMisLikes() {
    const response = await api.get('/likes/mis-likes')
    return response.data
  },

  async verificarLike(prenda_id) {
    const response = await api.get(`/likes/verificar/${prenda_id}`)
    return response.data
  }
}

export default likeService