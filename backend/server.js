const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

const pool = require('./src/config/database')
const authRoutes = require('./src/routes/auth')
const authMiddleware = require('./src/middleware/auth')
const outfitRoutes = require('./src/routes/outfits')
const climaRoutes = require('./src/routes/clima')
const asistenteRoutes = require('./src/routes/asistente')
const prendaRoutes = require('./src/routes/prenda')
const { generalLimiter, authLimiter, aiLimiter } = require('./src/middleware/rateLimiter')
const wishlistRoutes = require('./src/routes/wishlist')
const tryonRoutes = require('./src/routes/tryon')
const guardadoRoutes = require('./src/routes/guardado')
const likeRoutes = require('./src/routes/like')
const followerRoutes = require('./src/routes/follower')
const notificationRoutes = require('./src/routes/notification')
const { specs, swaggerUi } = require('./src/config/swagger')
const passport = require('passport')
const logger = require('./src/config/logger')

const app = express()
const PORT = process.env.PORT || 3000
app.set('trust proxy', 1)

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://outfit-planner-1-fu4w.onrender.com'
  ],
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

require('./src/config/passport')
app.use(passport.initialize())

app.use(generalLimiter)

//rutas
app.use('/api/auth', authRoutes)
app.use('/api/prendas', prendaRoutes)
app.use('/api/outfits', outfitRoutes)
app.use('/api/clima', climaRoutes)
app.use('/api/asistente', asistenteRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/tryon', tryonRoutes)
app.use('/api/guardados', guardadoRoutes)
app.use('/api/likes', likeRoutes)
app.use('/api/followers', followerRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs))

//ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'Outfit Planner API funcionando uwuwewe' })
})

app.get('/api/perfil', authMiddleware, (req, res) => {
  res.json({ message: 'Ruta protegida', usuario: req.usuario })
})

//global de errores
app.use((err, req, res, next) => {
  logger.error('Error en servidor:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  })
  res.status(500).json({
    success: false,
    message: 'Hubo un problema interno en el servidor.'
  })
})

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`)
})