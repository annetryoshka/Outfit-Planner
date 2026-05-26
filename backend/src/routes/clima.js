const express = require('express')
const router = express.Router()
const climaController = require('../controllers/climaController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

/**
 * @swagger
 * /api/clima/coordenadas/outfit:
 *   get:
 *     summary: Obtener sugerencia de outfit por coordenadas
 *     tags: [Clima]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: string
 *         example: "-16.5000"
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: string
 *         example: "-68.1500"
 *     responses:
 *       200:
 *         description: Sugerencia basada en temperatura
 */
router.get('/coordenadas/outfit', climaController.outfitPorCoordenadas)

/**
 * @swagger
 * /api/clima/outfit-inteligente:
 *   get:
 *     summary: Outfit del día inteligente con prendas del inventario
 *     tags: [Clima]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: string
 *         example: "-16.5000"
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: string
 *         example: "-68.1500"
 *     responses:
 *       200:
 *         description: Outfit personalizado con prendas reales
 */
router.get('/outfit-inteligente', climaController.outfitInteligente)

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
 *     summary: Sugerencia de outfit según el clima de una ciudad
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