const pool = require('../config/database')

const Prenda = {
  async create({ user_id, nombre, tipo, categoria, talla, color, temporada, marca, material, imagen_url, publico }) {
    const result = await pool.query(
      `INSERT INTO prendas (user_id, nombre, tipo, categoria, talla, color, temporada, marca, material, imagen_url, publico) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [user_id, nombre, tipo, categoria, talla, color, temporada, marca, material, imagen_url, publico ?? false]
    )
    return result.rows[0]
  },

  async findByUser(user_id) {
    const result = await pool.query(
      `SELECT * FROM prendas WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    )
    return result.rows
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT * FROM prendas WHERE id = $1`,
      [id]
    )
    return result.rows[0]
  },

  async update(id, { nombre, tipo, categoria, talla, color, temporada, marca, material, imagen_url, publico }) {
    const result = await pool.query(
      `UPDATE prendas 
       SET nombre=$1, tipo=$2, categoria=$3, talla=$4, color=$5, temporada=$6, marca=$7, material=$8, imagen_url=$9, publico=$10
       WHERE id=$11 
       RETURNING *`,
      [nombre, tipo, categoria, talla, color, temporada, marca, material, imagen_url, publico, id]
    )
    return result.rows[0]
  },

  async delete(id) {
    await pool.query('DELETE FROM prendas WHERE id = $1', [id])
  }
}

module.exports = Prenda