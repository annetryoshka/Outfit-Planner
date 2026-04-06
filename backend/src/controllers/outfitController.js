const Outfit = require('../models/Outfit')

const outfitController = {
  async crear(req, res) {
    try {
      const { nombre, ocasion, es_publico, imagen_url, fecha_calendario } = req.body
      const outfit = await Outfit.create({
        user_id: req.usuario.id,
        nombre,
        ocasion,
        es_publico,
        imagen_url,
        fecha_calendario
      })
      res.status(201).json(outfit)
    } catch (error) {
      res.status(500).json({ message: 'Error al crear outfit', error: error.message })
    }
  },

  async obtenerMisOutfits(req, res) {
    try {
      const outfits = await Outfit.findByUser(req.usuario.id)
      res.json(outfits)
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener outfits', error: error.message })
    }
  },

  async obtenerPorId(req, res) {
    try {
      const outfit = await Outfit.findById(req.params.id)
      if (!outfit) return res.status(404).json({ message: 'Outfit no encontrado unu' })
      res.json(outfit)
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener outfit', error: error.message })
    }
  },

  async obtenerPorFecha(req, res) {
    try {
      const outfits = await Outfit.findByFecha(req.usuario.id, req.params.fecha)
      res.json(outfits)
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener outfits', error: error.message })
    }
  },

  async actualizar(req, res) {
    try {
      const outfit = await Outfit.update(req.params.id, req.body)
      if (!outfit) return res.status(404).json({ message: 'Outfit no encontrado' })
      res.json(outfit)
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar outfit', error: error.message })
    }
  },

  async eliminar(req, res) {
    try {
      await Outfit.delete(req.params.id)
      res.json({ message: 'Outfit eliminado' })
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar outfit', error: error.message })
    }
  },

  async agregarPrenda(req, res) {
    try {
      await Outfit.addPrenda(req.params.id, req.body.prenda_id)
      res.json({ message: 'Prenda agregada al outfit' })
    } catch (error) {
      res.status(500).json({ message: 'Error al agregar prenda', error: error.message })
    }
  },

  async quitarPrenda(req, res) {
    try {
      await Outfit.removePrenda(req.params.id, req.body.prenda_id)
      res.json({ message: 'Prenda quitada del outfit' })
    } catch (error) {
      res.status(500).json({ message: 'Error al quitar prenda', error: error.message })
    }
  }
}

module.exports = outfitController