const pool = require('../config/database')

const Wishlist = {
  async create({ usuario_id, item_id, tipo_item, nombre_item, imagen_url, temporada }) {
    const result = await pool.query(
      `INSERT INTO wishlist (usuario_id, item_id, tipo_item, nombre_item, imagen_url, temporada, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [usuario_id, item_id, tipo_item, nombre_item, imagen_url, temporada]
    )
    return result.rows[0]
  },

  async findByUserId(usuario_id, filters = {}) {
    let query = `SELECT * FROM wishlist WHERE usuario_id = $1`
    const params = [usuario_id]
    let paramIndex = 2

    if (filters.tipo_item) {
      query += ` AND tipo_item = $${paramIndex}`
      params.push(filters.tipo_item)
      paramIndex++
    }

    if (filters.temporada) {
      query += ` AND temporada = $${paramIndex}`
      params.push(filters.temporada)
      paramIndex++
    }

    query += ` ORDER BY created_at DESC`

    const result = await pool.query(query, params)
    return result.rows
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM wishlist WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  async delete(id, usuario_id) {
    const result = await pool.query(
      'DELETE FROM wishlist WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuario_id]
    )
    return result.rows[0]
  },

  async exists(usuario_id, item_id, tipo_item) {
    const result = await pool.query(
      'SELECT * FROM wishlist WHERE usuario_id = $1 AND item_id = $2 AND tipo_item = $3',
      [usuario_id, item_id, tipo_item]
    )
    return result.rows[0]
  }
}

module.exports = Wishlist
