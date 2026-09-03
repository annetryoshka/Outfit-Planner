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

  // Verificar si un usuario sigue a otro
  checkFollowing: async (followingId) => {
    const response = await api.get(`/followers/check/${followingId}`);
    return response.data.isFollowing;
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
  }
};

export default followerService;
