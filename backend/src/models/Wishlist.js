const pool = require('../config/database')

const Wishlist = {
  async create({ user_id, nombre, imagen_url, precio, url_tienda }) {
    const result = await pool.query(
      `INSERT INTO wishlist (user_id, nombre, imagen_url, precio, url_tienda, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [user_id, nombre, imagen_url, precio, url_tienda]
    )
    return result.rows[0]
  },

  async findByUserId(user_id) {
    const result = await pool.query(
      `SELECT * FROM wishlist WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    )
    return result.rows
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM wishlist WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  async delete(id, user_id) {
    const result = await pool.query(
      'DELETE FROM wishlist WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    )
    return result.rows[0]
  },

  async exists(user_id, url_tienda) {
    const result = await pool.query(
      'SELECT * FROM wishlist WHERE user_id = $1 AND url_tienda = $2',
      [user_id, url_tienda]
    )
    return result.rows[0]
  }
}

module.exports = Wishlist
