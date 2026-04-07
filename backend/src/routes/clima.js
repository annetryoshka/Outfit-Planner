const express = require('express')
const router = express.Router()
const climaController = require('../controllers/climaController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

/**
 * @swagger
 * /api/clima/{ciudad}:
 *   get:
 *     summary: Obtener clima de una ciudad
 *     tags: [Clima]
 *     parameters:
 *       - in: path
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *         example: "La Paz"
 *     responses:
 *       200:
 *         description: Datos del clima
 *       500:
 *         description: Ciudad no encontrada
 */
router.get('/:ciudad', climaController.obtenerClima)

/**
 * @swagger
 * /api/clima/{ciudad}/outfit:
 *   get:
 *     summary: Obtener sugerencia de outfit según el clima
 *     tags: [Clima]
 *     parameters:
 *       - in: path
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *         example: "La Paz"
 *     responses:
 *       200:
 *         description: Sugerencia de outfit según temperatura
 *       500:
 *         description: Ciudad no encontrada
 */
router.get('/:ciudad/outfit', climaController.outfitPorClima)

module.exports = router