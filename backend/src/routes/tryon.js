const express = require('express');
const router = express.Router();
const tryonController = require('../controllers/tryonController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/multer');

router.use(authMiddleware);

/**
 * @swagger
 * /api/tryon/:
 *   post:
 *     summary: Crear una nueva prueba de try-on
 *     tags: [Try-On]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               prenda_id:
 *                 type: string
 *               person:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prueba de try-on procesada exitosamente
 *       400:
 *         description: Error en los datos enviados (falta prenda_id o imagen)
 *       404:
 *         description: La prenda especificada no existe
 *       500:
 *         description: Error al procesar la prueba de try-on
 */
router.post(
    '/',
    (req, res, next) => {
        upload.single('person')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    tryonController.crearPrueba
);

/**
 * @swagger
 * /api/tryon/:
 *   get:
 *     summary: Obtener el historial de pruebas de try-on del usuario
 *     tags: [Try-On]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de pruebas obtenido exitosamente
 *       500:
 *         description: Error al obtener el historial de pruebas
 */
router.get('/', tryonController.obtenerMisPruebas);

/**
 * @swagger
 * /api/tryon/{id}:
 *   get:
 *     summary: Obtener una prueba de try-on por su ID
 *     tags: [Try-On]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la prueba de try-on
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prueba de try-on obtenida exitosamente
 *       404:
 *         description: Prueba no encontrada
 *       500:
 *         description: Error al obtener la prueba
 */
router.get('/:id', tryonController.obtenerPorId);

/**
 * @swagger
 * /api/tryon/{id}:
 *   delete:
 *     summary: Eliminar una prueba de try-on
 *     tags: [Try-On]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la prueba de try-on
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prueba de try-on eliminada exitosamente
 *       404:
 *         description: Prueba no encontrada
 *       500:
 *         description: Error al eliminar la prueba de try-on
 */
router.delete('/:id', tryonController.eliminar);

module.exports = router;