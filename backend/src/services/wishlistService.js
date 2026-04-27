import api from './api'

const wishlistService = {
  async obtenerTodos() {
    const res = await api.get('/wishlist')
    return res.data
  },

  async agregar(datos) {
    const res = await api.post('/wishlist', datos)
    return res.data
  },

  async eliminar(id) {
    const res = await api.delete(`/wishlist/${id}`)
    return res.data
  }
}

export default wishlistService