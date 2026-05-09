const Prenda = require('../models/prenda');
const { removeBG } = require('../services/removeBGservice')
const { uploadToStorage, deleteFromStorage } = require('../services/uploadService')

const prendaController = {
  async crear(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Se requiere una imagen de la prenda' });
      }
      
      const { nombre, tipo: tipoRaw, categoria, talla, color, temporada, marca, material, publico, quitar_fondo } = req.body
      const tipo = tipoRaw || categoria || ''
      const debeQuitarFondo = quitar_fondo !== 'false' && quitar_fondo !== false

      const nombreArchivo = `prenda_${req.usuario.id}_${Date.now()}`
      let urlFinal = null

      if (debeQuitarFondo) {
        console.log('Removiendo fondo...')
        const imagenSinFondo = await removeBG(req.file.buffer)
        console.log('Resultado removeBG:', imagenSinFondo ? 'ok' : 'falló o null')
        if (imagenSinFondo) {
          console.log('Subiendo a Supabase Storage (PNG sin fondo)...')
          urlFinal = await uploadToStorage(
            imagenSinFondo,
            nombreArchivo,
            'prendas',
            req.usuario.id,
            'image/png'
          )
        } else {
          console.log('RemoveBG falló, subiendo imagen original...')
          urlFinal = await uploadToStorage(
            req.file.buffer,
            nombreArchivo,
            'prendas',
            req.usuario.id,
            req.file.mimetype
          )
        }
      } else {
        console.log('Omitiendo removeBG (preferencia del usuario), subiendo original...')
        urlFinal = await uploadToStorage(
          req.file.buffer,
          nombreArchivo,
          'prendas',
          req.usuario.id,
          req.file.mimetype
        )
      }
      if (!urlFinal){
        return res.status(500).json({ message: 'Error al subir la imagen' });
      }
      console.log("URL final de la imagen:", urlFinal);
    
      const prenda = await Prenda.create({
        user_id: req.usuario.id,
        nombre,
        tipo,
        categoria: categoria || tipo,
        talla,
        color,
        temporada,
        marca,
        material,
        imagen_url: urlFinal,
        publico: publico === 'true' || publico === true 
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
      const prenda = await Prenda.findById(req.params.id);
      if (!prenda) return res.status(404).json({ message: 'Prenda no encontrada' });

      // Eliminar imagen del bucket si existe
      if (prenda.imagen_url) {
        await deleteFromStorage(prenda.imagen_url, 'prendas');
      }

      // Luego eliminar de la BD
      await Prenda.delete(req.params.id);
      res.json({ message: 'Prenda eliminada' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar prenda', error: error.message })
    }
  }
}
module.exports = prendaController