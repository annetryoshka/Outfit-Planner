const express = require('express')
const router = express.Router()
const outfitController = require('../controllers/outfitController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

router.post('/', outfitController.crear)
router.get('/', outfitController.obtenerMisOutfits)
router.get('/fecha/:fecha', outfitController.obtenerPorFecha)
router.get('/:id', outfitController.obtenerPorId)
router.put('/:id', outfitController.actualizar)
router.delete('/:id', outfitController.eliminar)
router.post('/:id/prendas', outfitController.agregarPrenda)
router.delete('/:id/prendas', outfitController.quitarPrenda)

module.exports = router