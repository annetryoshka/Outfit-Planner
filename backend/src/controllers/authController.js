const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { uploadToStorage, deleteFromStorage } = require('../services/uploadService') // Asegúrate de importar deleteFromStorage si se usa abajo

const authController = {
  async registro(req, res) {
    try {
      const { nombre, apellido, email, password } = req.body

      const usuarioExiste = await User.findByEmail(email)
      if (usuarioExiste) {
        return res.status(400).json({ message: 'El email ya está registrado' })
      }

      const salt = await bcrypt.genSalt(10)
      const passwordEncriptada = await bcrypt.hash(password, salt)

      const usuario = await User.create({
        nombre,
        apellido,
        email,
        password: passwordEncriptada
      })

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

      const usuario = await User.findByEmail(email)
      if (!usuario) {
        return res.status(400).json({ message: 'Credenciales incorrectas' })
      }

      const passwordValida = await bcrypt.compare(password, usuario.password)
      if (!passwordValida) {
        return res.status(400).json({ message: 'Credenciales incorrectas' })
      }

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
      const { nombre, apellido, ciudad, bio, es_privado, passwordActual, nuevaPassword } = req.body
      let foto_perfil = req.body.foto_perfil;

      if (!usuarioActual) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      let passwordFinal = usuarioActual.password; 
      if (nuevaPassword) {
        if (!passwordActual) {
          return res.status(400).json({ message: 'Debes proporcionar tu contraseña actual para realizar el cambio' });
        }

        const passwordValida = await bcrypt.compare(passwordActual, usuarioActual.password);
        if (!passwordValida) {
          return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
        }

        if (nuevaPassword.length < 6) {
          return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }

        const salt = await bcrypt.genSalt(10);
        passwordFinal = await bcrypt.hash(nuevaPassword, salt);
      }

      if (req.file) {
        if (usuarioActual.foto_perfil) {
          await deleteFromStorage(usuarioActual.foto_perfil, 'iconprofile');
        }

        console.log("Subiendo foto de perfil...");
        const filename = `perfil_${req.usuario.id}_${Date.now()}`;
        
        foto_perfil = await uploadToStorage(
          req.file.buffer,
          filename,
          'iconprofile',
          req.usuario.id,
          req.file.mimetype  
        );

        if (!foto_perfil) {
          return res.status(500).json({ message: 'Error al subir la foto de perfil' });
        }
      }

      const usuarioActualizado = await User.update(req.usuario.id, {
        nombre,
        apellido,
        foto_perfil,
        ciudad,
        bio,
        es_privado,
        password: passwordFinal 
      })

      const { password: _, ...dataSinPassword } = usuarioActualizado;
      res.json({ user: dataSinPassword })

    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar perfil', error: error.message })
    }
  }
}

module.exports = authController