const express = require('express');
const router = express.Router();
const prendaController = require('../controllers/prendaController');
const authMiddleware = require('../middleware/auth');
const { route } = require('./outfits');

router.use(authMiddleware);

/**
 * @swagger
 * /api/prendas:
 *   post:
 *     summary: Crear una nueva prenda
 *     tags: [Prendas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               tipo:
 *                 type: string
 *               talla:
 *                 type: string
 *               color:
 *                 type: string
 *               temporada:
 *                 type: string
 *               marca:
 *                 type: string
 *               material:
 *                 type: string
 *               imagen_url:
 *                 type: string
 *               fecha_calendario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prenda creada exitosamente
 */
router.post('/', prendaController.crear)

/**
 * @swagger
 * /api/prendas:
 *   get:
 *     summary: Obtener todas mis prendas
 *     tags: [Prendas]
 *     responses:
 *       200:
 *         description: Lista de prendas
 */
router.get('/', prendaController.obtenerMisPrendas)

/**
 * @swagger
 * /api/prendas/{id}:
 *   get:
 *     summary: Obtener una prenda por su ID
 *     tags: [Prendas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Prenda encontrada
 *       404:
 *         description: Prenda no encontrada
 */
router.get('/:id', prendaController.obtenerPorId)

/**
 * @swagger
 * /api/prendas/{id}:
 *   put:
 *     summary: Actualizar una prenda por su ID
 *     tags: [Prendas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               tipo:
 *                 type: string
 *               talla:
 *                 type: string
 *               color:
 *                 type: string
 *               temporada:
 *                 type: string
 *               marca:
 *                 type: string
 *               material:
 *                 type: string
 *               imagen_url:
 *                 type: string
 *               fecha_calendario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prenda actualizada exitosamente
 *       404:
 *         description: Prenda no encontrada
 */
router.put('/:id', prendaController.actualizar)

/**
 * @swagger
 * /api/prendas/{id}:
 *   delete:
 *     summary: Eliminar una prenda por su ID
 *     tags: [Prendas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Prenda eliminada exitosamente
 *       404:
 *         description: Prenda no encontrada
 */
router.delete('/:id', prendaController.eliminar)

module.exports = router