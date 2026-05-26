const pool = require('../config/database')

const Guardado = {
  async guardar(user_id, prenda_id) {
    const result = await pool.query(
      `INSERT INTO guardados (user_id, prenda_id, created_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (user_id, prenda_id) DO NOTHING
       RETURNING *`,
      [user_id, prenda_id]
    )
    return result.rows[0]
  },

  async desguardar(user_id, prenda_id) {
    const result = await pool.query(
      `DELETE FROM guardados 
       WHERE user_id = $1 AND prenda_id = $2 
       RETURNING *`,
      [user_id, prenda_id]
    )
    return result.rows[0]
  },

  async obtenerPorUsuario(user_id) {
    const result = await pool.query(
      `SELECT p.*, g.created_at as guardado_created_at 
       FROM guardados g 
       INNER JOIN prendas p ON g.prenda_id = p.id 
       WHERE g.user_id = $1 
       ORDER BY g.created_at DESC`,
      [user_id]
    )
    return result.rows
  },

  async estaGuardado(user_id, prenda_id) {
    const result = await pool.query(
      `SELECT * FROM guardados 
       WHERE user_id = $1 AND prenda_id = $2`,
      [user_id, prenda_id]
    )
    return result.rows.length > 0
  }
}

module.exports = Guardado
