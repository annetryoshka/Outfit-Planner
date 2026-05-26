const pool = require('../config/database')

const Like = {
  async darLike(user_id, prenda_id) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      // Insertar like
      const result = await client.query(
        `INSERT INTO likes (user_id, prenda_id, created_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (user_id, prenda_id) DO NOTHING
         RETURNING *`,
        [user_id, prenda_id]
      )
      
      // Incrementar contador
      await client.query(
        `UPDATE prendas SET likes_count = likes_count + 1 WHERE id = $1`,
        [prenda_id]
      )
      
      await client.query('COMMIT')
      return result.rows[0]
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },

  async quitarLike(user_id, prenda_id) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      // Eliminar like
      const result = await client.query(
        `DELETE FROM likes 
         WHERE user_id = $1 AND prenda_id = $2 
         RETURNING *`,
        [user_id, prenda_id]
      )
      
      // Decrementar contador (no bajar de 0)
      await client.query(
        `UPDATE prendas 
         SET likes_count = GREATEST(likes_count - 1, 0) 
         WHERE id = $1`,
        [prenda_id]
      )
      
      await client.query('COMMIT')
      return result.rows[0]
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },

  async obtenerPorUsuario(user_id) {
    const result = await pool.query(
      `SELECT p.*, l.created_at as like_created_at 
       FROM likes l 
       INNER JOIN prendas p ON l.prenda_id = p.id 
       WHERE l.user_id = $1 
       ORDER BY l.created_at DESC`,
      [user_id]
    )
    return result.rows
  },

  async tienelike(user_id, prenda_id) {
    const result = await pool.query(
      `SELECT * FROM likes 
       WHERE user_id = $1 AND prenda_id = $2`,
      [user_id, prenda_id]
    )
    return result.rows.length > 0
  }
}

module.exports = Like