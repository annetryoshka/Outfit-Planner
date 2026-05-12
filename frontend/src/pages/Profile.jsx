import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { User, MapPin, Mail, Calendar, Lock, Globe, Camera, LogOut, ShoppingBag, ExternalLink, Search, Plus, Shirt } from 'lucide-react';
import logo3 from '../assets/logo3.png';
import prendaService from '../services/prendaService';
import outfitService from '../services/outfitService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState('todos');
  const [armarioTab, setArmarioTab] = useState('armario');
  const [prendas, setPrendas] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [wardrobeLoading, setWardrobeLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'inspo', label: 'Inspo' },
    { id: 'products', label: 'Products' },
  ];

  const shopButtons = [
    { name: 'Shein', icon: ShoppingBag },
    { name: 'AliExpress', icon: ExternalLink },
  ];

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      setFormData(currentUser);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setWardrobeLoading(true);
    Promise.all([
      prendaService.obtenerTodas().catch(() => []),
      outfitService.obtenerTodos().catch(() => []),
    ])
      .then(([p, o]) => {
        if (cancelled) return;
        setPrendas(Array.isArray(p) ? p : []);
        setOutfits(Array.isArray(o) ? o : []);
      })
      .finally(() => {
        if (!cancelled) setWardrobeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handlePhotoClick = () => {
    if (isEditing) fileInputRef.current.click();
  };

  const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // LOG DE CONTROL: Mira esto en la consola del navegador (F12)
  console.log("Archivo seleccionado:", file.name, "Tipo:", file.type);

  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes');
    return;
  }

  setUploadingPhoto(true);
  try {
    const ext = file.name.split('.').pop().toLowerCase();
    // Generamos un nombre limpio
    const fileName = `avatar_${Date.now()}.${ext}`;
    
    console.log("Subiendo a ICONPROFILE con nombre:", fileName);

    const { data, error: uploadError } = await supabase.storage
      .from('iconprofile') 
      .upload(fileName, file, { 
        cacheControl: '3600',
        upsert: true 
      });

    if (uploadError) {
      console.error("Error detallado de Supabase:", uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('iconprofile')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log("URL generada:", publicUrl);

    const result = await authService.updateUser({ ...formData, foto_perfil: publicUrl });
    const updatedUser = result.usuario || result.user;
    
    setUser(updatedUser);
    setFormData(updatedUser);
    localStorage.setItem('usuario', JSON.stringify(updatedUser));
    alert("¡Foto actualizada!");

  } catch (err) {
    console.error("Objeto de error completo:", err);
    alert('Error al subir la imagen: ' + (err.message || 'Error desconocido'));
  } finally {
    setUploadingPhoto(false);
  }
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
    <div className="min-h-screen relative">

      <header className="sticky top-0 z-30 bg-blanco shadow-sm px-8 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="h-10 w-auto cursor-pointer mr-6 hover:opacity-90 transition-all">
            <img src={logo3} alt="PinWand" className="h-full w-auto object-contain" />
          </button>

          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-all duration-300 rounded-2xl
                  ${activeTab === tab.id ? 'bg-morado text-blanco' : 'text-gray-900 hover:bg-rosado'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Buscar outfits o prendas..."
                className="w-full pl-12 pr-4 py-3 bg-blanco rounded-full border-2 border-rosado focus:border-morado focus:ring-0 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>

          <div className="flex gap-3">
            {shopButtons.map((shop) => {
              const Icon = shop.icon;
              return (
                <button
                  key={shop.name}
                  className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-rosado rounded-2xl transition-all duration-300 group"
                >
                  <Icon className="w-4 h-4 text-gray-900 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-900 text-sm font-medium">{shop.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="p-8 bg-gradient-to-b from-amarillo from-5% via-blanco via-50% to-amarillo to-95% bg-fixed min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-blanco rounded-3xl shadow-sm overflow-hidden">

            <div className="h-36 bg-gradient-to-r from-rosado to-celeste relative">
              <div className="absolute -bottom-6 left-8">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={handlePhotoClick}
                  className={`w-20 h-20 bg-blanco rounded-2xl flex items-center justify-center border-4 border-blanco shadow-md overflow-hidden relative
                    ${isEditing ? 'cursor-pointer group' : 'cursor-default'}`}
                >
                  {uploadingPhoto ? (
                    <div className="w-full h-full flex items-center justify-center bg-rosado/20">
                      <div className="w-6 h-6 border-2 border-morado border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : user.foto_perfil ? (
                    <img src={user.foto_perfil} alt={user.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-morado/40" />
                  )}
                  {isEditing && !uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-blanco" />
                      <span className="text-blanco text-xs mt-1">Cambiar</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute top-4 right-6 flex gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blanco/80 hover:bg-blanco text-morado rounded-2xl transition-all duration-300 text-sm font-medium shadow-sm backdrop-blur-sm"
                  >
                    Editar Perfil
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-blanco/80 hover:bg-blanco text-gray-700 rounded-2xl transition-all duration-300 text-sm font-medium shadow-sm backdrop-blur-sm group"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Salir
                </button>
              </div>
            </div>

            <div className="pt-10 pb-8 px-8">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre</label>
                      <input
                        type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} required
                        className="w-full px-4 py-2.5 border-2 border-celeste rounded-2xl focus:border-morado outline-none transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Apellido</label>
                      <input
                        type="text" name="apellido" value={formData.apellido || ''} onChange={handleChange} required
                        className="w-full px-4 py-2.5 border-2 border-celeste rounded-2xl focus:border-morado outline-none transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Ciudad</label>
                      <input
                        type="text" name="ciudad" value={formData.ciudad || ''} onChange={handleChange}
                        className="w-full px-4 py-2.5 border-2 border-celeste rounded-2xl focus:border-morado outline-none transition-colors text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Biografía</label>
                      <textarea
                        name="bio" value={formData.bio || ''} onChange={handleChange} rows="3"
                        className="w-full px-4 py-2.5 border-2 border-celeste rounded-2xl focus:border-morado outline-none transition-colors text-sm resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox" id="es_privado" name="es_privado"
                        checked={formData.es_privado || false} onChange={handleChange}
                        className="w-4 h-4 accent-morado rounded"
                      />
                      <label htmlFor="es_privado" className="text-sm text-gray-600">Perfil Privado</label>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit" disabled={loading}
                      className="px-7 py-2.5 bg-verde text-blanco rounded-2xl hover:bg-verde/90 transition-all text-sm font-bold shadow-md disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      type="button" onClick={() => { setIsEditing(false); setFormData(user); }}
                      className="px-7 py-2.5 bg-gray-100 text-gray-600 rounded-2xl hover:bg-rosado hover:text-gray-900 transition-all text-sm font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-morado">{user.nombre} {user.apellido}</h2>
                    <p className="text-gray-500 flex items-center gap-2 text-sm mt-1">
                      <Mail className="w-4 h-4" /> {user.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-7">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 text-morado" />
                        <span>{user.ciudad || 'Ciudad no especificada'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 text-morado" />
                        <span>Miembro desde: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recientemente'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 text-sm">
                        {user.es_privado
                          ? <><Lock className="w-4 h-4 text-morado" /><span>Perfil Privado</span></>
                          : <><Globe className="w-4 h-4 text-morado" /><span>Perfil Público</span></>
                        }
                      </div>
                    </div>
                    <div className="bg-rosado/20 border border-rosado/40 rounded-2xl p-5">
                      <h3 className="text-xs font-bold text-morado uppercase tracking-widest mb-2">Biografía</h3>
                      <p className="text-gray-500 text-sm leading-relaxed italic">
                        {user.bio || 'Aún no has añadido una biografía a tu perfil.'}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-10 border-t border-rosado/30 pt-8">
                <div className="flex flex-wrap items-end gap-6 border-b border-gray-200">
                  {[
                    { id: 'armario', label: 'Mi Armario Virtual' },
                    { id: 'outfits', label: 'Outfits' },
                    { id: 'pruebas', label: 'Pruebas' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setArmarioTab(tab.id)}
                      className={`pb-3 text-base font-semibold transition-colors border-b-[3px] -mb-px ${
                        armarioTab === tab.id
                          ? 'text-gray-900 border-gray-900'
                          : 'text-gray-500 border-transparent hover:text-gray-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="pt-6 min-h-[200px]">
                  {armarioTab === 'armario' && (
                    <>
                      <div className="flex justify-end mb-4">
                        <button
                          type="button"
                          onClick={() => navigate('/añadir-prenda')}
                          className="inline-flex items-center gap-2 rounded-full bg-verde text-blanco px-5 py-2.5 text-sm font-bold shadow-md hover:bg-verde/90 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Añadir prenda
                        </button>
                      </div>
                      {wardrobeLoading ? (
                        <p className="text-center text-gray-500 text-sm py-12">Cargando tu armario…</p>
                      ) : prendas.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-rosado/40 bg-rosado/10 py-16 px-6 text-center">
                          <Shirt className="w-12 h-12 text-morado/40 mx-auto mb-3" />
                          <p className="text-gray-600 text-sm mb-4">Aún no tienes prendas en tu armario virtual.</p>
                          <button
                            type="button"
                            onClick={() => navigate('/añadir-prenda')}
                            className="text-morado font-semibold text-sm hover:underline"
                          >
                            Añadir tu primera prenda
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {prendas.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => navigate(`/prenda/${p.id}`)}
                              className="group text-left rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md hover:border-morado/30 transition-all"
                            >
                              <div className="aspect-square bg-gray-50">
                                <img
                                  src={p.imagen_url}
                                  alt={p.nombre || 'Prenda'}
                                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                />
                              </div>
                              <p className="px-3 py-2 text-xs font-medium text-gray-800 line-clamp-2">{p.nombre}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {armarioTab === 'outfits' && (
                    <>
                      <div className="flex justify-end mb-4">
                        <button
                          type="button"
                          onClick={() => navigate('/calendario')}
                          className="inline-flex items-center gap-2 rounded-full bg-verde text-blanco px-5 py-2.5 text-sm font-bold shadow-md hover:bg-verde/90 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Crear outfit
                        </button>
                      </div>
                      {wardrobeLoading ? (
                        <p className="text-center text-gray-500 text-sm py-12">Cargando outfits…</p>
                      ) : outfits.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-rosado/40 bg-rosado/10 py-16 px-6 text-center">
                          <p className="text-gray-600 text-sm mb-4">No tienes outfits guardados.</p>
                          <button
                            type="button"
                            onClick={() => navigate('/calendario')}
                            className="text-morado font-semibold text-sm hover:underline"
                          >
                            Crear uno en el calendario
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {outfits.filter(o => !o.es_clon).map((o) => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => navigate(`/lienzo/${o.id}`)}
                              className="group text-left rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md hover:border-morado/30 transition-all"
                            >
                              <div className="aspect-[4/5] bg-gradient-to-br from-[#f6ccfa] to-[#c2e1f9] flex items-center justify-center">
                                {o.imagen_url ? (
                                  <img
                                    src={o.imagen_url}
                                    alt={o.nombre || 'Outfit'}
                                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                  />
                                ) : (
                                  <span className="text-4xl" aria-hidden>👗</span>
                                )}
                              </div>
                              <p className="px-3 py-2 text-xs font-medium text-gray-800 line-clamp-2">{o.nombre || 'Sin nombre'}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {armarioTab === 'pruebas' && (
                    <div className="rounded-3xl border border-gray-200 bg-white py-20 px-6 text-center">
                      <p className="text-gray-500 text-lg font-medium">Próximamente</p>
                      <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                        Aquí podrás ver las pruebas de try-on de tus outfits. Esta sección está en preparación.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;