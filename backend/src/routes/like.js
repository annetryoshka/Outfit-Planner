const express = require('express')
const router = express.Router()
const likeController = require('../controllers/likeController')
const auth = require('../middleware/auth')

// Todas las rutas requieren autenticación
router.post('/', auth, likeController.darLike)
router.delete('/:prenda_id', auth, likeController.quitarLike)
router.get('/mis-likes', auth, likeController.obtenerMisLikes)
router.get('/verificar/:prenda_id', auth, likeController.verificarLike)

module.exports = router