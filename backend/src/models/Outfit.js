const pool = require('../config/database')

const Outfit = {
  async create({ user_id, nombre, ocasion, es_publico, imagen_url, fecha_calendario, canvas_data, es_clon }) {
    const result = await pool.query(
      `INSERT INTO outfits (user_id, nombre, ocasion, es_publico, imagen_url, fecha_calendario, canvas_data, es_clon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, nombre, ocasion, es_publico, imagen_url, fecha_calendario, canvas_data ? JSON.stringify(canvas_data) : null, es_clon ?? false]
    )
    return result.rows[0]
  },

  async findByUser(user_id) {
    const result = await pool.query(
      `SELECT * FROM outfits WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    )
    return result.rows
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT o.*, array_agg(
        json_build_object(
          'id', p.id,
          'nombre', p.nombre,
          'imagen_url', p.imagen_url,
          'tipo', p.tipo,
          'categoria', p.categoria,
          'color', p.color
        )
      ) FILTER (WHERE p.id IS NOT NULL) as prendas
       FROM outfits o
       LEFT JOIN outfit_prendas op ON o.id = op.outfit_id
       LEFT JOIN prendas p ON op.prenda_id = p.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id]
    )
    return result.rows[0]
  },

  async findByFecha(user_id, fecha) {
    const result = await pool.query(
      `SELECT * FROM outfits WHERE user_id = $1 AND fecha_calendario = $2`,
      [user_id, fecha]
    )
    return result.rows
  },
  async replacePrendas(outfit_id, nuevas_prenda_ids) {
  // Eliminar todas las prendas actuales del outfit
    await pool.query(
      `DELETE FROM outfit_prendas WHERE outfit_id = $1`,
      [outfit_id]
    )
    
    // Insertar las nuevas
    for (const prenda_id of nuevas_prenda_ids) {
      await pool.query(
        `INSERT INTO outfit_prendas (outfit_id, prenda_id) VALUES ($1, $2)`,
        [outfit_id, prenda_id]
      )
    }
  },

  async update(id, { nombre, ocasion, es_publico, imagen_url, fecha_calendario, canvas_data }) {
    const result = await pool.query(
      `UPDATE outfits SET nombre=$1, ocasion=$2, es_publico=$3, imagen_url=$4, fecha_calendario=$5, canvas_data=$6
       WHERE id=$7 RETURNING *`,
      [nombre, ocasion, es_publico, imagen_url, fecha_calendario, canvas_data ? JSON.stringify(canvas_data) : null, id]
    )
    return result.rows[0]
  },

  async delete(id) {
    await pool.query('DELETE FROM outfits WHERE id = $1', [id])
  },

  async addPrenda(outfit_id, prenda_id) {
    await pool.query(
      `INSERT INTO outfit_prendas (outfit_id, prenda_id) VALUES ($1, $2)`,
      [outfit_id, prenda_id]
    )
  },

  async removePrenda(outfit_id, prenda_id) {
    await pool.query(
      `DELETE FROM outfit_prendas WHERE outfit_id=$1 AND prenda_id=$2`,
      [outfit_id, prenda_id]
    )
  },

  async getPrendas(outfit_id) {
    const result = await pool.query(
      `SELECT p.* FROM prendas p
       JOIN outfit_prendas op ON p.id = op.prenda_id
       WHERE op.outfit_id = $1`,
      [outfit_id]
    );
    return result.rows;
  }
}

module.exports = Outfit