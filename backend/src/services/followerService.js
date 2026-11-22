const pool = require('../config/database');

const followerService = {
  // Seguir a un usuario
  async follow(followerId, followingId) {
    const existingResult = await pool.query(
      `SELECT *
       FROM seguidores
       WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    const existing = existingResult.rows[0];
    if (existing) {
      return { ...existing, alreadyExists: true };
    }

    const targetResult = await pool.query(
      `SELECT es_privado
       FROM users
       WHERE id = $1`,
      [followingId]
    );

    const isPrivate = targetResult.rows[0]?.es_privado || false;
    const estado = isPrivate ? 'pendiente' : 'aceptado';
    const tipoNotificacion = isPrivate ? 'solicitud_seguimiento' : 'seguidor';

    const insertResult = await pool.query(
      `INSERT INTO seguidores (follower_id, following_id, estado)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [followerId, followingId, estado]
    );

    if (followerId !== followingId) {
      await pool.query(
        `INSERT INTO notificaciones (user_id, tipo, actor_id)
         VALUES ($1, $2, $3)`,
        [followingId, tipoNotificacion, followerId]
      );
    }

    return insertResult.rows[0];
  },

  // Dejar de seguir a un usuario
  async unfollow(followerId, followingId) {
    await pool.query(
      `DELETE FROM seguidores
       WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    await pool.query(
      `DELETE FROM notificaciones
       WHERE user_id = $1 AND actor_id = $2 AND tipo = 'solicitud_seguimiento'`,
      [followingId, followerId]
    );

    return { success: true };
  },

  // Verificar si un usuario sigue a otro
  async isFollowing(followerId, followingId) {
    const result = await pool.query(
      `SELECT estado
       FROM seguidores
       WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    const data = result.rows[0];
    if (!data) return 'ninguno';
    return data.estado || 'ninguno';
  },

  // Obtener conteo de seguidores de un usuario
  async getFollowersCount(userId) {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM seguidores
       WHERE following_id = $1 AND estado = 'aceptado'`,
      [userId]
    );

    return result.rows[0].count || 0;
  },

  // Obtener conteo de seguidos de un usuario
  async getFollowingCount(userId) {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM seguidores
       WHERE follower_id = $1 AND estado = 'aceptado'`,
      [userId]
    );

    return result.rows[0].count || 0;
  },

  // Obtener lista de seguidores de un usuario
  async getFollowers(userId) {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.foto_perfil
       FROM seguidores s
       JOIN users u ON u.id = s.follower_id
       WHERE s.following_id = $1 AND s.estado = 'aceptado'
       ORDER BY s.created_at DESC`,
      [userId]
    );

    return result.rows;
  },

  // Obtener lista de seguidos de un usuario
  async getFollowing(userId) {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.foto_perfil
       FROM seguidores s
       JOIN users u ON u.id = s.following_id
       WHERE s.follower_id = $1 AND s.estado = 'aceptado'`,
      [userId]
    );

    return result.rows;
  },

  // Aceptar solicitud de seguimiento
  async acceptRequest(solicitudId, userId) {
    const solicitudResult = await pool.query(
      `SELECT *
       FROM seguidores
       WHERE id = $1`,
      [solicitudId]
    );

    const solicitud = solicitudResult.rows[0];
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    if (solicitud.following_id !== userId) {
      throw new Error('No tienes permiso para aceptar esta solicitud');
    }

    await pool.query(
      `UPDATE seguidores
       SET estado = 'aceptado'
       WHERE id = $1`,
      [solicitudId]
    );

    await pool.query(
      `DELETE FROM notificaciones
       WHERE user_id = $1 AND actor_id = $2 AND tipo = 'solicitud_seguimiento'`,
      [userId, solicitud.follower_id]
    );

    if (solicitud.follower_id !== userId) {
      await pool.query(
        `INSERT INTO notificaciones (user_id, tipo, actor_id)
         VALUES ($1, 'solicitud_aceptada', $2)`,
        [solicitud.follower_id, userId]
      );
    }

    return { success: true };
  },

  // Rechazar solicitud de seguimiento
  async rejectRequest(solicitudId, userId) {
    const solicitudResult = await pool.query(
      `SELECT *
       FROM seguidores
       WHERE id = $1`,
      [solicitudId]
    );

    const solicitud = solicitudResult.rows[0];
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    if (solicitud.following_id !== userId) {
      throw new Error('No tienes permiso para rechazar esta solicitud');
    }

    await pool.query(
      `DELETE FROM seguidores
       WHERE id = $1`,
      [solicitudId]
    );

    await pool.query(
      `DELETE FROM notificaciones
       WHERE user_id = $1 AND actor_id = $2 AND tipo = 'solicitud_seguimiento'`,
      [userId, solicitud.follower_id]
    );

    return { success: true };
  }
};

module.exports = followerService;
