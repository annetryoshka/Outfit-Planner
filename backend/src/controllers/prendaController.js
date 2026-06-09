const Prenda = require('../models/Prenda');
const { removeBG } = require('../services/removeBGservice')
const { uploadToStorage, deleteFromStorage } = require('../services/uploadService')

const prendaController = {
  /** Vista previa: quita el fondo vía remove.bg sin guardar en BD (respuesta PNG). */
  async quitarFondoPreview(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Se requiere una imagen' })
      }
      const imagenSinFondo = await removeBG(req.file.buffer)
      if (!imagenSinFondo) {
        return res.status(502).json({ message: 'No se pudo quitar el fondo. Intenta de nuevo más tarde.' })
      }
      res.set('Content-Type', 'image/png')
      res.send(imagenSinFondo)
    } catch (error) {
      res.status(500).json({ message: error.message || 'Error al procesar la imagen' })
    }
  },

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


  async obtenerPublicas(req, res) {
    try {
      const prendas = await Prenda.findAllPublicas()
      
      //Algoritmo de mezcla aleatoria 
      const prendasMezcladas = prendas.sort(() => Math.random() - 0.5)
      
      res.json(prendasMezcladas)
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener prendas públicas', error: error.message })
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
      const existente = await Prenda.findById(req.params.id)
      if (!existente) return res.status(404).json({ message: 'Prenda no encontrada' })
      if (String(existente.user_id) !== String(req.usuario.id)) {
        return res.status(403).json({ message: 'No puedes editar esta prenda' })
      }

      const body = req.body || {}
      let imagen_url = existente.imagen_url

      if (req.file) {
        const nombreArchivo = `prenda_${req.usuario.id}_${Date.now()}`
        const urlFinal = await uploadToStorage(
          req.file.buffer,
          nombreArchivo,
          'prendas',
          req.usuario.id,
          req.file.mimetype
        )
        if (!urlFinal) {
          return res.status(500).json({ message: 'Error al subir la imagen' })
        }
        if (existente.imagen_url) {
          await deleteFromStorage(existente.imagen_url, 'prendas')
        }
        imagen_url = urlFinal
      }

      const pick = (key, fallback) => (body[key] !== undefined && body[key] !== null ? body[key] : fallback)

      const publicoRaw = pick('publico', existente.publico)
      const publico =
        publicoRaw === 'true' || publicoRaw === true || publicoRaw === '1'
          ? true
          : publicoRaw === 'false' || publicoRaw === false || publicoRaw === '0'
            ? false
            : !!existente.publico

      const prenda = await Prenda.update(req.params.id, {
        nombre: pick('nombre', existente.nombre),
        tipo: pick('tipo', existente.tipo),
        categoria: pick('categoria', existente.categoria),
        talla: pick('talla', existente.talla),
        color: pick('color', existente.color),
        temporada: pick('temporada', existente.temporada),
        marca: pick('marca', existente.marca) ?? '',
        material: pick('material', existente.material) ?? '',
        imagen_url,
        publico
      })
      res.json(prenda)
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar prenda', error: error.message })
    }
  },

  async eliminar(req, res) {
    try {
      const prenda = await Prenda.findById(req.params.id);
      if (!prenda) return res.status(404).json({ message: 'Prenda no encontrada' });

      if (prenda.imagen_url) {
        await deleteFromStorage(prenda.imagen_url, 'prendas');
      }

      await Prenda.delete(req.params.id);
      res.json({ message: 'Prenda eliminada' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar prenda', error: error.message })
    }
  }
}

module.exports = prendaController