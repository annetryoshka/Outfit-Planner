const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authMiddleware = require('../middleware/auth')
const upload = require('../middleware/multer')

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password]
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: El email ya está registrado
 */
router.post('/registro', authController.registro)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve token
 *       400:
 *         description: Credenciales incorrectas
 */
router.post('/login', authController.login)

/**
 * @swagger
 * /api/auth/perfil:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               foto_perfil:
 *                 type: string
 *                 format: binary
 *               ciudad:
 *                 type: string
 *               bio:
 *                 type: string
 *               es_privado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.put(
  '/perfil',
  authMiddleware,
  (req, res, next) => {
    upload.single('foto_perfil')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  authController.actualizarPerfil
);

module.exports = router