import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { Search, X, Send, ShoppingBag, ExternalLink, Heart, Palette, Sparkles, LayoutGrid, Menu } from 'lucide-react'
import logo3 from '../assets/logo3.png'
import flowerNormal from '../assets/flower2.png'
import flowerHover from '../assets/flower1.png'
import asistenteService from '../services/asistenteService'
import climaService from '../services/climaService'
import prendaService from '../services/prendaService'
import ReactMarkdown from 'react-markdown';

// ── Una sola constante para alinear navbar y header del chat ──
const NAVBAR_HEIGHT = '72px'

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

  // ── Estados de prendas (Archivo 1) ──
  const [prendas, setPrendas]           = useState([])
  const [loadingPrendas, setLoadingPrendas] = useState(true)
  const [prendasMensaje, setPrendasMensaje] = useState(null)

  // ── Effects (Archivo 1 — sin tocar) ──
  useEffect(() => {
    climaService.obtenerUbicacion()
      .then(({ lat, lon }) => climaService.outfitPorCoordenadas(lat, lon))
      .then(data => setClima(data))
      .catch(() => {})
      .finally(() => setLoadingClima(false))
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoadingPrendas(false)
      setPrendasMensaje('login')
      return
    }
    prendaService.obtenerTodas()
      .then(data => { setPrendas(Array.isArray(data) ? data : []); setPrendasMensaje(null) })
      .catch(err => { setPrendas([]); setPrendasMensaje(err.response?.status === 401 ? 'login' : 'error') })
      .finally(() => setLoadingPrendas(false))
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
    { id: 'inspo',      label: 'Inspo'      },
    { id: 'products',   label: 'Products'   },
  ]

  const shopButtons = [
    { name: 'Shein',      icon: ShoppingBag  },
    { name: 'AliExpress', icon: ExternalLink },
  ]

  const breakpointColumnsObj = isChatOpen
    ? { default: 3, 1200: 2, 900: 2, 600: 1, 400: 1 }
    : { default: 5, 1200: 4, 900: 3, 600: 2, 400: 1 }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">

      {/* ── Navbar — ancho completo, siempre arriba ── */}
      <header
        className="w-full flex-shrink-0 z-30 bg-white shadow-sm px-8 flex items-center"
        style={{ height: NAVBAR_HEIGHT }}
      >
        <div className="flex items-center justify-between w-full">

          <button
            onClick={() => navigate('/')}
            className="h-10 w-auto cursor-pointer mr-6 hover:opacity-90 transition-all flex-shrink-0"
          >
            <img src={logo3} alt="PinWand" className="h-full w-auto object-contain" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-4 items-center flex-shrink-0">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 text-gray-900 hover:bg-[#f6ccfa] rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex flex-1 ml-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Buscar outfits o prendas..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-2 border-[#f6ccfa] focus:border-[#9f8aef] focus:ring-0 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>

          {/* Mobile Menu Sidebar */}
          {isMenuOpen && (
            <>
              {/* Overlay */}
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Mobile Menu Sidebar */}
              <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
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
                </div>
              </div>
            </>
          )}

        </div>
      </header>

      {/* ══ ZONA INFERIOR: galería + panel ══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Galería ── */}
        <div className="flex-1 overflow-y-auto transition-all duration-500 ease-in-out">
          <main className="p-8 bg-gradient-to-b from-[#fafbad] from-5% via-white via-50% to-[#fafbad] to-95% bg-fixed min-h-full">

        {/* Banners clima + outfit */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">

          {/* Banner clima */}
          {!loadingClima && clima && (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#f6ccfa] px-6 py-4 flex items-center gap-4">
              <div className="flex flex-col flex-shrink-0">
                <span className="text-xs text-gray-400 uppercase tracking-widest">Clima en {clima.clima.ciudad}</span>
                <span className="text-2xl font-bold text-[#9f8aef]">{clima.clima.temperatura}°C</span>
                <span className="text-sm text-gray-500 capitalize">{clima.clima.descripcion}</span>
              </div>
              <div className="w-px h-12 bg-[#f6ccfa]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">{clima.sugerencia.mensaje}</p>
                <div className="flex flex-wrap gap-2">
                  {clima.sugerencia.prendas.map((p, i) => (
                    <span key={i} className="bg-[#f6ccfa]/50 text-[#9f8aef] text-xs px-3 py-1 rounded-full">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Banner outfit IA */}
          {outfitIA && outfitIA.tiene_prendas && (
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

            {/* Estados de prendas */}
            {activeTab === 'todos' && loadingPrendas && (
              <p className="text-center text-gray-500 py-12">Cargando tu armario…</p>
            )}
            {activeTab === 'todos' && !loadingPrendas && prendasMensaje === 'login' && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Inicia sesión para ver las prendas de tu armario.</p>
                <button onClick={() => navigate('/login')}
                  className="px-6 py-3 rounded-2xl bg-[#9f8aef] text-white font-medium hover:opacity-90">
                  Iniciar sesión
                </button>
              </div>
            )}
            {activeTab === 'todos' && !loadingPrendas && prendasMensaje === 'error' && (
              <p className="text-center text-red-500 py-12">No se pudieron cargar las prendas.</p>
            )}
            {activeTab === 'todos' && !loadingPrendas && !prendasMensaje && prendas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Aún no tienes prendas. ¡Añade la primera!</p>
                <button onClick={() => navigate('/añadir-prenda')}
                  className="px-6 py-3 rounded-2xl bg-[#79d063] text-white font-medium hover:opacity-90">
                  Añadir prenda
                </button>
              </div>
            )}
            {activeTab !== 'todos' && (
              <p className="text-center text-gray-500 py-12">Esta sección estará disponible pronto.</p>
            )}
            {activeTab === 'todos' && !loadingPrendas && !prendasMensaje && prendas.length > 0 && (
              <Masonry breakpointCols={breakpointColumnsObj} className="flex gap-6" columnClassName="flex-1">
                {prendas.map(item => (
                  <div key={item.id} className="mb-6 break-inside-avoid">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/prenda/${item.id}`)}>
                      <div className="relative overflow-hidden">
                        {item.imagen_url
                          ? <img src={item.imagen_url} alt={item.nombre} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          : <div className="w-full h-48 bg-gradient-to-br from-[#f6ccfa] to-[#c2e1f9] flex items-center justify-center text-4xl">👕</div>
                        }
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <button onClick={e => e.stopPropagation()}
                          className="absolute top-4 right-4 bg-[#79d063] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Guardar
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-700 truncate">{item.nombre}</p>
                        {item.tipo && <p className="text-xs text-gray-400 capitalize">{item.tipo}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </Masonry>
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
                backgroundImage: "url('/src/assets/wallpaper4.png')",
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

                  {/* Quick actions cuando no hay mensajes */}
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

                  {/* Indicador de typing */}
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
