const pool = require('../config/database')
const { create } = require('./Prenda')

const TryOn = {
    async create({ user_id, outfit_id = null, imagen_url, configuracion_prendas = null }) {
        const result = await pool.query(
            `INSERT INTO tryon_history (user_id, outfit_id, imagen_url, configuracion_prendas) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [user_id, outfit_id, imagen_url, configuracion_prendas]
        )
        return result.rows[0]
    },

    async findByUser(user_id) {
        const result = await pool.query(
            `SELECT t.*, o.nombre as outfit_nombre
             FROM tryon_history t
             LEFT JOIN outfit o ON t.outfit_id = o.id
             WHERE t.user_id = $1 ORDER BY t.created_at DESC`,
            [user_id]
        )
        return result.rows
    },

    async findById(id) {
        const result = await pool.query(
            `SELECT * FROM tryon_history WHERE id = $1`,
            [id]
        )
        return result.rows[0]
    },

    async delete(id, user_id) {
        const result =await pool.query(
            'DELETE FROM tryon_history WHERE id = $1 and user_id = $2', 
            [id, user_id]
        )
        return result.rows[0]
    }
}

module.exports = TryOn