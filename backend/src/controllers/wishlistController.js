const Wishlist = require('../models/Wishlist')

const wishlistController = {
  async getWishlist(req, res) {
    try {
      const usuario_id = req.usuario.id
      const { tipo_item, temporada } = req.query
      
      const filters = {}
      if (tipo_item) filters.tipo_item = tipo_item
      if (temporada) filters.temporada = temporada
      
      const wishlist = await Wishlist.findByUserId(usuario_id, filters)
      
      res.status(200).json({ 
        message: 'Lista de deseos obtenida exitosamente',
        filters_aplicados: filters,
        data: wishlist 
      })
    } catch (error) {
      res.status(500).json({ 
        message: 'Error en el servidor', 
        error: error.message 
      })
    }
  },

  async addToWishlist(req, res) {
    try {
      const usuario_id = req.usuario.id
      const { item_id, tipo_item, nombre_item, imagen_url, temporada } = req.body

      // Validar campos requeridos
      if (!item_id || !tipo_item || !nombre_item) {
        return res.status(400).json({ 
          message: 'Faltan campos requeridos: item_id, tipo_item, nombre_item' 
        })
      }

      // Verificar si el item ya existe en la wishlist
      const itemExists = await Wishlist.exists(usuario_id, item_id, tipo_item)
      if (itemExists) {
        return res.status(400).json({ 
          message: 'Este item ya está en tu lista de deseos' 
        })
      }

      const wishlistItem = await Wishlist.create({
        usuario_id,
        item_id,
        tipo_item,
        nombre_item,
        imagen_url,
        temporada
      })

      res.status(201).json({ 
        message: 'Item agregado a la lista de deseos exitosamente',
        data: wishlistItem 
      })
    } catch (error) {
      res.status(500).json({ 
        message: 'Error en el servidor', 
        error: error.message 
      })
    }
  },

  async moverAlArmario(req, res) {
    try {
      const usuario_id = req.usuario.id
      const { id } = req.params

      // Verificar si el item existe y pertenece al usuario
      const wishlistItem = await Wishlist.findById(id)
      if (!wishlistItem) {
        return res.status(404).json({ 
          message: 'Item no encontrado en la lista de deseos' 
        })
      }

      if (wishlistItem.usuario_id !== usuario_id) {
        return res.status(401).json({ 
          message: 'No tienes permiso para mover este item' 
        })
      }

      // Eliminar de wishlist
      const deletedItem = await Wishlist.delete(id, usuario_id)
      
      // Simulación: Aquí el Integrante 1 conectaría con el inventario real
      // Por ahora, solo devolvemos éxito
      
      res.status(200).json({ 
        message: 'Item movido al armario exitosamente',
        data: {
          item_movido: deletedItem,
          nota: 'El item ha sido eliminado de tu wishlist y agregado a tu inventario'
        }
      })
    } catch (error) {
      res.status(500).json({ 
        message: 'Error en el servidor', 
        error: error.message 
      })
    }
  },

  async getRecomendaciones(req, res) {
    try {
      const usuario_id = req.usuario.id
      
      // Obtener todos los items de la wishlist del usuario
      const wishlist = await Wishlist.findByUserId(usuario_id)
      
      if (wishlist.length === 0) {
        return res.status(200).json({
          message: 'No hay items en tu wishlist para generar recomendaciones',
          data: []
        })
      }

      // Simulación: Seleccionar aleatoriamente 2 items (mock para IA/Clima)
      const indicesAleatorios = []
      while (indicesAleatorios.length < 2 && indicesAleatorios.length < wishlist.length) {
        const indice = Math.floor(Math.random() * wishlist.length)
        if (!indicesAleatorios.includes(indice)) {
          indicesAleatorios.push(indice)
        }
      }

      const recomendaciones = indicesAleatorios.map(indice => ({
        ...wishlist[indice],
        razon_recomendacion: 'Ideal para el clima actual',
        prioridad: indice === 0 ? 'alta' : 'media',
        nota: 'Este item será conectado con los servicios de OpenWeather/OpenAI por el Integrante 1'
      }))

      res.status(200).json({
        message: 'Recomendaciones generadas exitosamente',
        total_items_wishlist: wishlist.length,
        data: recomendaciones
      })
    } catch (error) {
      res.status(500).json({ 
        message: 'Error en el servidor', 
        error: error.message 
      })
    }
  },

  async removeFromWishlist(req, res) {
    try {
      const usuario_id = req.usuario.id
      const { id } = req.params

      // Verificar si el item existe y pertenece al usuario
      const wishlistItem = await Wishlist.findById(id)
      if (!wishlistItem) {
        return res.status(404).json({ 
          message: 'Item no encontrado en la lista de deseos' 
        })
      }

      if (wishlistItem.usuario_id !== usuario_id) {
        return res.status(401).json({ 
          message: 'No tienes permiso para eliminar este item' 
        })
      }

      const deletedItem = await Wishlist.delete(id, usuario_id)
      
      res.status(200).json({ 
        message: 'Item eliminado de la lista de deseos exitosamente',
        data: deletedItem 
      })
    } catch (error) {
      res.status(500).json({ 
        message: 'Error en el servidor', 
        error: error.message 
      })
    }
  }
}

module.exports = wishlistController
