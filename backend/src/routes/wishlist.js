const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const wishlistController = require('../controllers/wishlistController')

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware)
/**
 * @swagger
 * /api/wishlist/buscar:
 *  get:
 *      summary: Buscar productos reales en tiendas externas (Shein/AliExpress)
 *      tags: [Wishlist]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: query
 *            name: q
 *            required: true
 *            schema:
 *              type: string
 *            description: Palabra clave (ej. "summer dress")
 *          - in: query
 *            name: tienda
 *            schema:
 *              type: string
 *            enum: [shein, aliexpress]
 *            description: Tienda donde buscar
 *      responses:
 *          200:
 *            description: Lista de productos encontrados
 */
router.get('/buscar', wishlistController.buscarProductos)

router.get('/recomendaciones', wishlistController.getRecomendaciones)

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

router.get('/:id', wishlistController.getById)

/**
 * @swagger
 * /api/wishlist:
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
 *             required: [nombre, url_tienda]
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del item
 *               precio:
 *                 type: number
 *                 description: Precio del item (opcional)
 *               imagen_url:
 *                 type: string
 *                 description: URL de la imagen del item (opcional)
 *               url_tienda:
 *                 type: string
 *                 description: URL de la tienda donde se encuentra el item
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
 * /api/wishlist/extraer-datos:
 *   post:
 *     summary: Extraer datos de un producto desde una tienda externa
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url_tienda]
 *             properties:
 *               url_tienda:
 *                 type: string
 *                 description: URL de la tienda donde se encuentra el item
 *     responses:
 *       200:
 *         description: Datos del producto extraídos con éxito
 *       400:
 *         description: La URL del producto es requerida
 *       422:
 *         description: No se pudieron extraer datos estructurados de este enlace
 *       500:
 *         description: Error interno del servidor al escanear el enlace
 */
router.post('/extraer-datos', wishlistController.autocompletarPorUrl)

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
 *         description: Producto eliminado exitosamente
 *       403:
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

module.exports = router
