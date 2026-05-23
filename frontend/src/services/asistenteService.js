import api from './api'

const asistenteService = {
  async chat(mensaje, prendas = []) {
    const res = await api.post('/asistente/chat', { mensaje, prendas })
    return res.data.respuesta 
  }
}

export default asistenteService