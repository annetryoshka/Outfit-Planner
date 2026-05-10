const Outfit = require('../models/Outfit')
const { tryOnOutfit } = require('../services/tryonService')
const { uploadToStorage, deleteFromStorage } = require('../services/uploadService')

const outfitController = {
  async crear(req, res) {
  try {
    const { nombre, ocasion, es_publico, fecha_calendario, canvas_data, prenda_ids } = req.body

    let imagen_url = null

    if (req.file) {
      const nombreArchivo = `outfit_${req.usuario.id}_${Date.now()}`
      imagen_url = await uploadToStorage(
        req.file.buffer,
        nombreArchivo,
        'outfits',
        req.usuario.id,
        req.file.mimetype
      )
      if (!imagen_url) {
        return res.status(500).json({ message: 'Error al subir imagen del outfit' })
      }
    }

    let canvasDataParsed = null
    if (canvas_data) {
      try {
        canvasDataParsed = typeof canvas_data === 'string'
          ? JSON.parse(canvas_data)
          : canvas_data
      } catch {
        return res.status(400).json({ message: 'canvas_data no es JSON válido' })
      }
    }

    const outfit = await Outfit.create({
      user_id: req.usuario.id,
      nombre,
      ocasion,
      es_publico: es_publico === 'true' || es_publico === true,
      imagen_url,
      fecha_calendario: fecha_calendario || null,
      canvas_data: canvasDataParsed
    })

    // Relacionar prendas si vienen
    let ids = []
    if (prenda_ids) {
      try {
        ids = typeof prenda_ids === 'string'
          ? JSON.parse(prenda_ids)
          : prenda_ids
      } catch {
        ids = Array.isArray(prenda_ids) ? prenda_ids : [prenda_ids]
      }
    }

    for (const prenda_id of ids) {
      await Outfit.addPrenda(outfit.id, prenda_id)
    }

    const outfitCompleto = await Outfit.findById(outfit.id)
    res.status(201).json(outfitCompleto)

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
      const { nombre, ocasion, es_publico, fecha_calendario, canvas_data, prenda_ids } = req.body

      const outfitActual = await Outfit.findById(req.params.id)
      if (!outfitActual) {
        return res.status(404).json({ message: 'Outfit no encontrado' })
      }

      let imagen_url = outfitActual.imagen_url // mantener la actual por defecto

      // Si viene nueva imagen del lienzo
      if (req.file) {
        // Borrar imagen anterior del bucket
        if (outfitActual.imagen_url) {
          await deleteFromStorage(outfitActual.imagen_url, 'outfits')
        }

        const nombreArchivo = `outfit_${req.usuario.id}_${Date.now()}`
        imagen_url = await uploadToStorage(
          req.file.buffer,
          nombreArchivo,
          'outfits',
          req.usuario.id,
          req.file.mimetype
        )
      }

      let canvasDataParsed = outfitActual.canvas_data // mantener el actual por defecto
      if (canvas_data) {
        try {
          canvasDataParsed = typeof canvas_data === 'string'
            ? JSON.parse(canvas_data)
            : canvas_data
        } catch {
          return res.status(400).json({ message: 'canvas_data no es JSON válido' })
        }
      }

      const outfit = await Outfit.update(req.params.id, {
        nombre,
        ocasion,
        es_publico: es_publico === 'true' || es_publico === true,
        imagen_url,
        fecha_calendario,
        canvas_data: canvasDataParsed
      })

      // Si vienen nuevas prendas, reemplazar todas de una vez
      if (prenda_ids) {
        let ids = []
        try {
          ids = typeof prenda_ids === 'string'
            ? JSON.parse(prenda_ids)
            : prenda_ids
        } catch {
          ids = Array.isArray(prenda_ids) ? prenda_ids : [prenda_ids]
        }
        await Outfit.replacePrendas(req.params.id, ids)
      }

      const outfitCompleto = await Outfit.findById(req.params.id)
      res.json(outfitCompleto)

    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar outfit', error: error.message })
    }
  },

  async eliminar(req, res) {
    try {
      const outfit = await Outfit.findById(req.params.id)
      if (!outfit) return res.status(404).json({ message: 'Outfit no encontrado' })

      // Eliminar imagen del bucket si existe
      if (outfit.imagen_url) {
        await deleteFromStorage(outfit.imagen_url, 'outfits')
      }

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
  },

  async probarOutfit(req, res) {
    try {
      const outfit = await Outfit.findById(req.params.id)
      if (!outfit) return res.status(404).json({ message: 'Outfit no encontrado' })

      const prendas = await Outfit.getPrendas(req.params.id) 
      if (!prendas || prendas.length === 0) {
        return res.status(400).json({ message: 'Este outfit no tiene prendas asociadas' })
      }

      const prendaSuperior = prendas.find(p => 
        p.tipo?.toLowerCase() === 'superior'
      )
      const prendaInferior = prendas.find(p => 
        p.tipo?.toLowerCase() === 'inferior'
      )

      if (!prendaSuperior) {
        return res.status(400).json({ 
          message: 'El outfit necesita al menos una prenda de tipo "superior" para el try-on' 
        })
      }

      const topUrl = prendaSuperior.imagen_url
      const bottomUrl = prendaInferior ? prendaInferior.imagen_url : null

      const resultadoUrlIA = await tryOnOutfit(topUrl, bottomUrl);
      if (!resultadoUrlIA) return res.status(500).json({ message: 'Error al probar el outfit' })

      const responseIA = await fetch(resultadoUrlIA);
      const buffer = Buffer.from(await responseIA.arrayBuffer());
      
      const nombreArchivo = `tryon_${req.usuario.id}_${Date.now()}`;
      const urlFinal = await uploadToStorage(buffer, nombreArchivo, 'resultados-tryon', req.usuario.id, 'image/png');

      res.json({ 
        status: 200,
        message: '¡Prueba virtual generada!',
        tryon_result_url: urlFinal 
      });
      
    } catch (error) {
      res.status(500).json({ message: 'Error al probar el outfit', error: error.message })
    }
  }
}

module.exports = outfitController