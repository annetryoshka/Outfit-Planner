import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { Search, ExternalLink, Trash, Sparkles, X } from 'lucide-react'
import logo3 from '../assets/logo3.png'

const WishlistPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('suggestions')
  const [showSuggestion, setShowSuggestion] = useState(true)

  const tabs = [
    { id: 'suggestions', label: 'Sugerencias de Compra' },
    { id: 'inspo', label: 'Inspo' },
    { id: 'products', label: 'Products' }
  ]

  // Datos de Wishlist - ropa real con información completa
  const wishlistItems = [
    {
      id: 1,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop',
      name: 'Vestido floral verano',
      description: 'Perfecto para días soleados y reuniones informales',
      externalLink: 'https://www.zara.com'
    },
    {
      id: 2,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop',
      name: 'Blazer beige elegante',
      description: 'Ideal para oficina y eventos formales',
      externalLink: 'https://www.hm.com'
    },
    {
      id: 3,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      name: 'Jeans clásicos azul',
      description: 'Versátiles y cómodos para cualquier ocasión'
    },
    {
      id: 4,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1558769132-cb1aea45c1e5?w=400&h=450&fit=crop',
      name: 'Camiseta blanca básica',
      description: 'Imprescindible en todo armario',
      externalLink: 'https://www.mango.com'
    },
    {
      id: 5,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1578632292385-f441ccb0561e?w=400&h=550&fit=crop',
      name: 'Botines de cuero marrón',
      description: 'Comodidad y estilo para el día a día'
    },
    {
      id: 6,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=350&fit=crop',
      name: 'Bufanda de lana gris',
      description: 'Perfecta para el invierno',
      externalLink: 'https://www.massimodutti.com'
    }
  ]

  const breakpointColumnsObj = {
    default: 5,
    1200: 4,
    900: 3,
    600: 2,
    400: 1
  }

  return (
    <div className="min-h-screen relative">
      {/* Barra de Navegación Superior - Wishlist */}
      <header className="sticky top-0 z-30 bg-[#ffffff] shadow-sm px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo PinWand - Extremo Izquierdo */}
          <button
            onClick={() => navigate('/')}
            className="h-10 w-auto cursor-pointer mr-6 hover:opacity-90 transition-all"
          >
            <img
              src={logo3}
              alt="PinWand"
              className="h-full w-auto object-contain"
            />
          </button>

          {/* Tabs de navegación - Wishlist */}
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 font-medium transition-all duration-300 rounded-2xl
                  ${activeTab === tab.id 
                    ? 'bg-morado text-white' 
                    : 'text-gray-900 hover:bg-rosado/30'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Buscador Central - Wishlist */}
          <div className="flex-1 mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Buscar en mi Wishlist..."
                className="w-full pl-12 pr-4 py-3 bg-[#ffffff] rounded-full border-2 border-rosado/50 focus:border-rosado focus:ring-0 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>

        </div>
      </header>

      {/* Contenido Principal - Wishlist */}
      <main className="p-8 bg-[linear-gradient(to_bottom,#f6ccfa_0%,#ffffff_40%,#ffffff_60%,#f6ccfa_100%)] bg-fixed min-h-screen">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex gap-6"
          columnClassName="flex-1"
        >
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="mb-6 break-inside-avoid"
            >
              {item.type === 'image' ? (
                <div 
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/prenda/${item.id}`)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Capa de sombreado suave en hover */}
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Botón de eliminar */}
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                    
                    {/* Botón Adquirido */}
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-4 right-4 bg-[#79d063] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#79d063]/90"
                    >
                      Adquirido
                    </button>
                  </div>
                  
                  {/* Información de la prenda */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        {item.name}
                        {item.externalLink && (
                          <ExternalLink className="w-3 h-3 text-gray-500 hover:text-rosado cursor-pointer" />
                        )}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </Masonry>
      </main>

      {/* Sugerencia Flotante de IA - RF15 */}
      {showSuggestion && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-amarillo/90 backdrop-blur-sm border border-amarillo rounded-3xl p-4 shadow-lg max-w-sm mx-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Sparkles className="w-5 h-5 text-morado" />
            </div>
            <div className="flex-1">
              <p className="text-gray-800 text-sm font-medium">
                <span className="font-semibold"> Sugerencia:</span> Tu armario tiene muchos pantalones oscuros pero pocas camisas claras para combinarlos. ¡Añade una a tu wishlist!
              </p>
            </div>
            <button
              onClick={() => setShowSuggestion(false)}
              className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WishlistPage
