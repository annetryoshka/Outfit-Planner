const Like = require('../models/Like')

exports.darLike = async (req, res) => {
  try {
    const { prenda_id } = req.body
    const user_id = req.usuario.id  
    
    const like = await Like.darLike(user_id, prenda_id)
    res.json({ success: true, like })
  } catch (error) {
    console.error('Error al dar like:', error)
    res.status(500).json({ message: 'Error al dar like' })
  }
}

exports.quitarLike = async (req, res) => {
  try {
    const { prenda_id } = req.params
    const user_id = req.usuario.id  
    
    await Like.quitarLike(user_id, prenda_id)
    res.json({ success: true, message: 'Like eliminado' })
  } catch (error) {
    console.error('Error al quitar like:', error)
    res.status(500).json({ message: 'Error al quitar like' })
  }
}

exports.obtenerMisLikes = async (req, res) => {
  try {
    const user_id = req.usuario.id  
    const likes = await Like.obtenerPorUsuario(user_id)
    res.json(likes)
  } catch (error) {
    console.error('Error al obtener likes:', error)
    res.status(500).json({ message: 'Error al obtener likes' })
  }
}

exports.verificarLike = async (req, res) => {
  try {
    const { prenda_id } = req.params
    const user_id = req.usuario.id 
    
    const tienelike = await Like.tienelike(user_id, prenda_id)
    res.json({ tienelike })
  } catch (error) {
    console.error('Error al verificar like:', error)
    res.status(500).json({ message: 'Error al verificar like' })
  }
}

module.exports = exports