const Prenda = require('../models/prenda');
const { removeBG } = require('../services/removeBGservice')
const { uploadImage } = require('../services/uploadService')

const prendaController = {
  async crear(req, res) {
    try {
      const { nombre, tipo, talla, color, temporada, marca, material, imagen_url } = req.body
      console.log("Removiendo fondo...");
      const imagenSinFondo = await removeBG(imagen_url)
      let urlFinal = imagen_url
      if (imagenSinFondo) {
        console.log("Subiendo a Supabase Storage...");
        const nombreArchivo = `prenda_${req.usuario.id}_${Date.now()}`;
        urlFinal = await uploadImage(imagenSinFondo, nombreArchivo);
        console.log("URL final de la imagen:", urlFinal);   
      }
    
      const prenda = await Prenda.create({
        user_id: req.usuario.id,
        nombre,
        tipo,
        talla,
        color,
        temporada,
        marca,
        material,
        imagen_url: urlFinal
      })
      res.status(201).json(prenda)
    } catch (error) {
      res.status(400).json({ message: 'Error creando prenda', error: error.message })
    }
  },
  async obtenerMisPrendas(req, res) {
    try {
      const prendas = await Prenda.findByUser(req.usuario.id)
      res.json(prendas)
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener prendas', error: error.message })
    }
  },
  async obtenerPorId(req, res) {
    try {
      const prenda = await Prenda.findById(req.params.id)
      if (!prenda) return res.status(404).json({ message: 'Prenda no encontrada' })
      res.json(prenda)
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener prenda', error: error.message })
    }
  },
  async actualizar(req, res) {
    try {
      const prenda = await Prenda.update(req.params.id, req.body)
      if (!prenda) return res.status(404).json({ message: 'Prenda no encontrada' })
      res.json(prenda)
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar prenda', error: error.message })
    }
  },
  async eliminar(req, res) {
    try {
      await Prenda.delete(req.params.id)
      res.json({ message: 'Prenda eliminada' })
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar prenda', error: error.message })
    }
  }
}
module.exports = prendaController