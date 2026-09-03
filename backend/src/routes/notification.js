const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// Obtener notificaciones del usuario
router.get('/', notificationController.getNotifications);

// Marcar todas las notificaciones como leídas
router.patch('/marcar-leidas', notificationController.markAsRead);

// Obtener conteo de notificaciones no leídas
router.get('/unread-count', notificationController.getUnreadCount);

// Obtener cuentas populares
router.get('/popular', notificationController.getPopularUsers);

// Buscar usuarios
router.get('/search', notificationController.searchUsers);

module.exports = router;
