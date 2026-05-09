import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { ShoppingBag, ExternalLink, Search, X, Send } from 'lucide-react'
import logo3 from '../assets/logo3.png'
import flowerNormal from '../assets/flower2.png'
import flowerHover from '../assets/flower1.png'
import asistenteService from '../services/asistenteService'
import climaService from '../services/climaService'
import prendaService from '../services/prendaService'

const HomePage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('todos')
  const [isHovered, setIsHovered] = useState(false)
  const [clima, setClima] = useState(null)
  const [loadingClima, setLoadingClima] = useState(true)

  useEffect(() => {
    climaService.obtenerUbicacion()
      .then(({ lat, lon }) => climaService.outfitPorCoordenadas(lat, lon))
      .then(data => setClima(data))
      .catch(() => {})
      .finally(() => setLoadingClima(false))
  }, [])

  const [prendas, setPrendas] = useState([])
  const [loadingPrendas, setLoadingPrendas] = useState(true)
  const [prendasMensaje, setPrendasMensaje] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoadingPrendas(false)
      setPrendasMensaje('login')
      return
    }
    prendaService
      .obtenerTodas()
      .then((data) => {
        setPrendas(Array.isArray(data) ? data : [])
        setPrendasMensaje(null)
      })
      .catch((err) => {
        setPrendas([])
        if (err.response?.status === 401) setPrendasMensaje('login')
        else setPrendasMensaje('error')
      })
      .finally(() => setLoadingPrendas(false))
  }, [])
  const [chatAbierto, setChatAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu IA Stylist 🌸 ¿En qué puedo ayudarte hoy?' }
  ])
  const [input, setInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const mensajesRef = useRef(null)

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  const enviarMensaje = async () => {
    if (!input.trim() || loadingChat) return
    const texto = input.trim()
    setInput('')
    setMensajes(prev => [...prev, { role: 'user', content: texto }])
    setLoadingChat(true)
    try {
      const data = await asistenteService.chat(texto)
      setMensajes(prev => [...prev, { role: 'assistant', content: data.respuesta }])
    } catch (err) {
      setMensajes(prev => [...prev, { role: 'assistant', content: 'Ups, algo salió mal. Intenta de nuevo 😅' }])
    } finally {
      setLoadingChat(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'inspo', label: 'Inspo' },
    { id: 'products', label: 'Products' },
  ]

  const shopButtons = [
    { name: 'Shein', icon: ShoppingBag },
    { name: 'AliExpress', icon: ExternalLink },
  ]

  const breakpointColumnsObj = { default: 5, 1200: 4, 900: 3, 600: 2, 400: 1 }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white shadow-sm px-8 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="h-10 w-auto cursor-pointer mr-6 hover:opacity-90 transition-all">
            <img src={logo3} alt="PinWand" className="h-full w-auto object-contain" />
          </button>
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-all duration-300 rounded-2xl ${activeTab === tab.id ? 'bg-[#9f8aef] text-white' : 'text-gray-900 hover:bg-[#f6ccfa]'}`}>
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex-1 mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input type="text" placeholder="Buscar outfits o prendas..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-2 border-[#f6ccfa] focus:border-[#9f8aef] focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-600" />
            </div>
          </div>
          <div className="flex gap-3">
            {shopButtons.map((shop) => {
              const Icon = shop.icon
              return (
                <button key={shop.name} className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-[#f6ccfa] rounded-2xl transition-all duration-300 group">
                  <Icon className="w-4 h-4 text-gray-900 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-900 text-sm font-medium">{shop.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="p-8 bg-gradient-to-b from-[#fafbad] from-5% via-white via-50% to-[#fafbad] to-95% min-h-screen">
      {!loadingClima && clima && (
          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-[#f6ccfa] px-6 py-4 flex items-center gap-6">
            <div className="flex flex-col">
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
        {activeTab === 'todos' && loadingPrendas && (
          <p className="text-center text-gray-600 py-12">Cargando tu armario…</p>
        )}
        {activeTab === 'todos' && !loadingPrendas && prendasMensaje === 'login' && (
          <div className="text-center py-12 text-gray-700">
            <p className="mb-4">Inicia sesión para ver las prendas de tu armario.</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-2xl bg-[#9f8aef] text-white font-medium hover:opacity-90"
            >
              Ir a iniciar sesión
            </button>
          </div>
        )}
        {activeTab === 'todos' && !loadingPrendas && prendasMensaje === 'error' && (
          <p className="text-center text-red-600 py-12">No se pudieron cargar las prendas. Revisa que el servidor esté en marcha.</p>
        )}
        {activeTab === 'todos' && !loadingPrendas && !prendasMensaje && prendas.length === 0 && (
          <div className="text-center py-12 text-gray-700">
            <p className="mb-4">Aún no tienes prendas. ¡Añade la primera!</p>
            <button
              type="button"
              onClick={() => navigate('/añadir-prenda')}
              className="px-6 py-3 rounded-2xl bg-[#79d063] text-white font-medium hover:opacity-90"
            >
              Añadir prenda
            </button>
          </div>
        )}
        {activeTab !== 'todos' && (
          <p className="text-center text-gray-600 py-12">Esta sección estará disponible pronto.</p>
        )}
        {activeTab === 'todos' && !loadingPrendas && !prendasMensaje && prendas.length > 0 && (
        <Masonry breakpointCols={breakpointColumnsObj} className="flex gap-6" columnClassName="flex-1">
          {prendas.map((item) => (
            <div key={item.id} className="mb-6 break-inside-avoid">
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/prenda/${item.id}`)}>
                <div className="relative overflow-hidden">
                  <img src={item.imagen_url} alt={item.nombre || 'Prenda'} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button onClick={(e) => e.stopPropagation()}
                    className="absolute top-4 right-4 bg-[#79d063] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#79d063]/90">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
        )}
      </main>

      {/* Chat Modal */}
      {chatAbierto && (
        <div className="fixed bottom-36 right-8 z-50 w-80 bg-white rounded-3xl shadow-2xl border border-[#f6ccfa] flex flex-col overflow-hidden"
          style={{ height: '420px' }}>
          {/* Header chat */}
          <div className="bg-[#9f8aef] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <img src={flowerNormal} alt="IA" className="w-7 h-7 rounded-full" />
              <span className="text-white text-sm font-medium">IA Stylist</span>
            </div>
            <button onClick={() => setChatAbierto(false)} className="text-white hover:text-white/70 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Mensajes */}
          <div ref={mensajesRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#9f8aef] text-white rounded-br-sm'
                    : 'bg-[#f6ccfa]/50 text-gray-800 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loadingChat && (
              <div className="flex justify-start">
                <div className="bg-[#f6ccfa]/50 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#9f8aef] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#9f8aef] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#9f8aef] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-[#f6ccfa] flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe algo..."
              className="flex-1 bg-[#f6ccfa]/30 rounded-full px-4 py-2 text-sm outline-none focus:bg-[#f6ccfa]/50 transition-colors"
            />
            <button onClick={enviarMensaje} disabled={!input.trim() || loadingChat}
              className="w-9 h-9 bg-[#9f8aef] rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-[#9f8aef]/80 transition-colors flex-shrink-0">
              <Send size={15} color="white" />
            </button>
          </div>
        </div>
      )}

      {/* Botón IA flotante */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="relative bg-[#9f8aef] text-white px-4 py-2 rounded-2xl text-sm whitespace-nowrap shadow-lg">
              ¡Hola! Soy tu IA Stylist
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-[#9f8aef]"></div>
            </div>
          </div>
          <button
            onClick={() => setChatAbierto(prev => !prev)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-20 h-20 rounded-full shadow-lg transition-all duration-500 ease-out flex items-center justify-center
              ${isHovered ? 'transform scale-110 rotate-12 shadow-2xl' : 'transform scale-100 rotate-0'}`}
          >
            <img src={isHovered ? flowerHover : flowerNormal} alt="IA Stylist"
              className={`w-full h-full object-contain rounded-full ${isHovered ? 'animate-[spin_20s_linear_infinite]' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage