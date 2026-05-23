import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { 
  User, MapPin, Mail, Calendar, Lock, Globe, Camera, 
  LogOut, Plus, Shirt, Grid, Search, Pencil, Check, X
} from 'lucide-react';
import prendaService from '../services/prendaService';
import outfitService from '../services/outfitService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [armarioTab, setArmarioTab] = useState('armario');
  const [prendas, setPrendas] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [wardrobeLoading, setWardrobeLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedColor, setSelectedColor] = useState('Todos');

  const fileInputRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const navigate = useNavigate();

  const coloresFiltro = [
    { nombre: 'Todos', clase: 'bg-gradient-to-tr from-celeste via-rosado to-amarillo border-gray-200' },
    { nombre: 'Blanco', clase: 'bg-white border-gray-200' },
    { nombre: 'Negro', clase: 'bg-gray-950 border-transparent' },
    { nombre: 'Gris', clase: 'bg-gray-400 border-transparent' },
    { nombre: 'Rojo', clase: 'bg-red-400 border-transparent' },
    { nombre: 'Rosado', clase: 'bg-rosado border-transparent' },
    { nombre: 'Azul', clase: 'bg-blue-400 border-transparent' },
    { nombre: 'Verde', clase: 'bg-verde border-transparent' },
    { nombre: 'Amarillo', clase: 'bg-amarillo border-transparent' },
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

  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleUploadMedia = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Solo se permiten archivos de imagen.' });
      return;
    }

    if (type === 'avatar') setUploadingPhoto(true);
    if (type === 'fondo') setUploadingBackground(true);

    const bucketName = 'iconprofile';

    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const fileName = `${type}/${type}_${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { cacheControl: '0', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      
      // Creamos el estado local actualizado con la nueva URL estable
      const updatedPayload = {
        ...formData,
        ...(type === 'avatar' ? { foto_perfil: publicUrl } : { fondo: publicUrl })
      };

      // 1. Forzamos la actualización visual en la pantalla de inmediato
      setUser(updatedPayload);
      setFormData(updatedPayload);

      // 2. Le mandamos los datos al backend para que los guarde en la BD
      const result = await authService.updateUser(updatedPayload);
      
      // 3. Extraemos lo que responda el backend
      const backendUser = result?.user || result?.usuario || result;
      
      // 4. Fusionamos de forma segura: Priorizamos los datos del backend,
      // pero ASEGURAMOS que mantenga las URLs de las imágenes que acabamos de generar.
      const finalUser = {
        ...updatedPayload, // Base con las nuevas imágenes garantizadas
        ...backendUser,    // Datos que el backend quiera actualizar (nombre, bio, etc.)
        foto_perfil: updatedPayload.foto_perfil, // Forzado absoluto
        fondo: updatedPayload.fondo              // Forzado absoluto
      };
      
      // 5. Consolidamos en los estados y almacenamiento local
      setUser(finalUser);
      setFormData(finalUser);
      localStorage.setItem('usuario', JSON.stringify(finalUser));
      
      setStatusMessage({ type: 'success', text: 'Imagen sincronizada correctamente.' });
    } catch (err) {
      console.error("=== ERROR EN LA SUBIDA ===", err);
      setStatusMessage({ type: 'error', text: `Error: ${err.message || 'No se pudo guardar la imagen'}` });
    } finally {
      setUploadingPhoto(false);
      setUploadingBackground(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    loading(true);
    try {
      const result = await authService.updateUser(formData);
      const updatedUser = result.usuario || result.user || result;
      setUser(updatedUser);
      setFormData(updatedUser);
      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      setIsEditing(false);
      setStatusMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'No se pudieron consolidar los cambios del perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const categoriasDisponibles = ['Todas', ...new Set(prendas.map(p => p.categoria || 'Otros'))];

  const prendasFiltradas = prendas.filter(p => {
    const matchesSearch = p.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.categoria === selectedCategory;
    const matchesColor = selectedColor === 'Todos' || p.color?.toLowerCase() === selectedColor.toLowerCase();
    return matchesSearch && matchesCategory && matchesColor;
  });

  if (!user) return null;

  const nombreUsuario = user.nombre || '';
  const apellidoUsuario = user.apellido || '';

  return (
    <div className="h-screen bg-slate-50 text-gray-900 flex justify-center w-full relative selection:bg-rosado/30 overflow-y-scroll scrollbar-thin scrollbar-thumb-morado/20 scrollbar-track-transparent hover:scrollbar-thumb-morado/40 transition-colors">
      
      {statusMessage.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-2 bg-white transition-all ${
          statusMessage.type === 'success' ? 'border-verde text-gray-900' : statusMessage.type === 'error' ? 'border-red-300 text-red-600' : 'border-celeste text-gray-700'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${statusMessage.type === 'success' ? 'bg-verde' : statusMessage.type === 'error' ? 'bg-red-500' : 'bg-celeste'}`} />
          {statusMessage.text}
        </div>
      )}

      <div className="w-full max-w-6xl bg-white h-fit shadow-sm flex flex-col relative mb-12">
        
        {/* PORTADA - AHORA USA EL ESTADO USER ACTUALIZADO EN TIEMPO REAL */}
        <div 
          className="h-44 w-full relative bg-cover bg-center border-b border-gray-100"
          style={{ 
            backgroundColor: '#ccc', 
            backgroundImage: user?.fondo ? `url(${user.fondo})` : 'none',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          <button 
            onClick={handleLogout}
            className="absolute top-4 right-4 z-30 px-4 py-2.5 text-xs font-bold text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-xl transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>

          <input type="file" ref={fileInputRef} onChange={(e) => handleUploadMedia(e, 'avatar')} accept="image/*" className="hidden" />
          <input type="file" ref={backgroundInputRef} onChange={(e) => handleUploadMedia(e, 'fondo')} accept="image/*" className="hidden" />

          {/* OVERLAY DE EDICIÓN EN PORTADA */}
          {isEditing && (
            <div 
              onClick={(e) => {
                e.stopPropagation(); 
                backgroundInputRef.current.click();
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer z-10 text-white"
            >
              <Camera className="w-8 h-8 stroke-[2.5]" />
              <span className="text-xl font-black tracking-wide">Actualizar Portada</span>
              {uploadingBackground && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONTENEDOR DE INFORMACIÓN */}
        <div className="px-8 pb-6 flex flex-col items-center md:items-start gap-4 border-b border-gray-100 relative bg-white">
          
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              title="Editar Información de Perfil"
              className="absolute top-4 right-8 p-3 border border-gray-200 hover:border-morado/40 hover:bg-purple-50/30 rounded-xl text-gray-600 hover:text-morado transition-all shadow-sm z-20"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          <div className="flex flex-col items-center md:items-start w-full">
            
            {/* AVATAR ANCLADO CON MARGEN NEGATIVO */}
            <div className="-mt-16 relative z-20 mb-3 flex-none">
              <div className="w-32 h-32 bg-white rounded-3xl p-1.5 shadow-md overflow-hidden relative border border-gray-100 group/avatar">
                {uploadingPhoto ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <div className="w-6 h-6 border-2 border-morado border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : user.foto_perfil ? (
                  <img src={user.foto_perfil} alt={nombreUsuario} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-2xl">
                    <User className="w-14 h-14 text-gray-300" />
                  </div>
                )}

                {/* OVERLAY DE EDICIÓN EN AVATAR */}
                {isEditing && (
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="absolute inset-0 bg-black/50 backdrop-blur-[1px] opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 text-white cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-xs font-bold">Actualizar</span>
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN DE DATOS O FORMULARIO */}
            <div className="w-full space-y-4 text-center md:text-left">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-3 max-w-xl mx-auto md:mx-0">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-morado transition-colors bg-slate-50" />
                    <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-morado transition-colors bg-slate-50" />
                  </div>
                  <input type="text" name="ciudad" placeholder="Ciudad, País" value={formData.ciudad || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-morado transition-colors bg-slate-50" />
                  <textarea name="bio" placeholder="Describe brevemente tu identidad o estilo..." value={formData.bio || ''} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-base resize-none focus:outline-none focus:border-morado transition-colors bg-slate-50" />
                  <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
                    <input type="checkbox" id="es_privado" name="es_privado" checked={formData.es_privado || false} onChange={handleChange} className="rounded text-morado focus:ring-0 w-4 h-4" />
                    <label htmlFor="es_privado" className="text-sm font-medium text-gray-500">Habilitar cuenta privada</label>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                    <button type="submit" disabled={loading} className="px-5 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> {loading ? 'Guardando...' : 'Confirmar'}
                    </button>
                    <button type="button" onClick={() => { setIsEditing(false); setFormData(user); }} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors inline-flex items-center gap-1.5">
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">{nombreUsuario} {apellidoUsuario}</h2>
                    <p className="text-sm font-semibold text-gray-400 flex items-center justify-center md:justify-start gap-1.5 mt-1">
                      <Mail className="w-4 h-4 text-gray-300" /> {user.email}
                    </p>
                  </div>

                  <p className="text-base text-gray-600 max-w-2xl font-medium leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-gray-100 mx-auto md:mx-0 text-left">
                    {user.bio || '💡 Configurando combinaciones perfectas desde tu armario.'}
                  </p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-2.5 pt-1 text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <MapPin className="w-3.5 h-3.5 text-morado" /> {user.ciudad || 'La Paz, Bolivia'}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <Calendar className="w-3.5 h-3.5 text-celeste" /> Unido el {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recientemente'}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      {user.es_privado ? <><Lock className="w-3.5 h-3.5 text-red-400" /> Privado</> : <><Globe className="w-3.5 h-3.5 text-verde" /> Público</>}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PESTAÑAS DEL ARMARIO */}
        <div className="flex justify-center px-8 border-b border-gray-100 bg-white w-full">
          {[
            { id: 'armario', label: 'Mi Armario Virtual' },
            { id: 'outfits', label: 'Outfits Guardados' },
            { id: 'pruebas', label: 'Módulo Try-On' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setArmarioTab(tab.id)}
              className="py-4 px-6 text-sm font-extrabold relative hover:text-morado transition-colors"
            >
              <span className={armarioTab === tab.id ? 'text-morado' : 'text-gray-400'}>
                {tab.label}
              </span>
              {armarioTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-morado rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* CONTENIDO INTERNO */}
        <div className="p-8 bg-slate-50/50 flex-1">
          {armarioTab === 'armario' && (
            <>
              <div className="w-full max-w-4xl mx-auto mb-8 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 w-4 h-4 text-gray-400 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar prenda..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-50 focus:bg-white border border-transparent focus:border-morado rounded-xl text-sm focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {categoriasDisponibles.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          selectedCategory === cat 
                            ? 'bg-gray-950 border-transparent text-white shadow-sm' 
                            : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2.5 pt-2 border-t border-gray-50 w-full max-w-md">
                  {coloresFiltro.map((col) => (
                    <button
                      key={col.nombre}
                      title={col.nombre}
                      onClick={() => setSelectedColor(col.nombre)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${col.clase} ${
                        selectedColor === col.nombre 
                          ? 'scale-110 ring-2 ring-morado ring-offset-2 z-10' 
                          : 'hover:scale-105'
                      }`}
                    >
                      {selectedColor === col.nombre && (
                        <span className={`w-1.5 h-1.5 rounded-full ${col.nombre === 'Blanco' || col.nombre === 'Amarillo' ? 'bg-gray-800' : 'bg-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prendas ({prendasFiltradas.length})</h3>
                <button
                  onClick={() => navigate('/añadir-prenda')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Nueva Prenda
                </button>
              </div>

              {wardrobeLoading ? (
                <div className="text-center py-16">
                  <div className="w-6 h-6 border-2 border-morado border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-medium">Sincronizando el armario virtual...</p>
                </div>
              ) : prendasFiltradas.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-12 px-4 text-center shadow-sm max-w-md mx-auto">
                  <Shirt className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-medium">No hay ninguna coincidencia en el inventario.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto pb-8">
                  {prendasFiltradas.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/prenda/${p.id}`)}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-morado/40 transition-all text-left shadow-sm hover:shadow"
                    >
                      <div className="aspect-square bg-slate-50 overflow-hidden relative">
                        <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {p.color && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/90 text-[10px] font-bold uppercase text-gray-500 border border-gray-100">
                            {p.color}
                          </div>
                        )}
                      </div>
                      <div className="p-3.5">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-morado transition-colors">{p.nombre}</p>
                        {p.categoria && (
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">{p.categoria}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB: OUTFITS */}
          {armarioTab === 'outfits' && (
            <div className="max-w-5xl mx-auto pb-8">
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => navigate('/calendario')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Diseñar Outfit
                </button>
              </div>
              {outfits.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-12 text-center text-gray-400 text-sm shadow-sm max-w-md mx-auto">
                  No hay combinaciones registradas en este momento.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {outfits.filter(o => !o.es_clon).map((o) => (
                    <button
                      key={o.id}
                      onClick={() => navigate(`/lienzo/${o.id}`)}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-morado/40 transition-all hover:shadow-md text-left shadow-sm"
                    >
                      <div className="aspect-[4/5] bg-gray-50 flex items-center justify-center overflow-hidden">
                        {o.imagen_url ? (
                          <img src={o.imagen_url} alt={o.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <span className="text-3xl">👗</span>
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-50">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-morado transition-colors">{o.nombre || 'Outfit sin título'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: TRY-ON */}
          {armarioTab === 'pruebas' && (
            <div className="bg-white border border-gray-100 rounded-2xl py-16 px-4 text-center shadow-sm max-w-md mx-auto">
              <Grid className="w-8 h-8 text-morado mx-auto mb-2" />
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Probador Inteligente AI</h4>
              <p className="text-gray-400 text-xs mt-1.5 max-w-xs mx-auto leading-relaxed">
                Próximamente podrás superponer tus prendas digitales sobre modelos personalizados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;