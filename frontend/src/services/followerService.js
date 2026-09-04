import api from './api';

const followerService = {
  // Seguir a un usuario
  follow: async (followingId) => {
    const response = await api.post(`/followers/follow/${followingId}`);
    return response.data;
  },

  // Dejar de seguir a un usuario
  unfollow: async (followingId) => {
    const response = await api.delete(`/followers/unfollow/${followingId}`);
    return response.data;
  },

  // Verificar si el usuario actual sigue a otro usuario
  async checkFollowing(userId) {
    const response = await api.get(`/followers/check/${userId}`);
    return response.data.followState; // 'ninguno' | 'pendiente' | 'aceptado'
  },

  // Obtener conteo de seguidores y seguidos
  getCounts: async (userId) => {
    const response = await api.get(`/followers/counts/${userId}`);
    return response.data;
  },

  // Obtener lista de seguidores
  getFollowers: async (userId) => {
    const response = await api.get(`/followers/followers/${userId}`);
    return response.data;
  },

  // Obtener lista de seguidos
  getFollowing: async (userId) => {
    const response = await api.get(`/followers/following/${userId}`);
    return response.data;
  },

  // Aceptar solicitud de seguimiento
  acceptRequest: async (solicitudId) => {
    const response = await api.patch(`/followers/solicitudes/${solicitudId}/aceptar`);
    return response.data;
  },

  // Rechazar solicitud de seguimiento
  rejectRequest: async (solicitudId) => {
    const response = await api.patch(`/followers/solicitudes/${solicitudId}/rechazar`);
    return response.data;
  }
};

export default followerService;
