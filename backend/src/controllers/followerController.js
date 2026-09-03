const followerService = require('../services/followerService');

const followerController = {
  // Seguir a un usuario
  async follow(req, res) {
    try {
      const followerId = req.usuario?.id || req.user?.id;
      const { followingId } = req.params;

      if (!followerId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      if (followerId === followingId) {
        return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });
      }

      const result = await followerService.follow(followerId, followingId);
      res.json(result);
    } catch (error) {
      console.error('Error al seguir:', error);
      res.status(500).json({ message: 'Error al seguir usuario', error: error.message });
    }
  },

  // Dejar de seguir a un usuario
  async unfollow(req, res) {
    try {
      const followerId = req.usuario?.id || req.user?.id;
      const { followingId } = req.params;

      if (!followerId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const result = await followerService.unfollow(followerId, followingId);
      res.json(result);
    } catch (error) {
      console.error('Error al dejar de seguir:', error);
      res.status(500).json({ message: 'Error al dejar de seguir', error: error.message });
    }
  },

  // Verificar si un usuario sigue a otro
  async checkFollowing(req, res) {
    try {
      const followerId = req.usuario?.id || req.user?.id;
      const { followingId } = req.params;

      if (!followerId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const isFollowing = await followerService.isFollowing(followerId, followingId);
      res.json({ isFollowing });
    } catch (error) {
      console.error('Error al verificar seguimiento:', error);
      res.status(500).json({ message: 'Error al verificar seguimiento', error: error.message });
    }
  },

  // Obtener conteo de seguidores y seguidos
  async getCounts(req, res) {
    try {
      const { userId } = req.params;

      const [followersCount, followingCount] = await Promise.all([
        followerService.getFollowersCount(userId),
        followerService.getFollowingCount(userId)
      ]);

      res.json({ followersCount, followingCount });
    } catch (error) {
      console.error('Error al obtener conteos:', error);
      res.status(500).json({ message: 'Error al obtener conteos', error: error.message });
    }
  },

  // Obtener lista de seguidores
  async getFollowers(req, res) {
    try {
      const { userId } = req.params;
      const followers = await followerService.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error('Error al obtener seguidores:', error);
      res.status(500).json({ message: 'Error al obtener seguidores', error: error.message });
    }
  },

  // Obtener lista de seguidos
  async getFollowing(req, res) {
    try {
      const { userId } = req.params;
      const following = await followerService.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error('Error al obtener seguidos:', error);
      res.status(500).json({ message: 'Error al obtener seguidos', error: error.message });
    }
  }
};

module.exports = followerController;
