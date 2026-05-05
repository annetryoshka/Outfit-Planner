const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authController = {
  async registro(req, res) {
    try {
      const { nombre, apellido, email, password } = req.body

      //verificar si usuario existe o ne
      const usuarioExiste = await User.findByEmail(email)
      if (usuarioExiste) {
        return res.status(400).json({ message: 'El email ya está registrado' })
      }

      //encriptar password
      const salt = await bcrypt.genSalt(10)
      const passwordEncriptada = await bcrypt.hash(password, salt)

      //crear usuario
      const usuario = await User.create({
        nombre,
        apellido,
        email,
        password: passwordEncriptada
      })

      //generar token gaa
      const token = jwt.sign(
        { id: usuario.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      )

      res.status(201).json({ usuario, token })

    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body

      //buscar usuario
      const usuario = await User.findByEmail(email)
      if (!usuario) {
        return res.status(400).json({ message: 'Credenciales incorrectas' })
      }

      //verificar contraseña
      const passwordValida = await bcrypt.compare(password, usuario.password)
      if (!passwordValida) {
        return res.status(400).json({ message: 'Credenciales incorrectas' })
      }

      //generar token
      const token = jwt.sign(
        { id: usuario.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      )

      const { password: _, ...usuarioSinPassword } = usuario
      res.json({ usuario: usuarioSinPassword, token })

    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
  },  

  async actualizarPerfil(req, res) {
    try {
      const { nombre, apellido, foto_perfil, ciudad, bio, es_privado } = req.body
      const usuario = await User.update(req.usuario.id, {
        nombre,
        apellido,
        foto_perfil,
        ciudad,
        bio,
        es_privado
      })
      res.json({ user: usuario })
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar perfil', error: error.message })
    }
  }
}

module.exports = authController