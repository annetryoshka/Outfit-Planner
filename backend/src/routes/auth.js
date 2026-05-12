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

const passport = require('passport')
const jwt = require('jsonwebtoken')
require('../config/passport')

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Iniciar sesión con Google
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirige a Google
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback de Google OAuth
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirige al frontend con token
 */
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login', session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )
    res.redirect(`http://localhost:5173/?token=${token}&usuario=${encodeURIComponent(JSON.stringify(req.user))}`)
  }
);

module.exports = router