const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'No hay token, acceso denegado' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const usuario = await User.findById(decoded.id)

    if (!usuario) {
      return res.status(401).json({ message: 'Token inválido' })
    }

    req.usuario = usuario
    next()

  } 
    catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

module.exports = authMiddleware