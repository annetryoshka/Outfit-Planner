const express = require('express');
const router = express.Router();
const followerController = require('../controllers/followerController');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// Seguir a un usuario
router.post('/follow/:followingId', followerController.follow);

// Dejar de seguir a un usuario
router.delete('/unfollow/:followingId', followerController.unfollow);

// Verificar si un usuario sigue a otro
router.get('/check/:followingId', followerController.checkFollowing);

// Aceptar solicitud de seguimiento
router.patch('/solicitudes/:solicitudId/aceptar', followerController.acceptRequest);

// Rechazar solicitud de seguimiento
router.patch('/solicitudes/:solicitudId/rechazar', followerController.rejectRequest);

// Obtener conteo de seguidores y seguidos
router.get('/counts/:userId', followerController.getCounts);

// Obtener lista de seguidores
router.get('/followers/:userId', followerController.getFollowers);

// Obtener lista de seguidos
router.get('/following/:userId', followerController.getFollowing);

module.exports = router;
