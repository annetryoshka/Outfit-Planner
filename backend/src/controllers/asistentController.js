const { asistente } = require('../services/openaiService')

const asistenteController = {
  async chat(req, res) {
    try {
      const { mensaje, prendas } = req.body

      if (!mensaje) {
        return res.status(400).json({ message: 'El mensaje es requerido' })
      }

      const respuesta = await asistente(mensaje, prendas)
      res.json({ respuesta })

    } catch (error) {
      res.status(500).json({ message: 'Error en el asistente', error: error.message })
    }
  }
}

module.exports = asistenteController