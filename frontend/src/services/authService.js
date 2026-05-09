import api from './api';
const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.usuario) {
          localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/registro', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario'); 
  },

  updateUser: async (userData) => {
    try {
      const response = await api.put('/auth/perfil', userData);
      const updatedUser = response.data.usuario || response.data.user;
      if (updatedUser) {
        localStorage.setItem('usuario', JSON.stringify(updatedUser)); 
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;