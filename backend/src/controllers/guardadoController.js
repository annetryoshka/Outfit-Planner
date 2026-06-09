const Guardado = require('../models/Guardado')
const Prenda = require('../models/Prenda')

const guardadoController = {
  async guardar(req, res) {
    try {
      const { prenda_id } = req.params
      const user_id = req.usuario.id

      const prenda = await Prenda.findById(prenda_id)
      if (!prenda) {
        return res.status(404).json({ message: 'Prenda no encontrada' })
      }

      if (String(prenda.user_id) === String(user_id)) {
        return res.status(400).json({ message: 'No puedes guardar tus propias prendas' })
      }

      const guardado = await Guardado.guardar(user_id, prenda_id)
      
      if (guardado) {
        res.status(201).json({ message: 'Prenda guardada exitosamente', guardado })
      } else {
        res.status(200).json({ message: 'La prenda ya estaba guardada' })
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al guardar prenda', error: error.message })
    }
  },

  async desguardar(req, res) {
    try {
      const { prenda_id } = req.params
      const user_id = req.usuario.id

      const guardado = await Guardado.desguardar(user_id, prenda_id)
      
      if (guardado) {
        res.json({ message: 'Prenda eliminada de guardados' })
      } else {
        res.status(404).json({ message: 'La prenda no estaba guardada' })
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar de guardados', error: error.message })
    }
  },

  async obtenerMisGuardados(req, res) {
    try {
      const user_id = req.usuario.id
      const guardados = await Guardado.obtenerPorUsuario(user_id)
      res.json(guardados)
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener guardados', error: error.message })
    }
  },

  async verificarGuardado(req, res) {
    try {
      const { prenda_id } = req.params
      const user_id = req.usuario.id
      
      const guardado = await Guardado.estaGuardado(user_id, prenda_id)
      res.json({ guardado })
    } catch (error) {
      res.status(500).json({ message: 'Error al verificar guardado', error: error.message })
    }
  }
}

module.exports = guardadoController
