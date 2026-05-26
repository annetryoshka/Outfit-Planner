import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { Search, X, Send, ShoppingBag, ExternalLink, Heart, Palette, Sparkles, LayoutGrid, Menu } from 'lucide-react'
import logo6 from '../assets/logo6.png'
import flowerNormal from '../assets/flower2.png'
import flowerHover from '../assets/flower1.png'
import wallpaper5 from '../assets/wallpaper5.png'
import asistenteService from '../services/asistenteService'
import climaService from '../services/climaService'
import prendaService from '../services/prendaService'
import ReactMarkdown from 'react-markdown';
import guardadoService from '../services/guardadoService'

// ── Una sola constante para alinear navbar y header del chat ──
const NAVBAR_HEIGHT = '72px'

// ── Componente PinCard estilo Pinterest ──
const PinCard = ({ item, miUserId, guardadosIds, guardandoId, onNavigate, onEdit, onGuardar }) => {
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleCopyLink = (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}/prenda/${item.id}`
    navigator.clipboard.writeText(url).catch(() => {})
    setMenuOpen(false)
  }

  const handleDownload = async (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!item.imagen_url) return
    try {
      const res = await fetch(item.imagen_url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${item.nombre || 'prenda'}.jpg`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(item.imagen_url, '_blank')
    }
  }

  const esMio = String(item.user_id) === String(miUserId)

  return (
    <div className="mb-4 break-inside-avoid group/pin cursor-pointer" onClick={onNavigate}>

      {/* ── Imagen ── */}
      <div className="relative rounded-2xl overflow-hidden">
        {item.imagen_url
          ? <img src={item.imagen_url} alt={item.nombre} className="w-full object-cover transition-transform duration-500 group-hover/pin:scale-105" />
          : <div className="w-full h-48 bg-gradient-to-br from-[#f6ccfa] to-[#c2e1f9] flex items-center justify-center text-4xl rounded-2xl">👕</div>
        }
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/pin:opacity-100 transition-opacity duration-300 rounded-2xl" />

        {/* Botón acción principal — mismo tamaño de siempre */}
        {esMio ? (
          <button
            onClick={onEdit}
            className="absolute top-4 right-4 bg-[#9f8aef] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover/pin:opacity-100 transition-all duration-300 shadow-md hover:brightness-90">
            Editar
          </button>
        ) : (
          <button
            onClick={onGuardar}
            disabled={guardandoId === item.id}
            className={`absolute top-4 right-4 text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover/pin:opacity-100 transition-all duration-300 shadow-md disabled:opacity-60 hover:brightness-90 ${
              guardadosIds.has(String(item.id)) ? 'bg-[#9f8aef]' : 'bg-[#79d063]'
            }`}>
            {guardandoId === item.id ? '...' : guardadosIds.has(String(item.id)) ? 'Guardado ✓' : 'Guardar'}
          </button>
        )}
      </div>

      {/* ── Fila inferior: nombre + 3 puntitos FUERA de la imagen ── */}
      <div className="mt-2 px-1 flex items-center justify-between gap-2 relative">
        <p className="text-sm font-semibold text-gray-800 truncate flex-1">{item.nombre}</p>

        {/* Botón 3 puntitos */}
        <div className="relative flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(prev => !prev) }}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            {/* Icono 3 puntos horizontales (SVG limpio, sin emojis) */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3" cy="8" r="1.4" fill="#374151"/>
              <circle cx="8" cy="8" r="1.4" fill="#374151"/>
              <circle cx="13" cy="8" r="1.4" fill="#374151"/>
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setMenuOpen(false) }} />
              <div className="absolute bottom-8 right-0 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[170px]">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                >
                  {/* Link icon */}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Copiar enlace
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                >
                  {/* Download icon */}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar imagen
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  )
}

