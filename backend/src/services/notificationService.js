require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const notificationService = {
  // Obtener notificaciones del usuario
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notificaciones')
      .select(`
        *,
        users!notificaciones_actor_id_fkey (
          id,
          nombre,
          apellido,
          foto_perfil
        ),
        prendas (
          id,
          nombre,
          imagen_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Marcar todas las notificaciones como leídas
  async markAsRead(userId) {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('user_id', userId)
      .eq('leida', false);

    if (error) throw error;
    return { success: true };
  },

  // Obtener conteo de notificaciones no leídas
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('leida', false);

    if (error) throw error;
    return count || 0;
  },

  // Obtener cuentas populares (top 5 usuarios con más likes en prendas públicas)
  async getPopularUsers(currentUserId) {
    const { data, error } = await supabase
      .from('prendas')
      .select('user_id, likes_count, users!prendas_user_id_fkey (id, nombre, apellido, foto_perfil)')
      .eq('publico', true)
      .not('user_id', 'eq', currentUserId);

    if (error) throw error;

    // Agrupar por usuario y sumar likes
    const userLikes = {};
    data.forEach(prenda => {
      const userId = prenda.user_id;
      if (!userLikes[userId]) {
        userLikes[userId] = {
          id: prenda.users.id,
          nombre: prenda.users.nombre,
          apellido: prenda.users.apellido,
          foto_perfil: prenda.users.foto_perfil,
          totalLikes: 0
        };
      }
      userLikes[userId].totalLikes += (prenda.likes_count || 0);
    });

    // Convertir a array y ordenar por likes
    const sortedUsers = Object.values(userLikes)
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 5);

    // Verificar si el usuario actual sigue a cada uno
    const userIds = sortedUsers.map(u => u.id);
    const { data: followingData } = await supabase
      .from('seguidores')
      .select('following_id')
      .eq('follower_id', currentUserId)
      .in('following_id', userIds);

    const followingIds = new Set(followingData?.map(f => f.following_id) || []);

    return sortedUsers.map(user => ({
      ...user,
      is_following: followingIds.has(user.id)
    }));
  },

  // Buscar usuarios por nombre y apellido
  async searchUsers(query, currentUserId) {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellido, foto_perfil')
      .neq('id', currentUserId)
      .or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;

    // Verificar si el usuario actual sigue a cada uno
    const userIds = data.map(u => u.id);
    const { data: followingData } = await supabase
      .from('seguidores')
      .select('following_id')
      .eq('follower_id', currentUserId)
      .in('following_id', userIds);

    const followingIds = new Set(followingData?.map(f => f.following_id) || []);

    return data.map(user => ({
      ...user,
      is_following: followingIds.has(user.id)
    }));
  }
};

module.exports = notificationService;
