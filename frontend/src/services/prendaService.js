import api from './api'

const prendaService = {
  // Feed global tipo Pinterest: prendas públicas de TODOS los usuarios
  // Usa endpoint sin auth — no requiere token
  async obtenerPublicas() {
    const res = await api.get('/prendas/publicas')
    return res.data
  },

  // Prendas del usuario logueado (públicas + privadas)
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
  },

  async actualizar(id, formData) {
    const res = await api.put(`/prendas/${id}`, formData)
    return res.data
  },

  async eliminar(id) {
    const res = await api.delete(`/prendas/${id}`)
    return res.data
  },

  /** @param {FormData} formData — solo campo `imagen`. Devuelve Blob PNG. */
  async quitarFondoPreview(formData) {
    const res = await api.post('/prendas/quitar-fondo-preview', formData, {
      responseType: 'blob',
      validateStatus: () => true
    })
    const ct = (res.headers['content-type'] || '').toLowerCase()
    if (res.status === 200 && (ct.includes('image/png') || ct.includes('octet-stream'))) {
      return res.data
    }
    let msg = 'No se pudo quitar el fondo.'
    if (res.data instanceof Blob) {
      try {
        const t = await res.data.text()
        const j = JSON.parse(t)
        if (j.message) msg = j.message
      } catch (_) { /* respuesta no JSON */ }
    }
    throw new Error(msg)
  }
  
}

export default prendaService