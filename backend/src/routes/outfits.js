const express = require('express')
const router = express.Router()
const outfitController = require('../controllers/outfitController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

/**
 * @swagger
 * /api/outfits:
 *   post:
 *     summary: Crear un nuevo outfit
 *     tags: [Outfits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               ocasion:
 *                 type: string
 *               es_publico:
 *                 type: boolean
 *               imagen_url:
 *                 type: string
 *               fecha_calendario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Outfit creado exitosamente
 */
router.post('/', outfitController.crear)

/**
 * @swagger
 * /api/outfits:
 *   get:
 *     summary: Obtener todos mis outfits
 *     tags: [Outfits]
 *     responses:
 *       200:
 *         description: Lista de outfits
 */
router.get('/', outfitController.obtenerMisOutfits)

/**
 * @swagger
 * /api/outfits/fecha/{fecha}:
 *   get:
 *     summary: Obtener outfits por fecha del calendario
 *     tags: [Outfits]
 *     parameters:
 *       - in: path
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-04-07"
 *     responses:
 *       200:
 *         description: Outfits de esa fecha
 */
router.get('/fecha/:fecha', outfitController.obtenerPorFecha)

/**
 * @swagger
 * /api/outfits/{id}:
 *   get:
 *     summary: Obtener outfit por ID
 *     tags: [Outfits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Outfit encontrado
 *       404:
 *         description: Outfit no encontrado
 */
router.get('/:id', outfitController.obtenerPorId)

/**
 * @swagger
 * /api/outfits/{id}:
 *   put:
 *     summary: Actualizar outfit
 *     tags: [Outfits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Outfit actualizado
 */
router.put('/:id', outfitController.actualizar)

/**
 * @swagger
 * /api/outfits/{id}:
 *   delete:
 *     summary: Eliminar outfit
 *     tags: [Outfits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Outfit eliminado
 */
router.delete('/:id', outfitController.eliminar)

/**
 * @swagger
 * /api/outfits/{id}/prendas:
 *   post:
 *     summary: Agregar prenda a outfit
 *     tags: [Outfits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prenda_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prenda agregada
 */
router.post('/:id/prendas', outfitController.agregarPrenda)

/**
 * @swagger
 * /api/outfits/{id}/prendas:
 *   delete:
 *     summary: Quitar prenda de outfit
 *     tags: [Outfits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prenda quitada
 */
router.delete('/:id/prendas', outfitController.quitarPrenda)

/**
 * @swagger
 * /api/outfits/{id}/probar:
 *   post:
 *     summary: Probar outfit
 *     tags: [Outfits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prueba virtual generada
 *       400:
 *         description: Este outfit no tiene prendas asociadas
 *       404:
 *         description: Outfit no encontrado
 *       500:
 *         description: Error al probar el outfit
 */

router.post('/:id/probar', outfitController.probarOutfit)

module.exports = router