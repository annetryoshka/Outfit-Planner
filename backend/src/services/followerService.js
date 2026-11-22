require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const followerService = {
  // Seguir a un usuario
  async follow(followerId, followingId) {
    // Verificar si ya existe una relación
    const { data: existing } = await supabase
      .from('seguidores')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existing) {
      return { ...existing, alreadyExists: true };
    }

    // Verificar si el usuario objetivo es privado
    const { data: targetUser } = await supabase
      .from('users')
      .select('es_privado')
      .eq('id', followingId)
      .single();

    const isPrivate = targetUser?.es_privado || false;
    const estado = isPrivate ? 'pendiente' : 'aceptado';
    const tipoNotificacion = isPrivate ? 'solicitud_seguimiento' : 'seguidor';

    const { data, error } = await supabase
      .from('seguidores')
      .insert({
        follower_id: followerId,
        following_id: followingId,
        estado
      })
      .select()
      .single();

    if (error) throw error;

    // Insertar notificación
    await supabase
      .from('notificaciones')
      .insert({
        user_id: followingId,
        tipo: tipoNotificacion,
        actor_id: followerId
      });

    return data;
  },

  // Dejar de seguir a un usuario
  async unfollow(followerId, followingId) {
    const { error } = await supabase
      .from('seguidores')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;

    // Borrar notificación de solicitud pendiente si existe
    await supabase
      .from('notificaciones')
      .delete()
      .eq('user_id', followingId)
      .eq('actor_id', followerId)
      .eq('tipo', 'solicitud_seguimiento');

    return { success: true };
  },

  // Verificar si un usuario sigue a otro
  async isFollowing(followerId, followingId) {
    const { data, error } = await supabase
      .from('seguidores')
      .select('estado')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error || !data) return 'ninguno';
    return data.estado || 'ninguno';
  },

  // Obtener conteo de seguidores de un usuario
  async getFollowersCount(userId) {
    const { count, error } = await supabase
      .from('seguidores')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
      .eq('estado', 'aceptado');

    if (error) throw error;
    return count || 0;
  },

  // Obtener conteo de seguidos de un usuario
  async getFollowingCount(userId) {
    const { count, error } = await supabase
      .from('seguidores')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)
      .eq('estado', 'aceptado');

    if (error) throw error;
    return count || 0;
  },

  // Obtener lista de seguidores de un usuario
  async getFollowers(userId) {
    const { data, error } = await supabase
      .from('seguidores')
      .select(`
        follower_id,
        users!seguidores_follower_id_fkey (
          id,
          nombre,
          apellido,
          foto_perfil
        )
      `)
      .eq('following_id', userId)
      .eq('estado', 'aceptado')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => item.users);
  },

  // Obtener lista de seguidos de un usuario
  async getFollowing(userId) {
    const { data, error } = await supabase
      .from('seguidores')
      .select(`
        users!seguidores_following_id_fkey (
          id,
          nombre,
          apellido,
          foto_perfil
        )
      `)
      .eq('follower_id', userId)
      .eq('estado', 'aceptado');

    if (error) throw error;
    return data.map(f => f.users);
  },

  // Aceptar solicitud de seguimiento
  async acceptRequest(solicitudId, userId) {
    // Obtener la solicitud
    const { data: solicitud, error: fetchError } = await supabase
      .from('seguidores')
      .select('*')
      .eq('id', solicitudId)
      .single();

    if (fetchError) throw fetchError;

    // Verificar que el usuario logueado es el dueño de la cuenta
    if (solicitud.following_id !== userId) {
      throw new Error('No tienes permiso para aceptar esta solicitud');
    }

    // Actualizar estado a aceptado
    const { error: updateError } = await supabase
      .from('seguidores')
      .update({ estado: 'aceptado' })
      .eq('id', solicitudId);

    if (updateError) throw updateError;

    // Eliminar la notificación de solicitud (en lugar de solo marcarla como leída)
    await supabase
      .from('notificaciones')
      .delete()
      .eq('user_id', userId)
      .eq('actor_id', solicitud.follower_id)
      .eq('tipo', 'solicitud_seguimiento');

    // Crear notificación de aceptación
    await supabase
      .from('notificaciones')
      .insert({
        user_id: solicitud.follower_id,
        tipo: 'solicitud_aceptada',
        actor_id: userId
      });

    return { success: true };
  },

  // Rechazar solicitud de seguimiento
  async rejectRequest(solicitudId, userId) {
    // Obtener la solicitud
    const { data: solicitud, error: fetchError } = await supabase
      .from('seguidores')
      .select('*')
      .eq('id', solicitudId)
      .single();

    if (fetchError) throw fetchError;

    // Verificar que el usuario logueado es el dueño de la cuenta
    if (solicitud.following_id !== userId) {
      throw new Error('No tienes permiso para rechazar esta solicitud');
    }

    // Borrar la fila de seguidores
    const { error: deleteError } = await supabase
      .from('seguidores')
      .delete()
      .eq('id', solicitudId);

    if (deleteError) throw deleteError;

    // Borrar la notificación de solicitud
    await supabase
      .from('notificaciones')
      .delete()
      .eq('user_id', userId)
      .eq('actor_id', solicitud.follower_id)
      .eq('tipo', 'solicitud_seguimiento');

    return { success: true };
  }
};

module.exports = followerService;
