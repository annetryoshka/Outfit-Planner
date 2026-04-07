const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const pool = require('./src/config/database')
const authRoutes = require('./src/routes/auth')
const authMiddleware = require('./src/middleware/auth')
const outfitRoutes = require('./src/routes/outfits')
const climaRoutes = require('./src/routes/clima')
const asistenteRoutes = require('./src/routes/asistente')
const { specs, swaggerUi } = require('./src/config/swagger')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

//Middlewares
app.use(cors())
app.use(express.json())

//rutas
app.use('/api/auth', authRoutes)
app.use('/api/outfits', outfitRoutes)
app.use('/api/clima', climaRoutes)
app.use('/api/asistente', asistenteRoutes)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs))

//ruta extra de prueba :vv
app.get('/', (req, res) => {
  res.json({ message: 'Outfit Planner API funcionando uwuwewe' })
})

//ruta protegida de prueba :v
app.get('/api/perfil', authMiddleware, (req, res) => {
  res.json({ message: 'Ruta protegida', usuario: req.usuario })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

module.exports = app