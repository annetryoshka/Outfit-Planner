const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const wishlistController = require('../controllers/wishlistController')

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware)

/**
 * @swagger
 * /api/wishlist/:
 *   get:
 *     summary: Obtener todos los items de la lista de deseos del usuario autenticado con filtros opcionales
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo_item
 *         schema:
 *           type: string
 *           enum: [prenda, outfit]
 *         description: Filtrar por tipo de item
 *       - in: query
 *         name: temporada
 *         schema:
 *           type: string
 *           enum: [primavera, verano, otoño, invierno]
 *         description: Filtrar por temporada
 *     responses:
 *       200:
 *         description: Lista de deseos obtenida exitosamente con filtros aplicados
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error en el servidor
 */
router.get('/', wishlistController.getWishlist)

/**
 * @swagger
 * /api/wishlist/:
 *   post:
 *     summary: Agregar un item a la lista de deseos
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [item_id, tipo_item, nombre_item]
 *             properties:
 *               item_id:
 *                 type: string
 *                 description: ID del item (prenda u outfit)
 *               tipo_item:
 *                 type: string
 *                 enum: [prenda, outfit]
 *                 description: Tipo de item (prenda, outfit)
 *               nombre_item:
 *                 type: string
 *                 description: Nombre descriptivo del item
 *               imagen_url:
 *                 type: string
 *                 description: URL de la imagen del item (opcional)
 *               temporada:
 *                 type: string
 *                 enum: [primavera, verano, otoño, invierno]
 *                 description: Temporada recomendada para el item (opcional)
 *     responses:
 *       201:
 *         description: Item agregado exitosamente
 *       400:
 *         description: Faltan campos requeridos o item ya existe
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error en el servidor
 */
router.post('/', wishlistController.addToWishlist)

/**
 * @swagger
 * /api/wishlist/{id}:
 *   delete:
 *     summary: Eliminar un item de la lista de deseos por ID
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del item a eliminar
 *     responses:
 *       200:
 *         description: Item eliminado exitosamente
 *       401:
 *         description: No autorizado o no tienes permiso
 *       404:
 *         description: Item no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.delete('/:id', wishlistController.removeFromWishlist)

/**
 * @swagger
 * /api/wishlist/{id}/mover-armario:
 *   post:
 *     summary: Mover un item de la wishlist al armario del usuario
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del item a mover
 *     responses:
 *       200:
 *         description: Item movido al armario exitosamente
 *       401:
 *         description: No autorizado o no tienes permiso
 *       404:
 *         description: Item no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.post('/:id/mover-armario', wishlistController.moverAlArmario)

/**
 * @swagger
 * /api/wishlist/recomendaciones:
 *   get:
 *     summary: Obtener recomendaciones de items de la wishlist basadas en clima/IA
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recomendaciones generadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 total_items_wishlist:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       nombre_item:
 *                         type: string
 *                       razon_recomendacion:
 *                         type: string
 *                       prioridad:
 *                         type: string
 *                         enum: [alta, media, baja]
 *                       nota:
 *                         type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error en el servidor
 */
router.get('/recomendaciones', wishlistController.getRecomendaciones)

module.exports = router
