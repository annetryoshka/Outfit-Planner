import api from './api';

const notificationService = {
  // Obtener notificaciones del usuario
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Marcar todas las notificaciones como leídas
  markAsRead: async () => {
    const response = await api.patch('/notifications/marcar-leidas');
    return response.data;
  },

  // Obtener conteo de notificaciones no leídas
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  // Obtener cuentas populares
  getPopularUsers: async () => {
    const response = await api.get('/notifications/popular');
    return response.data;
  },

  // Buscar usuarios
  searchUsers: async (query) => {
    const response = await api.get('/notifications/search', { params: { query } });
    return response.data;
  }
};

export default notificationService;
