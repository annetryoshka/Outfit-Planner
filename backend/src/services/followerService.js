require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const followerService = {
  // Seguir a un usuario
  async follow(followerId, followingId) {
    const { data, error } = await supabase
      .from('seguidores')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })
      .select()
      .single();

    if (error) throw error;

    // Insertar notificación
    await supabase
      .from('notificaciones')
      .insert({
        user_id: followingId,
        tipo: 'seguidor',
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
    return { success: true };
  },

  // Verificar si un usuario sigue a otro
  async isFollowing(followerId, followingId) {
    const { data, error } = await supabase
      .from('seguidores')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // Obtener conteo de seguidores de un usuario
  async getFollowersCount(userId) {
    const { count, error } = await supabase
      .from('seguidores')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (error) throw error;
    return count || 0;
  },

  // Obtener conteo de seguidos de un usuario
  async getFollowingCount(userId) {
    const { count, error } = await supabase
      .from('seguidores')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

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
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => item.users);
  },

  // Obtener lista de seguidos de un usuario
  async getFollowing(userId) {
    const { data, error } = await supabase
      .from('seguidores')
      .select(`
        following_id,
        users!seguidores_following_id_fkey (
          id,
          nombre,
          apellido,
          foto_perfil
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => item.users);
  }
};

module.exports = followerService;
