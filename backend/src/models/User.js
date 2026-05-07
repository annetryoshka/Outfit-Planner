const pool = require('../config/database')

const User = {
  async create({ nombre, apellido, email, password }) {
    const result = await pool.query(
      `INSERT INTO users (nombre, apellido, email, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, nombre, apellido, email, created_at`,
      [nombre, apellido, email, password]
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
      'SELECT id, nombre, apellido, email, foto_perfil, ciudad, bio, es_privado, created_at FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  async update(id, { nombre, apellido, foto_perfil, ciudad, bio, es_privado }) {
    const result = await pool.query(
      `UPDATE users 
       SET nombre=$1, apellido=$2, foto_perfil=$3, ciudad=$4, bio=$5, es_privado=$6
       WHERE id=$7 
       RETURNING id, nombre, apellido, email, foto_perfil, ciudad, bio, es_privado, created_at`,
      [nombre, apellido, foto_perfil, ciudad, bio, es_privado, id]
    )
    return result.rows[0]
  }
}

module.exports = User