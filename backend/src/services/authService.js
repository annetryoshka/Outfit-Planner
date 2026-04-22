import api from './api'

const authService = {
  async registro(datos) {
    const res = await api.post('/auth/registro', datos)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
    return res.data
  },

  async login(datos) {
    const res = await api.post('/auth/login', datos)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
    return res.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  },

  getUsuario() {
    return JSON.parse(localStorage.getItem('usuario'))
  },

  isLoggedIn() {
    return !!localStorage.getItem('token')
  }
}

export default authService