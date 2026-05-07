import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { User, MapPin, Mail, Calendar, Lock, Globe, Camera, LogOut } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      setFormData(currentUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authService.updateUser(formData);
      setUser(result.usuario || result.user);
      setIsEditing(false);
      alert('Perfil actualizado con éxito');
    } catch (err) {
      alert('Error al actualizar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#ffffff] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-morado">Mi Perfil / Armario</h1>
          <div className="flex gap-3">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-morado text-blanco rounded-xl hover:bg-morado/90 shadow-md transition-all text-sm font-medium"
              >
                Editar Perfil
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="px-6 py-2 bg-rosado2 text-blanco rounded-xl hover:bg-rosado2/90 shadow-md transition-all text-sm font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        <div className="bg-blanco rounded-3xl shadow-xl overflow-hidden border border-celeste/30">
          {/* Header del Perfil / Banner */}
          <div className="h-32 bg-celeste/20 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-blanco rounded-2xl flex items-center justify-center border-4 border-white shadow-lg overflow-hidden group cursor-pointer relative">
                {user.foto_perfil ? (
                  <img src={user.foto_perfil} alt={user.nombre} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-morado/40" />
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-celeste rounded-xl focus:border-morado outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Apellido</label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-celeste rounded-xl focus:border-morado outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Ciudad</label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-celeste rounded-xl focus:border-morado outline-none transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Biografía</label>
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border-2 border-celeste rounded-xl focus:border-morado outline-none transition-colors"
                    ></textarea>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="es_privado"
                      name="es_privado"
                      checked={formData.es_privado || false}
                      onChange={handleChange}
                      className="w-4 h-4 text-morado border-celeste rounded focus:ring-morado"
                    />
                    <label htmlFor="es_privado" className="text-sm font-medium text-gray-600">Perfil Privado</label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 bg-verde text-blanco rounded-xl hover:bg-verde/90 transition-colors text-sm font-bold shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(user);
                    }}
                    className="px-8 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-morado">{user.nombre} {user.apellido}</h2>
                  <p className="text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {user.email}
                  </p>
                </div>

                {/* Grid de Información */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="w-5 h-5 text-morado" />
                      <span>{user.ciudad || 'Ciudad no especificada'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-5 h-5 text-morado" />
                      <span>Miembro desde: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recientemente'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      {user.es_privado ? (
                        <><Lock className="w-5 h-5 text-morado" /> <span>Perfil Privado</span></>
                      ) : (
                        <><Globe className="w-5 h-5 text-morado" /> <span>Perfil Público</span></>
                      )}
                    </div>
                  </div>

                  <div className="bg-celeste/10 p-6 rounded-2xl border border-celeste/20">
                    <h3 className="text-sm font-bold text-morado uppercase tracking-wider mb-2">Biografía</h3>
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                      {user.bio || 'Aún no has añadido una biografía a tu perfil.'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Sección de Armario (Placeholder) */}
            <div className="mt-12 border-t border-celeste/20 pt-8">
              <h3 className="text-xl font-bold text-morado mb-4 text-center">Mi Armario Virtual</h3>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-celeste/5 rounded-2xl border-2 border-dashed border-celeste/20 flex items-center justify-center group hover:bg-celeste/10 transition-colors cursor-pointer">
                    <Camera className="w-8 h-8 text-celeste/40 group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
