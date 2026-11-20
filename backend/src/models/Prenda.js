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

  // Feed global tipo Pinterest: todas las prendas públicas de todos los usuarios
  async findAllPublicas() {
    const result = await pool.query(
      `SELECT p.*, u.nombre as autor_nombre, u.apellido as autor_apellido 
       FROM prendas p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.publico = true 
       ORDER BY p.created_at DESC`
    )
    return result.rows
  },

  async findByUser(user_id) {
    const result = await pool.query(
      `SELECT p.*, u.nombre as autor_nombre, u.apellido as autor_apellido 
       FROM prendas p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1 
       ORDER BY p.created_at DESC`,
      [user_id]
    )
    return result.rows
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT p.*, u.nombre as autor_nombre, u.apellido as autor_apellido, u.foto_perfil as foto_perfil
       FROM prendas p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    )
    return result.rows[0]
  },

  // Prendas públicas de un usuario. Perfil privado: solo el dueño o un seguidor aceptado.
  async findPublicasByUser(userId, viewerId) {
    const result = await pool.query(
      `SELECT p.id, p.user_id, p.nombre, p.tipo, p.categoria, p.color, p.marca,
              p.temporada, p.material, p.talla, p.imagen_url, p.publico,
              p.likes_count, p.created_at
       FROM prendas p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = $1
         AND p.publico = true
         AND (
           u.es_privado IS NOT TRUE
           OR u.id = $2
           OR EXISTS (
             SELECT 1
             FROM seguidores s
             WHERE s.follower_id = $2
               AND s.following_id = u.id
               AND s.estado = 'aceptado'
           )
         )
       ORDER BY p.created_at DESC`,
      [userId, viewerId]
    )
    return result.rows
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
