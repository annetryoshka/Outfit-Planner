const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const pool = require('./src/config/database')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

//Middlewares
app.use(cors())
app.use(express.json())

//Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Outfit Planner API funcionando uwuwewe' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

module.exports = app