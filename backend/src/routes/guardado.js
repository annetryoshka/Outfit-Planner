const express = require('express');
const router = express.Router();
const guardadoController = require('../controllers/guardadoController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /api/guardados:
 *   get:
 *     summary: Obtener todas las prendas guardadas del usuario autenticado
 *     tags: [Guardados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de prendas guardadas con datos completos
 */
router.get('/', guardadoController.obtenerMisGuardados);

/**
 * @swagger
 * /api/guardados/{prenda_id}:
 *   post:
 *     summary: Guardar una prenda
 *     tags: [Guardados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prenda_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la prenda a guardar
 *     responses:
 *       201:
 *         description: Prenda guardada exitosamente
 *       400:
 *         description: Error (ej. intentar guardar propia prenda)
 *       404:
 *         description: Prenda no encontrada
 */
router.post('/:prenda_id', guardadoController.guardar);

/**
 * @swagger
 * /api/guardados/{prenda_id}:
 *   delete:
 *     summary: Eliminar una prenda de guardados
 *     tags: [Guardados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prenda_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la prenda a eliminar de guardados
 *     responses:
 *       200:
 *         description: Prenda eliminada de guardados
 *       404:
 *         description: La prenda no estaba guardada
 */
router.delete('/:prenda_id', guardadoController.desguardar);

/**
 * @swagger
 * /api/guardados/{prenda_id}/estado:
 *   get:
 *     summary: Verificar si una prenda está guardada por el usuario
 *     tags: [Guardados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prenda_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la prenda a verificar
 *     responses:
 *       200:
 *         description: Estado de guardado de la prenda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 guardado:
 *                   type: boolean
 */
router.get('/:prenda_id/estado', guardadoController.verificarGuardado);

module.exports = router;
