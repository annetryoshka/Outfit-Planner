const User = require('../models/User')

const userController = {
  async obtenerPorId(req, res) {
    try {
      const user = await User.findPublicById(req.params.userId)
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
      res.json(user)
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuario', error: error.message })
    }
  }
}

module.exports = userController
