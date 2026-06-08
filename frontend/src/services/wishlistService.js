import api from './api'

const listaDesdeRespuesta = (res) => {
  const body = res.data
  if (Array.isArray(body)) return body
  if (body?.data && Array.isArray(body.data)) return body.data
  return []
}

const wishlistService = {
  async listar() {
    const res = await api.get('/wishlist')
    return listaDesdeRespuesta(res)
  },

  async obtener(id) {
    const res = await api.get(`/wishlist/${id}`)
    return res.data?.data ?? res.data
  },

  /** @param {string} [q] @param {''|'mujer'|'hombre'} [categoria] */
  async buscarProductos(q = '', categoria = '') {
    const params = {}
    if (q) params.q = q
    if (categoria) params.categoria = categoria
    const res = await api.get('/wishlist/buscar', { params })
    return res.data?.data ?? []
  },

  /** @param {{ nombre: string, url_tienda: string, imagen_url?: string|null, precio?: number|null }} payload */
  async agregar(payload) {
    const res = await api.post('/wishlist', payload)
    return res.data?.data ?? res.data
  },

  async extraerDatosPorUrl(urlTienda) {
    const res = await api.post('/wishlist/extraer-datos', { url_tienda: urlTienda })
    return res.data?.data ?? res.data
  },

  async eliminar(id) {
    await api.delete(`/wishlist/${id}`)
  },

  async moverAlArmario(id) {
    const res = await api.post(`/wishlist/${id}/mover-armario`)
    return res.data
  }
}

export default wishlistService
