const pool = require('../config/database')

const User = {
  async create({ nombre, email, password }) {
    const result = await pool.query(
      `INSERT INTO users (nombre, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, nombre, email, created_at`,
      [nombre, email, password]
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
      'SELECT id, nombre, email, foto_perfil, created_at FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0]
  }
}

module.exports = User