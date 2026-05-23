const pool = require('../config/database')

const User = {
  // 1. CORREGIDO: Se añade 'fondo' por defecto por si no se envía al crear
  async create({ nombre, apellido, email, password, foto_perfil = null, fondo = null }) {
    const result = await pool.query(
      `INSERT INTO users (nombre, apellido, email, password, foto_perfil, fondo) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, nombre, apellido, email, foto_perfil, fondo, created_at`,
      [nombre, apellido, email, password, foto_perfil, fondo]
    )
    return result.rows[0]
  },

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0]
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT id, nombre, apellido, email, foto_perfil, fondo, ciudad, bio, es_privado, created_at FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  // 2. CORREGIDO: Ahora recibe, actualiza y retorna el 'apellido'
  async update(id, { nombre, apellido, foto_perfil, ciudad, bio, es_privado, fondo }) {
    const result = await pool.query(
      `UPDATE users 
       SET nombre=$1, apellido=$2, foto_perfil=$3, ciudad=$4, bio=$5, es_privado=$6, fondo=$7
       WHERE id=$8 
       RETURNING id, nombre, apellido, email, foto_perfil, ciudad, bio, es_privado, fondo, created_at`,
      [nombre, apellido, foto_perfil, ciudad, bio, es_privado, fondo, id]
    )
    return result.rows[0]
  }
}

module.exports = User