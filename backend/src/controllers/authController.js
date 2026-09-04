const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { uploadToStorage, deleteFromStorage } = require('../services/uploadService')
const logger = require('../config/logger')

const authController = {
  async registro(req, res) {
    try {
      const { nombre, apellido, email, password } = req.body

      logger.info('Intento de registro', { email })

      const usuarioExiste = await User.findByEmail(email)
      if (usuarioExiste) {
        logger.warn('Intento de registro con email existente', { email })
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

      logger.info('Registro exitoso', { email, usuarioId: usuario.id })
      res.status(201).json({ usuario, token })

    } catch (error) {
      logger.error('Error en registro', { error: error.message, stack: error.stack })
      res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
  },


  async login(req, res) {
    try {
      const { email, password } = req.body

      logger.info('Intento de login', { email })

      const usuario = await User.findByEmail(email)
      if (!usuario) {
        logger.warn('Login fallido - usuario no encontrado', { email })
        return res.status(400).json({ message: 'Credenciales incorrectas' })
      }

      const passwordValida = await bcrypt.compare(password, usuario.password)
      if (!passwordValida) {
        logger.warn('Login fallido - contraseña incorrecta', { email })
        return res.status(400).json({ message: 'Credenciales incorrectas' })
      }

      const token = jwt.sign(
        { id: usuario.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      )

      const { password: _, ...usuarioSinPassword } = usuario
      logger.info('Login exitoso', { email, usuarioId: usuario.id })
      res.json({ usuario: usuarioSinPassword, token })

    } catch (error) {
      logger.error('Error en login', { error: error.message, stack: error.stack })
      res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
  },

  async actualizarPerfil(req, res) {
    try {
      const { nombre, apellido, ciudad, bio, es_privado, passwordActual, nuevaPassword, fondo, color_panel } = req.body
      let foto_perfil = req.body.foto_perfil;

      const userId = req.usuario?.id || req.user?.id;
      if (!userId) {
        logger.warn('Intento de actualizar perfil sin autorización')
        return res.status(401).json({ message: 'No autorizado, sesión inválida' });
      }

      logger.info('Actualizando perfil', { usuarioId: userId })

      let usuarioActual = await User.findById(userId);
      if (!usuarioActual) {
        logger.error('Usuario no encontrado al actualizar perfil', { usuarioId: userId })
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      if (nuevaPassword && !usuarioActual.password && usuarioActual.email) {
        const usuarioConPass = await User.findByEmail(usuarioActual.email);
        if (usuarioConPass) {
          usuarioActual.password = usuarioConPass.password;
        }
      }

      let passwordFinal = usuarioActual.password; 

      if (nuevaPassword) {
        if (!passwordActual) {
          return res.status(400).json({ message: 'Debes proporcionar tu contraseña actual para realizar el cambio' });
        }

        if (!usuarioActual.password) {
          logger.error('No se pudo recuperar contraseña actual', { usuarioId: userId })
          return res.status(500).json({ message: 'No se pudo recuperar la contraseña actual desde el servidor de datos.' });
        }

        const passwordValida = await bcrypt.compare(passwordActual, usuarioActual.password);
        if (!passwordValida) {
          logger.warn('Cambio de contraseña fallido - contraseña actual incorrecta', { usuarioId: userId })
          return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
        }

        if (nuevaPassword.length < 6) {
          return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }

        const salt = await bcrypt.genSalt(10);
        passwordFinal = await bcrypt.hash(nuevaPassword, salt);
        logger.info('Contraseña actualizada', { usuarioId: userId })
      }

      if (req.file) {
        if (usuarioActual.foto_perfil) {
          await deleteFromStorage(usuarioActual.foto_perfil, 'iconprofile');
        }

        logger.info('Subiendo foto de perfil', { usuarioId: userId, filename: req.file.originalname })
        const filename = `perfil_${userId}_${Date.now()}`;
        
        foto_perfil = await uploadToStorage(
          req.file.buffer,
          filename,
          'iconprofile',
          userId,
          req.file.mimetype  
        );

        if (!foto_perfil) {
          logger.error('Error al subir foto de perfil', { usuarioId: userId })
          return res.status(500).json({ message: 'Error al subir la foto de perfil' });
        }

        logger.info('Foto de perfil subida exitosamente', { usuarioId: userId })
      }

      const usuarioActualizado = await User.update(userId, {
        nombre,
        apellido,
        foto_perfil,
        ciudad,
        bio,
        es_privado,
        fondo,
        color_panel,
        password: passwordFinal 
      })

      if (!usuarioActualizado) {
        logger.error('No se pudo recuperar usuario actualizado', { usuarioId: userId })
        return res.status(500).json({ message: 'No se pudo recuperar el usuario actualizado' });
      }

      const { password: _, ...dataSinPassword } = usuarioActualizado;
      logger.info('Perfil actualizado exitosamente', { usuarioId: userId })
      res.json({ user: dataSinPassword })

    } catch (error) {
      logger.error('Error en actualizarPerfil', { error: error.message, stack: error.stack })
      res.status(500).json({ message: 'Error al actualizar perfil', error: error.message })
    }
  }
}

module.exports = authController