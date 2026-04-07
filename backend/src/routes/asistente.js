const express = require('express')
const router = express.Router()
const asistenteController = require('../controllers/asistentController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

/**
 * @swagger
 * /api/asistente/chat:
 *   post:
 *     summary: Chatear con el asistente de moda IA
 *     tags: [Asistente]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mensaje]
 *             properties:
 *               mensaje:
 *                 type: string
 *                 example: "quiero algo casual para el frío"
 *               prendas:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Respuesta del asistente
 *       400:
 *         description: Mensaje requerido
 */
router.post('/chat', asistenteController.chat)

module.exports = router