const pool = require('../config/database');

async function attachFollowState(users, currentUserId) {
  if (!users.length) return [];

  const result = await pool.query(
    `SELECT following_id, estado
     FROM seguidores
     WHERE follower_id = $1
       AND following_id = ANY($2::uuid[])`,
    [currentUserId, users.map((user) => user.id)]
  );

  const followingStates = {};
  result.rows.forEach((row) => {
    followingStates[row.following_id] = row.estado;
  });

  return users.map((user) => ({
    ...user,
    follow_state: followingStates[user.id] || 'ninguno'
  }));
}

const notificationService = {
  // Obtener notificaciones del usuario
  async getNotifications(userId) {
    const result = await pool.query(
      `SELECT
         n.id,
         n.user_id,
         n.tipo,
         n.actor_id,
         n.prenda_id,
         n.leida,
         n.created_at,
         CASE
           WHEN u.id IS NULL THEN NULL
           ELSE json_build_object(
             'id', u.id,
             'nombre', u.nombre,
             'apellido', u.apellido,
             'foto_perfil', u.foto_perfil
           )
         END AS users,
         CASE
           WHEN p.id IS NULL THEN NULL
           ELSE json_build_object(
             'id', p.id,
             'nombre', p.nombre,
             'imagen_url', p.imagen_url
           )
         END AS prendas
       FROM notificaciones n
       LEFT JOIN users u ON u.id = n.actor_id
       LEFT JOIN prendas p ON p.id = n.prenda_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );

    const data = result.rows;
    const solicitudes = data.filter((n) => n.tipo === 'solicitud_seguimiento');

    if (solicitudes.length > 0) {
      const seguidoresResult = await pool.query(
        `SELECT id, follower_id
         FROM seguidores
         WHERE following_id = $1
           AND follower_id = ANY($2::uuid[])`,
        [userId, solicitudes.map((n) => n.actor_id)]
      );

      const seguidorMap = {};
      seguidoresResult.rows.forEach((row) => {
        seguidorMap[row.follower_id] = row.id;
      });

      data.forEach((n) => {
        if (n.tipo === 'solicitud_seguimiento') {
          n.seguidor_id = seguidorMap[n.actor_id];
        }
      });
    }

    return data;
  },

  // Marcar todas las notificaciones como leídas
  async markAsRead(userId) {
    await pool.query(
      `UPDATE notificaciones
       SET leida = true
       WHERE user_id = $1 AND leida = false`,
      [userId]
    );

    return { success: true };
  },

  // Obtener conteo de notificaciones no leídas
  async getUnreadCount(userId) {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM notificaciones
       WHERE user_id = $1 AND leida = false`,
      [userId]
    );

    return result.rows[0].count || 0;
  },

  // Obtener cuentas populares (top 5 usuarios con más likes en prendas públicas)
  async getPopularUsers(currentUserId) {
    const result = await pool.query(
      `SELECT
         u.id,
         u.nombre,
         u.apellido,
         u.foto_perfil,
         u.es_privado,
         COALESCE(SUM(p.likes_count), 0)::int AS "totalLikes"
       FROM prendas p
       JOIN users u ON u.id = p.user_id
       WHERE p.publico = true
         AND p.user_id IS NOT NULL
         AND p.user_id <> $1
       GROUP BY u.id, u.nombre, u.apellido, u.foto_perfil, u.es_privado
       ORDER BY "totalLikes" DESC
       LIMIT 5`,
      [currentUserId]
    );

    return attachFollowState(result.rows, currentUserId);
  },

  // Buscar usuarios por nombre y apellido
  async searchUsers(query, currentUserId) {
    const result = await pool.query(
      `SELECT id, nombre, apellido, foto_perfil, es_privado
       FROM users
       WHERE id <> $1
         AND (nombre ILIKE $2 OR apellido ILIKE $2)
       LIMIT 20`,
      [currentUserId, `%${query}%`]
    );

    return attachFollowState(result.rows, currentUserId);
  }
};

module.exports = notificationService;
