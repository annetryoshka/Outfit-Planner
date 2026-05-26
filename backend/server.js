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
const wishlistRoutes = require('./src/routes/wishlist')
const guardadoRoutes = require('./src/routes/guardado')
const likeRoutes = require('./src/routes/like')  // ← NUEVA LÍNEA
const { specs, swaggerUi } = require('./src/config/swagger')
const passport = require('passport')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json())
require('./src/config/passport')
app.use(passport.initialize())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/prendas', prendaRoutes)
app.use('/api/outfits', outfitRoutes)
app.use('/api/clima', climaRoutes)
app.use('/api/asistente', asistenteRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/guardados', guardadoRoutes)
app.use('/api/likes', likeRoutes)  // ← NUEVA LÍNEA
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs))

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'Outfit Planner API funcionando uwuwewe' })
})

// Ruta protegida de prueba
app.get('/api/perfil', authMiddleware, (req, res) => {
  res.json({ message: 'Ruta protegida', usuario: req.usuario })
})

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error("Error detectado en el servidor:", err.stack);
  res.status(500).json({
    success: false,
    message: 'Hubo un problema interno en el servidor.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

module.exports = app