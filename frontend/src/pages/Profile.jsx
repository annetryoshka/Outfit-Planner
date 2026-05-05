import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { User, MapPin, Mail, Calendar, Lock, Globe, Camera } from 'lucide-react';

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
      setUser(result.user);
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
    <div className="min-h-screen bg-base p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-vino">Mi Perfil / Armario</h1>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-vino text-crema rounded-xl hover:bg-vino/90 transition-colors text-sm font-medium"
            >
              Editar Perfil
            </button>
          )}
        </div>
        
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header del Perfil / Banner */}
          <div className="h-32 bg-vino/10 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-crema rounded-2xl flex items-center justify-center border-4 border-white shadow-md overflow-hidden group cursor-pointer relative">
                {user.foto_perfil ? (
                  <img src={user.foto_perfil} alt={user.nombre} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-vino/40" />
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
                    <label className="block text-sm font-medium text-arena mb-1">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-crema rounded-xl focus:border-vino outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-arena mb-1">Apellido</label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-crema rounded-xl focus:border-vino outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-arena mb-1">Ciudad</label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-crema rounded-xl focus:border-vino outline-none transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-arena mb-1">Biografía</label>
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border-2 border-crema rounded-xl focus:border-vino outline-none transition-colors"
                    ></textarea>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="es_privado"
                      name="es_privado"
                      checked={formData.es_privado || false}
                      onChange={handleChange}
                      className="w-4 h-4 text-vino border-crema rounded focus:ring-vino"
                    />
                    <label htmlFor="es_privado" className="text-sm font-medium text-arena">Perfil Privado</label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 bg-vino text-crema rounded-xl hover:bg-vino/90 transition-colors text-sm font-bold disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(user);
                    }}
                    className="px-8 py-2 bg-arena/20 text-vino rounded-xl hover:bg-arena/30 transition-colors text-sm font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-vino">{user.nombre} {user.apellido}</h2>
                  <p className="text-arena">{user.email}</p>
                </div>

                {/* Grid de Información basado en la BD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-arena">
                      <MapPin className="w-5 h-5 text-vino" />
                      <span>{user.ciudad || 'Ciudad no especificada'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-arena">
                      <Calendar className="w-5 h-5 text-vino" />
                      <span>Miembro desde: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recientemente'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-arena">
                      {user.es_privado ? (
                        <><Lock className="w-5 h-5 text-vino" /> <span>Perfil Privado</span></>
                      ) : (
                        <><Globe className="w-5 h-5 text-vino" /> <span>Perfil Público</span></>
                      )}
                    </div>
                  </div>

                  <div className="bg-crema/30 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-vino uppercase tracking-wider mb-2">Biografía</h3>
                    <p className="text-arena text-sm leading-relaxed">
                      {user.bio || 'Aún no has añadido una biografía a tu perfil.'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Sección de Armario (Placeholder) */}
            <div className="mt-12 border-t border-arena/10 pt-8">
              <h3 className="text-xl font-bold text-vino mb-4 text-center">Mi Armario Virtual</h3>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-crema/50 rounded-2xl border-2 border-dashed border-arena/20 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-arena/30" />
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