const HomePage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab]       = useState('todos')
  const [isHovered, setIsHovered]       = useState(false)
  const [isChatOpen, setIsChatOpen]     = useState(false)
  const [isMenuOpen, setIsMenuOpen]     = useState(false)

  // ── Estados del chat (Archivo 1 — lógica sagrada) ──
  const [mensajes, setMensajes]         = useState([])
  const [input, setInput]               = useState('')
  const [loadingChat, setLoadingChat]   = useState(false)
  const mensajesRef                     = useRef(null)

  // ── Estados del clima (Archivo 1) ──
  const [clima, setClima]               = useState(null)
  const [loadingClima, setLoadingClima] = useState(true)

  // ── Estados de prendas ──
  // prendasPublicas: feed global (todos los usuarios) — pestaña 'Todos'
  // misPrendas:      solo las del usuario logueado   — pestaña 'Mis Prendas'
  const [prendasPublicas, setPrendasPublicas]   = useState([])
  const [misPrendas, setMisPrendas]             = useState([])
  const [loadingPrendas, setLoadingPrendas]     = useState(true)
  const [prendasMensaje, setPrendasMensaje]     = useState(null)

  // IDs de prendas ya guardadas por el usuario (para estado visual del botón)
  const [guardadosIds, setGuardadosIds] = useState(new Set())
  const [guardandoId, setGuardandoId]   = useState(null) // prenda en proceso

  // ── Effects ──
  useEffect(() => {
    climaService.obtenerUbicacion()
      .then(({ lat, lon }) => climaService.outfitPorCoordenadas(lat, lon))
      .then(data => setClima(data))
      .catch(() => {})
      .finally(() => setLoadingClima(false))
  }, [])

  useEffect(() => {
    // Feed global: no requiere token (endpoint /publicas es abierto)
    prendaService.obtenerPublicas()
      .then(data => setPrendasPublicas(Array.isArray(data) ? data : []))
      .catch(() => setPrendasPublicas([]))

    // Mis prendas: solo si hay token
    const token = localStorage.getItem('token')
    if (!token) {
      setLoadingPrendas(false)
      setPrendasMensaje('login')
      return
    }
    prendaService.obtenerTodas()
      .then(data => { setMisPrendas(Array.isArray(data) ? data : []); setPrendasMensaje(null) })
      .catch(err => { setMisPrendas([]); setPrendasMensaje(err.response?.status === 401 ? 'login' : 'error') })
      .finally(() => setLoadingPrendas(false))
  }, [])

  useEffect(() => {
    // Carga los IDs de prendas ya guardadas para mostrar estado visual correcto
    const token = localStorage.getItem('token')
    if (!token) return
    guardadoService.obtenerMisGuardados()
      .then(data => {
        const ids = new Set((Array.isArray(data) ? data : []).map(p => String(p.id)))
        setGuardadosIds(ids)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (mensajesRef.current) mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
  }, [mensajes])

  const [outfitIA, setOutfitIA] = useState(null)

  useEffect(() => {
    climaService.obtenerUbicacion()
      .then(({ lat, lon }) => climaService.outfitInteligente(lat, lon))
      .then(data => setOutfitIA(data))
      .catch(() => {})
  }, [])

  // ── Lógica del chat
  const enviarMensaje = async (textoAlternativo) => {
  const mensajeAEnviar = textoAlternativo || input;
  if (!mensajeAEnviar.trim() || loadingChat) return;

  const nuevoMensajeUsuario = { role: 'user', content: mensajeAEnviar };
  

  setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
  if (!textoAlternativo) setInput('');
  
  setLoadingChat(true);

  try {
    // 3. Llamamos al servicio (pasa tus prendas reales aquí si tienes el estado)
    const respuestaTexto = await asistenteService.chat(mensajeAEnviar, prendas || []);

    // 4. Creamos el objeto de respuesta de la IA usando '.content' para que tu JSX lo lea bien
    const nuevoMensajeIA = { 
      role: 'assistant', 
      content: respuestaTexto // Aseguramos que se guarde en .content
    };

    // Agregamos la respuesta al estado
    setMensajes((prev) => [...prev, nuevoMensajeIA]);

  } catch (error) {
    console.error("Error al enviar mensaje al asistente:", error);
    setMensajes((prev) => [
      ...prev, 
      { role: 'assistant', content: "Lo siento, hubo un problema al conectar con el asistente." }
    ]);
  } finally {
    setLoadingChat(false);
  }
};

  const toggleGuardar = async (e, prendaId) => {
    e.stopPropagation()
    if (guardandoId === prendaId) return // evita doble click
    const yaGuardado = guardadosIds.has(String(prendaId))
    setGuardandoId(prendaId)
    try {
      if (yaGuardado) {
        await guardadoService.desguardar(prendaId)
        setGuardadosIds(prev => { const next = new Set(prev); next.delete(String(prendaId)); return next })
      } else {
        await guardadoService.guardar(prendaId)
        setGuardadosIds(prev => new Set([...prev, String(prendaId)]))
      }
    } catch {
      // Si falla, no cambia el estado visual — silencioso
    } finally {
      setGuardandoId(null)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje() }
  }

  // ── Datos estáticos ──
  const suggestions = [
    { id: 1, text: 'Armar un outfit para una cita',       icon: Heart      },
    { id: 2, text: '¿Qué colores combinan con negro?',    icon: Palette    },
    { id: 3, text: 'Tendencias de moda para este invierno', icon: Sparkles },
    { id: 4, text: 'Organizar mi armario por ocasiones',  icon: LayoutGrid },
  ]

  const tabs = [
    { id: 'todos',      label: 'Todos'      },
    { id: 'mis-prendas', label: 'Mis Prendas' },
  ]

  const shopButtons = [
    { 
      name: 'AliExpress', 
      url: 'https://www.aliexpress.com',
      color: '#FF4747',
      letter: 'A',
      shape: 'circle'
    },
    { 
      name: 'SHEIN', 
      url: 'https://www.shein.com',
      color: '#000000',
      letter: 'S',
      shape: 'square'
    },
  ]

  const breakpointColumnsObj = isChatOpen
    ? { default: 3, 1200: 2, 900: 2, 600: 1, 400: 1 }
    : { default: 5, 1200: 4, 900: 3, 600: 2, 400: 1 }

  // ── Estado de búsqueda ──
  const [busqueda, setBusqueda] = useState('')

  // ID del usuario logueado — decodificado del JWT en localStorage
  const miUserId = (() => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.id ?? payload.sub ?? payload.user_id ?? null
    } catch { return null }
  })()

  // Etiquetas activas del banner (multi-select, actúan como filtro combinado)
  const [selectedTags, setSelectedTags] = useState([])

  // Etiquetas dinámicas — diccionario de deseos por clima intersectado con el clóset real
  const etiquetasDinamicas = useMemo(() => {
    if (!clima?.clima?.temperatura) return []
    const temp = clima.clima.temperatura
    const n = (s) => (s || '').toLowerCase().trim()

    // Diccionario de deseos por rango de temperatura
    // (NO incluye tipos genéricos: superior/inferior/calzado/accesorio/otros)
    const DESEOS = temp < 15
      ? {
          categorias: ['abrigo', 'chaquetas', 'bufanda', 'guantes', 'pantalón', 'jeans'],
          materiales: ['lana', 'polar', 'corderoy', 'cuero'],
          temporadas: ['invierno', 'otoño'],
          colores:    ['negro', 'marrón', 'gris', 'azul', 'morado'],
        }
      : temp <= 22
      ? {
          categorias: ['camisa', 'blusa', 'chaquetas', 'jeans', 'pantalón', 'bolso'],
          materiales: ['algodón', 'denim', 'poliéster'],
          temporadas: ['primavera', 'otoño'],
          colores:    ['beige', 'rosa', 'celeste', 'blanco', 'verde claro'],
        }
      : {
          categorias: ['shorts', 'vestido', 'falda', 'polera', 'blusa', 'camisa'],
          materiales: ['lino', 'seda', 'algodón'],
          temporadas: ['verano', 'primavera'],
          colores:    ['blanco', 'amarillo', 'rosa', 'celeste', 'verde'],
        }

    // Todas las palabras deseadas en orden de prioridad visual
    const palabrasDeseadas = [
      ...DESEOS.categorias,
      ...DESEOS.materiales,
      ...DESEOS.temporadas,
      ...DESEOS.colores,
    ]

    // Construye un Set con todos los valores normalizados del clóset del usuario
    const fuente = misPrendas.length > 0 ? misPrendas : prendasPublicas
    const enCloset = new Set()
    for (const item of fuente) {
      ;[item.categoria, item.material, item.temporada, item.color].forEach(v => {
        const norm = n(v)
        if (norm) enCloset.add(norm)
      })
    }

    // Intersección: solo las palabras deseadas que existen en el clóset, hasta 7
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
    const etiquetas = []
    for (const palabra of palabrasDeseadas) {
      if (enCloset.has(palabra)) {
        etiquetas.push(cap(palabra))
        if (etiquetas.length >= 7) break
      }
    }

    // Si el clóset tiene pocas coincidencias, completa con las palabras deseadas directamente
    if (etiquetas.length < 4) {
      for (const palabra of palabrasDeseadas) {
        const label = cap(palabra)
        if (!etiquetas.includes(label)) {
          etiquetas.push(label)
          if (etiquetas.length >= 7) break
        }
      }
    }

    return etiquetas
  }, [clima, misPrendas, prendasPublicas])

  // Seleccion de fuente segun pestana activa
  // 'todos'       -> prendasPublicas (viene de GET /prendas/publicas — todos los usuarios)
  // 'mis-prendas' -> misPrendas     (viene de GET /prendas          — solo el usuario logueado)
  const prendasPorTab = activeTab === 'todos' ? prendasPublicas : misPrendas

  // Filtro acumulativo AND: cada tag seleccionado debe estar en algún campo de la prenda
  const prendasMostradas = useMemo(() => {
    let lista = prendasPorTab

    // Multi-select: la prenda debe cumplir TODOS los tags seleccionados
    if (selectedTags.length > 0) {
      lista = lista.filter(item =>
        selectedTags.every(tag => {
          const q = tag.toLowerCase()
          return (
            item.tipo?.toLowerCase().includes(q)      ||
            item.categoria?.toLowerCase().includes(q) ||
            item.material?.toLowerCase().includes(q)  ||
            item.temporada?.toLowerCase().includes(q) ||
            item.color?.toLowerCase().includes(q)     ||
            item.nombre?.toLowerCase().includes(q)
          )
        })
      )
    }

    // Barra de búsqueda convive con el multi-select
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      lista = lista.filter(item =>
        item.nombre?.toLowerCase().includes(q)    ||
        item.tipo?.toLowerCase().includes(q)      ||
        item.categoria?.toLowerCase().includes(q) ||
        item.material?.toLowerCase().includes(q)  ||
        item.temporada?.toLowerCase().includes(q) ||
        item.color?.toLowerCase().includes(q)     ||
        item.marca?.toLowerCase().includes(q)
      )
    }
    return lista
  }, [prendasPorTab, busqueda, selectedTags])

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">

      {/* ── Navbar — ancho completo, siempre arriba ── */}
      <header
        className="w-full flex-shrink-0 z-30 bg-white shadow-sm"
        style={{ height: NAVBAR_HEIGHT }}
      >
        {/* CONTENEDOR PRINCIPAL DEL NAVBAR */}
        <nav className="w-full h-full flex items-center justify-between px-8 bg-white border-b border-gray-100">
          
          {/* BLOQUE IZQUIERDO: Logo y botones de navegación */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* Logotipo */}
            <button
              onClick={() => navigate('/')}
              className="h-10 w-auto cursor-pointer hover:opacity-90 transition-all flex-shrink-0"
            >
              <img src={logo6} alt="PinWand" className="h-full w-auto object-contain" />
            </button>

            {/* Botón 'Todos' */}
            <nav className="hidden md:flex gap-3 items-center flex-shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium transition-all duration-300 rounded-2xl ${
                    activeTab === tab.id
                      ? 'bg-[#9f8aef] text-white'
                      : 'text-gray-900 hover:bg-[#f6ccfa]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* BLOQUE CENTRAL: El buscador estirado */}
          <div className="flex-1 mx-12 max-w-4xl hidden md:flex">
            <div className="w-full relative flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Buscar outfits o prendas..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-2 border-[#f6ccfa] focus:border-[#9f8aef] focus:ring-0 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>

          {/* BLOQUE DERECHO: Botones de tiendas */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="hidden md:flex gap-4 items-center">
              {shopButtons.map((shop) => (
                <a
                  key={shop.name}
                  href={shop.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#f6ccfa] rounded-full hover:bg-[#f6ccfa] transition-all duration-300 group"
                >
                  {shop.shape === 'circle' ? (
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: shop.color }}
                    >
                      <span className="text-white text-xs font-bold">{shop.letter}</span>
                    </div>
                  ) : (
                    <div 
                      className="w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: shop.color }}
                    >
                      <span className="text-white text-xs font-bold">{shop.letter}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{shop.name}</span>
                </a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-gray-900 hover:bg-[#f6ccfa] rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </nav>

        {/* Mobile Menu Sidebar */}
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-semibold text-[#9f8aef]">Menú</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-[#f6ccfa] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[#9f8aef]" />
                  </button>
                </div>
                
                <nav className="flex flex-col space-y-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setIsMenuOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 font-medium transition-all duration-300 rounded-xl ${
                        activeTab === tab.id
                          ? 'bg-[#9f8aef] text-white'
                          : 'text-gray-900 hover:bg-[#f6ccfa]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Tiendas</p>
                  <div className="flex flex-col space-y-3">
                    {shopButtons.map((shop) => (
                      <a
                        key={shop.name}
                        href={shop.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-[#f6ccfa] rounded-xl hover:bg-[#f6ccfa] transition-all duration-300"
                      >
                        {shop.shape === 'circle' ? (
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: shop.color }}
                          >
                            <span className="text-white text-xs font-bold">{shop.letter}</span>
                          </div>
                        ) : (
                          <div 
                            className="w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: shop.color }}
                          >
                            <span className="text-white text-xs font-bold">{shop.letter}</span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-700">{shop.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* ══ ZONA INFERIOR: galería + panel ══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Galería ── */}
        <div className="flex-1 overflow-y-auto transition-all duration-500 ease-in-out">
          <main className="p-8 bg-gradient-to-b from-[#fafbad] from-5% via-white via-50% to-[#fafbad] to-95% bg-fixed min-h-full">

            {/* Banners clima + outfit */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">

              {/* Banner clima — solo en pestaña 'Todos' */}
              {activeTab === 'todos' && !loadingClima && clima && (
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#f6ccfa] px-5 py-3 flex items-center gap-4">
                  {/* Bloque izquierdo: temp + ciudad */}
                  <div className="flex flex-col flex-shrink-0">
                    <span className="text-[0.6rem] text-gray-400 uppercase tracking-widest leading-tight">Clima en {clima.clima.ciudad}</span>
                    <span className="text-lg font-bold text-[#9f8aef] leading-tight">{clima.clima.temperatura}°C</span>
                    <span className="text-[0.6rem] text-gray-500 capitalize leading-tight">{clima.clima.descripcion}</span>
                  </div>
                  <div className="w-px h-6 bg-[#f6ccfa] flex-shrink-0" />
                  {/* Bloque derecho: mensaje + etiquetas dinámicas clickeables */}
                  <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-gray-700 flex-shrink-0">{clima.sugerencia.mensaje}</p>
                    {etiquetasDinamicas.length > 0
                      ? etiquetasDinamicas.map((etiqueta, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedTags(prev =>
                              prev.includes(etiqueta)
                                ? prev.filter(t => t !== etiqueta)
                                : [...prev, etiqueta]
                            )}
                            className={`text-sm px-4 py-1.5 rounded-full border shadow-sm whitespace-nowrap font-medium transition-all duration-200 ${
                              selectedTags.includes(etiqueta)
                                ? 'bg-[#9f8aef] text-white border-[#9f8aef]'
                                : 'bg-white text-gray-900 border-[#9f8aef] hover:bg-[#f6ccfa]/40'
                            }`}
                          >
                            {etiqueta}
                          </button>
                        ))
                      : clima.sugerencia.prendas.map((p, i) => (
                          <span key={i} className="bg-white text-gray-900 text-sm px-4 py-1.5 rounded-full border border-[#9f8aef] shadow-sm whitespace-nowrap font-medium">{p}</span>
                        ))
                    }
                  </div>
                </div>
              )}

              {/* Banner outfit IA — solo en pestaña 'Mis Prendas' */}
              {activeTab === 'mis-prendas' && outfitIA && outfitIA.tiene_prendas && (
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#f6ccfa] px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest">Outfit del día ✨</p>
                      <p className="text-sm font-medium text-gray-700 mt-1">{outfitIA.mensaje}</p>
                    </div>
                    <span className="text-xs bg-[#f6ccfa]/50 text-[#9f8aef] px-3 py-1 rounded-full">{outfitIA.consejo}</span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {Object.entries(outfitIA.outfit_del_dia).map(([tipo, prenda]) => (
                      <div key={tipo} className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#f6ccfa] to-[#c2e1f9] flex items-center justify-center overflow-hidden">
                          {prenda.imagen_url
                            ? <img src={prenda.imagen_url} alt={prenda.nombre} className="w-full h-full object-cover" />
                            : <div className="w-8 h-8 bg-[#9f8aef]/20 rounded-lg" />
                          }
                        </div>
                        <p className="text-xs text-gray-600 text-center max-w-16 truncate">{prenda.nombre}</p>
                        <span className="text-[0.6rem] text-gray-400 capitalize">{tipo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ── Estados de carga y error (aplican para ambas pestañas) ── */}
            {loadingPrendas && (
              <p className="text-center text-gray-500 py-12">Cargando tu armario…</p>
            )}
            {!loadingPrendas && prendasMensaje === 'login' && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Inicia sesión para ver las prendas de tu armario.</p>
                <button onClick={() => navigate('/login')}
                  className="px-6 py-3 rounded-2xl bg-[#9f8aef] text-white font-medium hover:opacity-90">
                  Iniciar sesión
                </button>
              </div>
            )}
            {!loadingPrendas && prendasMensaje === 'error' && (
              <p className="text-center text-red-500 py-12">No se pudieron cargar las prendas.</p>
            )}

            {/* ── Galería con Masonry (ambas pestañas) ── */}
            {!loadingPrendas && !prendasMensaje && (
              <>
                {/* Sin prendas publicas en 'todos' */}
                {activeTab === 'todos' && prendasPublicas.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Aún no tienes prendas. ¡Añade la primera!</p>
                    <button onClick={() => navigate('/añadir-prenda')}
                      className="px-6 py-3 rounded-2xl bg-[#79d063] text-white font-medium hover:opacity-90">
                      Añadir prenda
                    </button>
                  </div>
                )}

                {/* Clóset vacío en 'mis-prendas' */}
                {activeTab === 'mis-prendas' && prendasMostradas.length === 0 && (
                  <div className="text-center py-16 px-4">
                    <p className="text-4xl mb-4">👗</p>
                    <p className="text-gray-700 font-medium text-lg mb-2">
                      ¡Tu clóset está vacío!
                    </p>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                      Empieza a subir tus prendas favoritas para que la IA te arme un Outfit del Día 💜✨
                    </p>
                    <button onClick={() => navigate('/añadir-prenda')}
                      className="mt-6 px-6 py-3 rounded-2xl bg-[#9f8aef] text-white font-medium hover:opacity-90 transition-opacity">
                      Subir mi primera prenda
                    </button>
                  </div>
                )}

                {/* Grid Masonry — estilo Pinterest puro */}
                {prendasMostradas.length > 0 && (
                  <Masonry breakpointCols={breakpointColumnsObj} className="flex gap-4" columnClassName="flex-1">
                    {prendasMostradas.map(item => (
                      <PinCard
                        key={item.id}
                        item={item}
                        miUserId={miUserId}
                        guardadosIds={guardadosIds}
                        guardandoId={guardandoId}
                        onNavigate={() => navigate(`/prenda/${item.id}`)}
                        onEdit={e => { e.stopPropagation(); navigate(`/editar-prenda/${item.id}`) }}
                        onGuardar={e => toggleGuardar(e, item.id)}
                      />
                    ))}
                  </Masonry>
                )}
              </>
            )}

          </main>
        </div>

        {/* ══ PANEL DE CHAT — flotante, redondeado, solo en zona de galería ══ */}
        <div className={`transition-all duration-500 ease-in-out flex-shrink-0 overflow-hidden ${
          isChatOpen ? 'w-[420px] opacity-100' : 'w-0 opacity-0'
        }`}>
          <div className="h-full py-4 pr-4">
            <div
              className="h-full flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/40"
              style={{
                backgroundImage: `url(${wallpaper5})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >

              {/* Header del chat — mismo alto que navbar */}
              <div
                className="flex items-center justify-between px-5 bg-[#9f8aef] flex-shrink-0"
                style={{ height: NAVBAR_HEIGHT }}
              >
                <div className="flex items-center gap-2">
                  <img src={flowerNormal} alt="IA Stylist"
                    className="w-7 h-7 object-contain border border-white rounded-full" />
                  <h3 className="text-base font-semibold text-white">IA Stylist</h3>
                </div>
                <button
                  onClick={() => { setIsChatOpen(false); setIsHovered(false) }}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* ── Área de mensajes ── */}
              <div ref={mensajesRef} className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-3">

                  {mensajes.length === 0 && (
                    <div className="flex flex-col gap-3">
                      <p className="text-gray-600 text-sm font-medium mb-1">¿En qué puedo ayudarte?</p>
                      {suggestions.map(({ id, text, icon: Icon }) => (
                        <button key={id} onClick={() => enviarMensaje(text)}
                          className="flex items-center gap-3 p-3 bg-white border border-[#9f8aef] rounded-2xl hover:bg-gray-50 transition-colors text-left self-start w-full">
                          <Icon className="w-4 h-4 text-[#9f8aef] flex-shrink-0" />
                          <span className="text-gray-800 text-sm">{text}</span>
                        </button>
                      ))}
                    </div>
                  )}

                {/* Burbujas de mensajes */}
                {mensajes.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      m.role === 'user'
                        ? 'bg-[#c2e1f9] border border-black/10 text-gray-800 rounded-br-sm'
                        : 'bg-white border border-[#9f8aef] text-gray-700 rounded-bl-sm'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}

                  {loadingChat && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-[#9f8aef] px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1">
                        {[0, 150, 300].map(d => (
                          <span key={d} className="w-2 h-2 bg-[#9f8aef] rounded-full animate-bounce"
                            style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* ── Input ── */}
              <div className="p-4 flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200/40">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe tu mensaje..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    className="flex-1 px-4 py-2.5 bg-white/90 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#9f8aef] focus:border-transparent"
                  />
                  <button
                    onClick={() => enviarMensaje()}
                    disabled={!input.trim() || loadingChat}
                    className="w-10 h-10 bg-[#9f8aef] rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-[#8a74e0] transition-colors flex-shrink-0">
                    <Send size={15} color="white" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ══ BOTÓN FLOTANTE ══ */}
      <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ease-in-out ${
        isChatOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'
      }`}>
        <div className="relative group">
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="relative bg-[#9f8aef] text-white px-4 py-2 rounded-2xl text-sm whitespace-nowrap shadow-lg">
              ¡Hola! Soy tu IA Stylist
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-[#9f8aef]" />
            </div>
          </div>
          <button
            onClick={() => setIsChatOpen(true)}
            onMouseEnter={() => !isChatOpen && setIsHovered(true)}
            onMouseLeave={() => !isChatOpen && setIsHovered(false)}
            className={`w-20 h-20 rounded-full shadow-lg transition-all duration-500 ease-out flex items-center justify-center ${
              isHovered && !isChatOpen ? 'transform scale-110 rotate-12 shadow-2xl' : 'transform scale-100 rotate-0'
            }`}>
            <img
              src={isHovered && !isChatOpen ? flowerHover : flowerNormal}
              alt="IA Stylist"
              className={`w-full h-full object-contain rounded-full ${
                isHovered && !isChatOpen ? 'animate-[spin_20s_linear_infinite]' : ''
              }`}
            />
          </button>
        </div>
      </div>

    </div>
  )
}

export default HomePage