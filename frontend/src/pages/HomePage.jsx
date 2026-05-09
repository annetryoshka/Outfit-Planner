import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { Search, X, Send, ShoppingBag, ExternalLink, Heart, Palette, Sparkles, LayoutGrid } from 'lucide-react'
import logo3 from '../assets/logo3.png'
import flowerNormal from '../assets/flower2.png'
import flowerHover from '../assets/flower1.png'
import asistenteService from '../services/asistenteService'
import climaService from '../services/climaService'

const HomePage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('todos')
  const [isHovered, setIsHovered] = useState(false)
  const [clima, setClima] = useState(null)
  const [loadingClima, setLoadingClima] = useState(true)
  const [chatAbierto, setChatAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const mensajesRef = useRef(null)

  useEffect(() => {
    climaService.obtenerUbicacion()
      .then(({ lat, lon }) => climaService.outfitPorCoordenadas(lat, lon))
      .then(data => setClima(data))
      .catch(() => {})
      .finally(() => setLoadingClima(false))
  }, [])

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  const enviarMensaje = async (texto) => {
    const msg = texto || input
    if (!msg.trim() || loadingChat) return
    setInput('')
    setMensajes(prev => [...prev, { role: 'user', content: msg }])
    setLoadingChat(true)
    try {
      const data = await asistenteService.chat(msg)
      setMensajes(prev => [...prev, { role: 'assistant', content: data.respuesta }])
    } catch {
      setMensajes(prev => [...prev, { role: 'assistant', content: 'Ups, algo salió mal 😅' }])
    } finally {
      setLoadingChat(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje() }
  }

  const suggestions = [
    { id: 1, text: 'Armar un outfit para una cita', icon: Heart },
    { id: 2, text: '¿Qué colores combinan con negro?', icon: Palette },
    { id: 3, text: 'Tendencias de moda para este invierno', icon: Sparkles },
    { id: 4, text: 'Organizar mi armario por ocasiones', icon: LayoutGrid },
  ]

  const mockItems = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1, url: `https://picsum.photos/400/${300 + (i % 5) * 50}?random=${i + 1}`
  }))

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
          <nav className="flex gap-4">
            {tabs.map(tab => (
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
                className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-2 border-[#f6ccfa] focus:border-[#9f8aef] focus:outline-none transition-all duration-300" />
            </div>
          </div>
          <div className="flex gap-3">
            {shopButtons.map(({ name, icon: Icon }) => (
              <button key={name} className="flex items-center gap-2 px-4 py-2 hover:bg-[#f6ccfa] rounded-2xl transition-all duration-300 group">
                <Icon className="w-4 h-4 text-gray-900 group-hover:scale-110 transition-transform" />
                <span className="text-gray-900 text-sm font-medium">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="p-8 bg-gradient-to-b from-[#fafbad] from-5% via-white via-50% to-[#fafbad] to-95% min-h-screen">

        {/* Banner clima */}
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

        <Masonry breakpointCols={breakpointColumnsObj} className="flex gap-6" columnClassName="flex-1">
          {mockItems.map(item => (
            <div key={item.id} className="mb-6 break-inside-avoid">
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/prenda/${item.id}`)}>
                <div className="relative overflow-hidden">
                  <img src={item.url} alt="Prenda" className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button onClick={e => e.stopPropagation()}
                    className="absolute top-4 right-4 bg-[#79d063] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      </main>

      {/* Chat Modal */}
      {chatAbierto && (
        <div className="fixed bottom-36 right-8 z-50 w-80 bg-white rounded-3xl shadow-2xl border border-[#f6ccfa] flex flex-col overflow-hidden"
          style={{ height: '420px' }}>
          <div className="bg-[#9f8aef] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <img src={flowerNormal} alt="IA" className="w-7 h-7 rounded-full" />
              <span className="text-white text-sm font-medium">IA Stylist</span>
            </div>
            <button onClick={() => setChatAbierto(false)} className="text-white hover:text-white/70">
              <X size={18} />
            </button>
          </div>

          <div ref={mensajesRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {mensajes.length === 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400 mb-2">¿En qué puedo ayudarte?</p>
                {suggestions.map(({ id, text, icon: Icon }) => (
                  <button key={id} onClick={() => enviarMensaje(text)}
                    className="flex items-center gap-2 p-2.5 bg-[#f6ccfa]/30 border border-[#f6ccfa] rounded-xl hover:bg-[#f6ccfa]/60 transition-colors text-left">
                    <Icon className="w-4 h-4 text-[#9f8aef] flex-shrink-0" />
                    <span className="text-xs text-gray-700">{text}</span>
                  </button>
                ))}
              </div>
            ) : (
              mensajes.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-[#9f8aef] text-white rounded-br-sm' : 'bg-[#f6ccfa]/50 text-gray-800 rounded-bl-sm'
                  }`}>{m.content}</div>
                </div>
              ))
            )}
            {loadingChat && (
              <div className="flex justify-start">
                <div className="bg-[#f6ccfa]/50 px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-2 h-2 bg-[#9f8aef] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-3 py-3 border-t border-[#f6ccfa] flex gap-2 flex-shrink-0">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="Escribe algo..."
              className="flex-1 bg-[#f6ccfa]/30 rounded-full px-4 py-2 text-sm outline-none focus:bg-[#f6ccfa]/50" />
            <button onClick={() => enviarMensaje()} disabled={!input.trim() || loadingChat}
              className="w-9 h-9 bg-[#9f8aef] rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-[#9f8aef]/80 flex-shrink-0">
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
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-[#9f8aef]" />
            </div>
          </div>
          <button onClick={() => setChatAbierto(prev => !prev)}
            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
            className={`w-20 h-20 rounded-full shadow-lg transition-all duration-500 ease-out flex items-center justify-center
              ${isHovered ? 'transform scale-110 rotate-12 shadow-2xl' : 'transform scale-100 rotate-0'}`}>
            <img src={isHovered ? flowerHover : flowerNormal} alt="IA Stylist"
              className={`w-full h-full object-contain rounded-full ${isHovered ? 'animate-[spin_20s_linear_infinite]' : ''}`} />
          </button>
        </div>
      </div>

    </div>
  )
}

export default HomePage