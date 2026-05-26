import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { 
  User, MapPin, Mail, Calendar, Lock, Globe, Camera, 
  LogOut, Plus, Shirt, Grid, Search, Pencil, Check, X, Trash2
} from 'lucide-react';
import prendaService from '../services/prendaService';
import outfitService from '../services/outfitService';
import guardadoService from '../services/guardadoService';
import tryonService from '../services/tryonService';

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
  const [guardados, setGuardados] = useState([]);
  const [pruebas, setPruebas] = useState([]);
  const [wardrobeLoading, setWardrobeLoading] = useState(false);
  const [guardadosLoading, setGuardadosLoading] = useState(false);
  const [tryonLoading, setTryonLoading] = useState(false);
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedColor, setSelectedColor] = useState('Todos');

  const fileInputRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const navigate = useNavigate();

  // ✅ NUEVO: detectar si estamos en /perfil/:userId
  const { userId } = useParams();
  const currentLoggedUser = authService.getCurrentUser();
  // isOwner = true si es mi propio perfil, false si estoy viendo el de otro
  const isOwner = !userId || (currentLoggedUser && String(currentLoggedUser.id) === String(userId));

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

  // ✅ NUEVO: carga del usuario — propio o visitado
  useEffect(() => {
    if (!userId) {
      // Ruta /perfil — perfil propio
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        setFormData(currentUser);
      }
    } else {
      // Ruta /perfil/:userId — perfil ajeno, cargar desde Supabase
      const loadVisitedProfile = async () => {
        const { data, error } = await supabase
          .from('users') // tabla correcta según el schema
          .select('id, nombre, apellido, foto_perfil, fondo, ciudad, bio, es_privado, created_at')
          // ⚠️ No seleccionamos email ni password por seguridad
          .eq('id', userId)
          .single();
        if (error || !data) {
          console.error('No se encontró el perfil:', error?.message);
          // Mostramos un estado vacío en vez de redirigir
          setUser(null);
        } else {
          setUser(data);
          setFormData(data);
        }
      };
      loadVisitedProfile();
    }
  }, [userId, navigate]);

  // Carga prendas y outfits del usuario visitado (o propio)
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setWardrobeLoading(true);

    if (isOwner) {
      // Para el dueño usamos los servicios que ya filtran por sesión
      Promise.all([
        prendaService.obtenerTodas().catch(() => []),
        outfitService.obtenerTodos().catch(() => []),
      ])
        .then(([p, o]) => {
          if (cancelled) return;
          setPrendas(Array.isArray(p) ? p : []);
          setOutfits(Array.isArray(o) ? o : []);
        })
        .finally(() => { if (!cancelled) setWardrobeLoading(false); });
    } else {
      // Para visitantes: solo prendas públicas y outfits públicos del usuario visitado
      Promise.all([
        supabase.from("prendas").select("*").eq("user_id", user.id).eq("publico", true).then(({ data }) => data || []),
        supabase.from("outfits").select("*").eq("user_id", user.id).eq("es_publico", true).then(({ data }) => data || []),
      ])
        .then(([p, o]) => {
          if (cancelled) return;
          setPrendas(Array.isArray(p) ? p : []);
          setOutfits(Array.isArray(o) ? o : []);
        })
        .catch(() => { if (!cancelled) { setPrendas([]); setOutfits([]); } })
        .finally(() => { if (!cancelled) setWardrobeLoading(false); });
    }

    return () => { cancelled = true; };
  }, [user?.id, isOwner]);

  // Carga guardados — solo para el dueño
  useEffect(() => {
    if (!user?.id || !isOwner) return;
    let cancelled = false;
    setGuardadosLoading(true);
    guardadoService.obtenerMisGuardados()
      .then(data => {
        if (cancelled) return;
        setGuardados(Array.isArray(data) ? data : []);
      })
      .catch(() => { if (!cancelled) setGuardados([]); })
      .finally(() => { if (!cancelled) setGuardadosLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, isOwner]);

  // Recarga guardados cuando el usuario navega a esa tab
  useEffect(() => {
    if (armarioTab !== 'guardados' || !user?.id || !isOwner) return;
    setGuardadosLoading(true);
    guardadoService.obtenerMisGuardados()
      .then(data => setGuardados(Array.isArray(data) ? data : []))
      .catch(() => setGuardados([]))
      .finally(() => setGuardadosLoading(false));
  }, [armarioTab, user?.id, isOwner]);

  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Carga pruebas de try-on — solo para el dueño
  useEffect(() => {
    if (armarioTab !== 'pruebas' || !user?.id || !isOwner) return;
    let cancelled = false;
    setTryonLoading(true);
    tryonService.obtenerMisPruebas()
      .then(data => {
        if (cancelled) return;
        setPruebas(Array.isArray(data) ? data : []);
      })
      .catch(() => { if (!cancelled) setPruebas([]); })
      .finally(() => { if (!cancelled) setTryonLoading(false); });
    return () => { cancelled = true; };
  }, [armarioTab, user?.id, isOwner]);

  const eliminarPrueba = async (id) => {
    if (!confirm('¿Eliminar esta prueba virtual?')) return;
    try {
      await tryonService.eliminar(id);
      setPruebas(prev => prev.filter(p => p.id !== id));
      setPruebaSeleccionada(null);
    } catch {
      alert('Error al eliminar la prueba');
    }
  };

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setArmarioTab(tab);
  }, [searchParams]);

  const handleDesguardar = async (prendaId) => {
    try {
      await guardadoService.desguardar(prendaId);
      setGuardados(prev => prev.filter(p => String(p.id) !== String(prendaId)));
    } catch {
      setStatusMessage({ type: 'error', text: 'No se pudo quitar de guardados.' });
    }
  };

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
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      const updatedPayload = {
        ...formData,
        ...(type === 'avatar' ? { foto_perfil: publicUrl } : { fondo: publicUrl })
      };
      setUser(updatedPayload);
      setFormData(updatedPayload);
      const result = await authService.updateUser(updatedPayload);
      const backendUser = result?.user || result?.usuario || result;
      const finalUser = {
        ...updatedPayload,
        ...backendUser,
        foto_perfil: updatedPayload.foto_perfil,
        fondo: updatedPayload.fondo
      };
      setUser(finalUser);
      setFormData(finalUser);
      localStorage.setItem('usuario', JSON.stringify(finalUser));
      setStatusMessage({ type: 'success', text: 'Imagen sincronizada correctamente.' });
    } catch (err) {
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
    setLoading(true);
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

  // Si es visitante y no se encontró el perfil, mostrar mensaje amigable
  if (!user && userId) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
      <p className="text-lg font-semibold">No se encontró este perfil.</p>
      <button onClick={() => navigate("/")} className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">Volver al inicio</button>
    </div>
  );

  if (!user) return null;

  const nombreUsuario = user.nombre || '';
  const apellidoUsuario = user.apellido || '';

  // ✅ Tabs que ve el visitante (no tiene acceso a guardados ni pruebas privadas)
  const tabsDisponibles = isOwner
    ? [
        { id: 'armario',   label: 'Mi Armario Virtual' },
        { id: 'outfits',   label: 'Outfits Guardados' },
        { id: 'guardados', label: 'Mis Guardados' },
        { id: 'pruebas',   label: 'Módulo Try-On' },
      ]
    : [
        { id: 'armario', label: 'Armario' },
        { id: 'outfits', label: 'Outfits' },
      ];

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
        
        {/* PORTADA */}
        <div 
          className="h-44 w-full relative bg-cover bg-center border-b border-gray-100"
          style={{ 
            backgroundColor: '#ccc', 
            backgroundImage: user?.fondo ? `url(${user.fondo})` : 'none',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          {/* ✅ Botón cerrar sesión — solo para el dueño */}
          {isOwner && (
            <button 
              onClick={handleLogout}
              className="absolute top-4 right-4 z-30 px-4 py-2.5 text-xs font-bold text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-xl transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          )}

          {/* Inputs de archivo — solo el dueño los usa */}
          {isOwner && (
            <>
              <input type="file" ref={fileInputRef} onChange={(e) => handleUploadMedia(e, 'avatar')} accept="image/*" className="hidden" />
              <input type="file" ref={backgroundInputRef} onChange={(e) => handleUploadMedia(e, 'fondo')} accept="image/*" className="hidden" />
            </>
          )}

          {/* ✅ Overlay editar portada — solo para el dueño en modo edición */}
          {isOwner && isEditing && (
            <div 
              onClick={(e) => { e.stopPropagation(); backgroundInputRef.current.click(); }}
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

        {/* INFORMACIÓN DEL USUARIO */}
        <div className="px-8 pb-6 flex flex-col items-center md:items-start gap-4 border-b border-gray-100 relative bg-white">
          
          {/* ✅ Botón editar — solo para el dueño */}
          {isOwner && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              title="Editar Información de Perfil"
              className="absolute top-4 right-8 p-3 border border-gray-200 hover:border-morado/40 hover:bg-purple-50/30 rounded-xl text-gray-600 hover:text-morado transition-all shadow-sm z-20"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          <div className="flex flex-col items-center md:items-start w-full">
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
                {/* ✅ Overlay cambiar avatar — solo para el dueño en modo edición */}
                {isOwner && isEditing && (
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

            <div className="w-full space-y-4 text-center md:text-left">
              {/* ✅ Formulario de edición — solo para el dueño */}
              {isOwner && isEditing ? (
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
                    {/* ✅ Email solo visible para el dueño */}
                    {isOwner && (
                      <p className="text-sm font-semibold text-gray-400 flex items-center justify-center md:justify-start gap-1.5 mt-1">
                        <Mail className="w-4 h-4 text-gray-300" /> {user.email}
                      </p>
                    )}
                  </div>
                  <p className="text-base text-gray-600 max-w-2xl font-medium leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-gray-100 mx-auto md:mx-0 text-left">
                    {user.bio || '💡 Configurando combinaciones perfectas desde su armario.'}
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

        {/* PESTAÑAS */}
        <div className="flex justify-center px-8 border-b border-gray-100 bg-white w-full">
          {tabsDisponibles.map((tab) => (
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

        {/* CONTENIDO */}
        <div className="p-8 bg-slate-50/50 flex-1">

          {/* TAB: ARMARIO */}
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
                {/* ✅ Botón "Nueva Prenda" — solo para el dueño */}
                {isOwner && (
                  <button
                    onClick={() => navigate('/añadir-prenda')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Nueva Prenda
                  </button>
                )}
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
                {/* ✅ Botón "Diseñar Outfit" — solo para el dueño */}
                {isOwner && (
                  <button
                    onClick={() => navigate('/calendario')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Diseñar Outfit
                  </button>
                )}
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

          {/* TAB: GUARDADOS — solo para el dueño */}
          {armarioTab === 'guardados' && isOwner && (
            <div className="max-w-5xl mx-auto pb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Prendas Guardadas ({guardados.length})
                </h3>
              </div>

              {guardadosLoading ? (
                <div className="text-center py-16">
                  <div className="w-6 h-6 border-2 border-morado border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-medium">Cargando guardados...</p>
                </div>
              ) : guardados.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-12 px-4 text-center shadow-sm max-w-md mx-auto">
                  <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-medium">Aún no has guardado ninguna prenda.</p>
                  <p className="text-gray-300 text-xs mt-1">Explora el feed y guarda las que te inspiren </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto pb-8">
                  {guardados.map((p) => (
                    <div key={p.id} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-morado/40 transition-all text-left shadow-sm hover:shadow">
                      <button
                        onClick={() => navigate(`/prenda/${p.id}`)}
                        className="w-full text-left"
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
                      <button
                        onClick={() => handleDesguardar(p.id)}
                        title="Quitar de guardados"
                        className="absolute top-2 left-2 w-7 h-7 bg-white/90 hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: TRY-ON — solo para el dueño */}
          {armarioTab === 'pruebas' && isOwner && (
            <div className="max-w-5xl mx-auto pb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Pruebas virtuales ({pruebas.length})
                </h3>
                <button
                  onClick={() => navigate('/probar-prenda')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Probar prenda
                </button>
              </div>

              {tryonLoading ? (
                <div className="text-center py-16">
                  <div className="w-6 h-6 border-2 border-morado border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-medium">Cargando pruebas...</p>
                </div>
              ) : pruebas.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-12 px-4 text-center shadow-sm max-w-md mx-auto">
                  <p className="text-3xl mb-2">👗</p>
                  <p className="text-gray-400 text-sm font-medium">No tienes pruebas virtuales aún</p>
                  <p className="text-xs text-gray-300 mt-1">Prueba cómo te quedaría una prenda</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {pruebas.map((prueba) => (
                    <button
                      key={prueba.id}
                      onClick={() => setPruebaSeleccionada(prueba)}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-morado/40 transition-all hover:shadow-md text-left shadow-sm"
                    >
                      <div className="aspect-[2/3] bg-gray-50 flex items-center justify-center overflow-hidden">
                        {prueba.imagen_url ? (
                          <img
                            src={prueba.imagen_url}
                            alt="Prueba virtual"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-3xl">👗</span>
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-50">
                        <p className="text-xs text-gray-400 font-medium">
                          {new Date(prueba.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        {prueba.configuracion_prendas?.tipo_prenda && (
                          <p className="text-[10px] text-gray-300 uppercase font-bold tracking-wider mt-0.5">
                            {prueba.configuracion_prendas.tipo_prenda}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Modal de prueba */}
              {pruebaSeleccionada && (
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  onClick={(e) => e.target === e.currentTarget && setPruebaSeleccionada(null)}
                >
                  <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900">Prueba virtual</p>
                        <p className="text-xs text-gray-400">
                          {new Date(pruebaSeleccionada.created_at).toLocaleDateString('es-ES', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => eliminarPrueba(pruebaSeleccionada.id)}
                          className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title="Eliminar prueba"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        <button
                          onClick={() => setPruebaSeleccionada(null)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 flex items-center justify-center p-4">
                      <img
                        src={pruebaSeleccionada.imagen_url}
                        alt="Resultado try-on"
                        className="max-h-[60vh] object-contain rounded-2xl"
                      />
                    </div>
                    {pruebaSeleccionada.configuracion_prendas && (
                      <div className="px-6 py-4 border-t border-gray-50">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">
                          Prenda probada
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {pruebaSeleccionada.configuracion_prendas.tipo_prenda || 'Sin info'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;