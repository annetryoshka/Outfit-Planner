const Wishlist = require('../models/Wishlist')
const { buscarProductos } = require('../services/storeService')

const wishlistController = {
  async getWishlist(req, res) {
    try {      
      const wishlist = await Wishlist.findByUserId(req.usuario.id)
      
      res.status(200).json({ 
        message: 'Lista de deseos obtenida exitosamente',
        data: wishlist 
      })
    } catch (error) {
      res.status(500).json({ 
        message: 'Error en el servidor', 
        error: error.message 
      })
    }
  },

  async getById(req, res) {
    try {
      const item = await Wishlist.findById(req.params.id)
      if (!item) {
        return res.status(404).json({ message: 'Item no encontrado' })
      }
      if (item.user_id !== req.usuario.id) {
        return res.status(403).json({ message: 'No autorizado' })
      }
      res.status(200).json({ message: 'OK', data: item })
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
  },

  async buscarProductos(req, res) {
    try {
      const { q, categoria } = req.query

      const productos = await buscarProductos(q || '', categoria || '')

      if (productos.length === 0) {
        return res.status(200).json({
          message: 'No se encontraron productos con esa búsqueda',
          data: []
        })
      }

      res.status(200).json({
        total: productos.length,
        data: productos
      })

    } catch (error) {
      res.status(500).json({
        message: 'Error buscando productos',
        error: error.message
      })
    }
  },

  async addToWishlist(req, res) {
    try {
      const { nombre, imagen_url, precio, url_tienda } = req.body

      if (!nombre || !url_tienda) {
        return res.status(400).json({
          message: 'nombre y url_tienda son requeridos'
        })
      }

      // Verificar si ya está guardado
      const yaExiste = await Wishlist.exists(req.usuario.id, url_tienda)
      if (yaExiste) {
        return res.status(400).json({
          message: 'Este producto ya está en tu wishlist'
        })
      }

      const item = await Wishlist.create({
        user_id: req.usuario.id,
        nombre,
        imagen_url,
        precio,
        url_tienda
      })

      res.status(201).json({
        message: 'Producto guardado en wishlist',
        data: item
      })

    } catch (error) {
      res.status(500).json({
        message: 'Error guardando en wishlist',
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

      if (wishlistItem.user_id !== usuario_id) {
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
      const item = await Wishlist.findById(req.params.id)
      if (!item) {
        return res.status(404).json({ message: 'Item no encontrado' })
      }
      if (item.user_id !== req.usuario.id) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este item' })
      }

      await Wishlist.delete(req.params.id, req.usuario.id)
      res.status(200).json({ message: 'Producto eliminado de wishlist' })
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor', error: error.message })
    }
  }
}

module.exports = wishlistController