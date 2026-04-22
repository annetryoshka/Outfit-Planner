const pool = require('../config/database')

const Prenda = {
  async create({ user_id, nombre, tipo, talla, color, temporada, marca, material, imagen_url }) {
    const result = await pool.query(
      `INSERT INTO prendas (user_id, nombre, tipo, talla, color, temporada, marca, material, imagen_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [user_id, nombre, tipo, talla, color, temporada, marca, material, imagen_url]
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

  async update(id, { nombre, tipo, talla, color, temporada, marca, material, imagen_url }) {
    const result = await pool.query(
      `UPDATE prendas 
       SET nombre=$1, tipo=$2, talla=$3, color=$4, temporada=$5, marca=$6, material=$7, imagen_url=$8 
       WHERE id=$9 
       RETURNING *`,
      [nombre, tipo, talla, color, temporada, marca, material, imagen_url, id]
    )
    return result.rows[0]
  },

  async delete(id) {
    await pool.query('DELETE FROM prendas WHERE id = $1', [id])
  }
}

module.exports = Prenda