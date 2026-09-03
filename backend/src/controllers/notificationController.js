const notificationService = require('../services/notificationService');

const notificationController = {
  // Obtener notificaciones del usuario
  async getNotifications(req, res) {
    try {
      const userId = req.usuario?.id || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const notifications = await notificationService.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
    }
  },

  // Marcar todas las notificaciones como leídas
  async markAsRead(req, res) {
    try {
      const userId = req.usuario?.id || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const result = await notificationService.markAsRead(userId);
      res.json(result);
    } catch (error) {
      console.error('Error al marcar notificaciones como leídas:', error);
      res.status(500).json({ message: 'Error al marcar notificaciones', error: error.message });
    }
  },

  // Obtener conteo de notificaciones no leídas
  async getUnreadCount(req, res) {
    try {
      const userId = req.usuario?.id || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const count = await notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error al obtener conteo de notificaciones:', error);
      res.status(500).json({ message: 'Error al obtener conteo', error: error.message });
    }
  },

  // Obtener cuentas populares
  async getPopularUsers(req, res) {
    try {
      const userId = req.usuario?.id || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const users = await notificationService.getPopularUsers(userId);
      res.json(users);
    } catch (error) {
      console.error('Error al obtener cuentas populares:', error);
      res.status(500).json({ message: 'Error al obtener cuentas populares', error: error.message });
    }
  },

  // Buscar usuarios
  async searchUsers(req, res) {
    try {
      const userId = req.usuario?.id || req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ message: 'Query requerido' });
      }

      const users = await notificationService.searchUsers(query, userId);
      res.json(users);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      res.status(500).json({ message: 'Error al buscar usuarios', error: error.message });
    }
  }
};

module.exports = notificationController;
