import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { Search, X, Heart, Palette, Sparkles, LayoutGrid } from 'lucide-react'
import logo3 from '../assets/logo3.png'
import flowerNormal from '../assets/flower2.png'
import flowerHover from '../assets/flower1.png'

const NAVBAR_HEIGHT = '72px'

const HomePage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('todos')
  const [isHovered, setIsHovered] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')

  const mockItems = [
    { id: 1,  type: 'image', url: 'https://picsum.photos/400/300?random=1'  },
    { id: 2,  type: 'image', url: 'https://picsum.photos/400/500?random=2'  },
    { id: 3,  type: 'image', url: 'https://picsum.photos/400/400?random=3'  },
    { id: 4,  type: 'image', url: 'https://picsum.photos/400/600?random=4'  },
    { id: 5,  type: 'image', url: 'https://picsum.photos/400/350?random=5'  },
    { id: 6,  type: 'image', url: 'https://picsum.photos/400/450?random=6'  },
    { id: 7,  type: 'image', url: 'https://picsum.photos/400/550?random=7'  },
    { id: 8,  type: 'image', url: 'https://picsum.photos/400/380?random=8'  },
    { id: 9,  type: 'image', url: 'https://picsum.photos/400/520?random=9'  },
    { id: 10, type: 'image', url: 'https://picsum.photos/400/420?random=10' },
    { id: 11, type: 'image', url: 'https://picsum.photos/400/480?random=11' },
    { id: 12, type: 'image', url: 'https://picsum.photos/400/360?random=12' },
    { id: 13, type: 'image', url: 'https://picsum.photos/400/540?random=13' },
    { id: 14, type: 'image', url: 'https://picsum.photos/400/440?random=14' },
    { id: 15, type: 'image', url: 'https://picsum.photos/400/500?random=15' },
    { id: 16, type: 'image', url: 'https://picsum.photos/400/320?random=16' },
    { id: 17, type: 'image', url: 'https://picsum.photos/400/580?random=17' },
    { id: 18, type: 'image', url: 'https://picsum.photos/400/460?random=18' },
    { id: 19, type: 'image', url: 'https://picsum.photos/400/390?random=19' },
    { id: 20, type: 'image', url: 'https://picsum.photos/400/510?random=20' },
  ]

  const tabs = [
    { id: 'todos',      label: 'Todos'      },
    { id: 'shein',      label: 'Shein'      },
    { id: 'aliexpress', label: 'AliExpress' },
  ]

  const breakpointColumnsObj = isChatOpen
    ? { default: 3, 1200: 2, 900: 2, 600: 1, 400: 1 }
    : { default: 5, 1200: 4, 900: 3, 600: 2, 400: 1 }

  const suggestions = [
    { id: 1, text: "Armar un outfit para una cita", icon: Heart },
    { id: 2, text: "¿Qué colores combinan con este pin?", icon: Palette },
    { id: 3, text: "Tendencias de moda para este verano", icon: Sparkles },
    { id: 4, text: "Organizar mi tablero por ocasiones", icon: LayoutGrid }
  ]

  const handleSendMessage = (text) => {
    if (text.trim()) {
      const newMessage = { id: Date.now(), text, sender: 'user', timestamp: new Date() }
      setMessages([...messages, newMessage])
      setInputValue('')
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = { 
          id: Date.now() + 1, 
          text: "Entendido. Estoy procesando tu solicitud...", 
          sender: 'ai', 
          timestamp: new Date() 
        }
        setMessages(prev => [...prev, aiResponse])
      }, 1000)
    }
  }

  const handleSuggestionClick = (suggestionText) => {
    handleSendMessage(suggestionText)
  }

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

          <nav className="flex gap-4 items-center flex-shrink-0">
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

          <div className="flex-1 ml-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Buscar outfits o prendas..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-2 border-[#f6ccfa] focus:border-[#9f8aef] focus:ring-0 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>

        </div>
      </header>

      {/* ── Zona inferior: galería + panel de chat ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Galería */}
        <div className="flex-1 overflow-y-auto transition-all duration-500 ease-in-out">
          <main className="p-8 bg-gradient-to-b from-[#fafbad] from-5% via-white via-50% to-[#fafbad] to-95% bg-fixed min-h-full">
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex gap-6"
              columnClassName="flex-1"
            >
              {mockItems.map((item) => (
                <div key={item.id} className="mb-6 break-inside-avoid">
                  {item.type === 'image' && (
                    <div
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/prenda/${item.id}`)}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={item.url}
                          alt="Prenda de moda"
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-4 right-4 bg-[#79d063] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#79d063]/90"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </Masonry>
          </main>
        </div>

        {/* ── Panel de Chat: flotante y redondeado, solo en zona de galería ── */}
        <div
          className={`transition-all duration-500 ease-in-out flex-shrink-0 overflow-hidden ${
            isChatOpen ? 'w-[420px] opacity-100' : 'w-0 opacity-0'
          }`}
        >
          {/* padding interno para que flote con espacio alrededor */}
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

              {/* Header del chat */}
              <div
                className="flex items-center justify-between px-5 bg-[#9f8aef] flex-shrink-0"
                style={{ height: '64px' }}
              >
                <div className="flex items-center gap-2">
                  <img src={flowerNormal} alt="IA Stylist" className="w-7 h-7 object-contain border border-white rounded-full" />
                  <h3 className="text-base font-semibold text-white">IA Stylist</h3>
                </div>
                <button
                  onClick={() => { setIsChatOpen(false); setIsHovered(false) }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-4">
                  {messages.length === 0 ? (
                    /* Sugerencias iniciales estilo Notion */
                    <div className="flex flex-col gap-3">
                      <p className="text-gray-600 text-sm mb-4 font-medium">¿En qué puedo ayudarte hoy?</p>
                      {suggestions.map((suggestion) => {
                        const Icon = suggestion.icon
                        return (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion.text)}
                            className="flex items-center gap-3 p-3 bg-white border border-[#9f8aef] rounded-2xl hover:bg-gray-50 transition-colors text-left self-start"
                          >
                            <Icon className="w-4 h-4 text-[#9f8aef] flex-shrink-0" />
                            <span className="text-gray-800 text-sm">{suggestion.text}</span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    /* Mensajes del chat */
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`max-w-[80%] ${
                          message.sender === 'user' 
                            ? 'self-end bg-[#c2e1f9] border border-black rounded-2xl' 
                            : 'self-start bg-white border border-[#9f8aef] rounded-2xl'
                        } p-3`}
                      >
                        <p className={`text-sm ${
                          message.sender === 'user' ? 'text-gray-800' : 'text-gray-700'
                        }`}>
                          {message.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200/40">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe tu mensaje..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    className="flex-1 px-4 py-2.5 bg-white/90 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#9f8aef] focus:border-transparent"
                  />
                  <button 
                    onClick={() => handleSendMessage(inputValue)}
                    className="px-5 py-2.5 bg-[#9f8aef] text-white text-sm rounded-full hover:bg-[#8a74e0] transition-colors font-medium"
                  >
                    Enviar
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ── Botón Flotante ── */}
      <div
        className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ease-in-out ${
          isChatOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'
        }`}
      >
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
              isHovered && !isChatOpen
                ? 'transform scale-110 rotate-12 shadow-2xl'
                : 'transform scale-100 rotate-0'
            }`}
          >
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
