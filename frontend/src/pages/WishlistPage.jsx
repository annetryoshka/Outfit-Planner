import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { Search } from 'lucide-react'
import logo3 from '../assets/logo3.png'

const WishlistPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('suggestions')

  const tabs = [
    { id: 'suggestions', label: 'Sugerencias de Compra' },
    { id: 'inspo', label: 'Inspo' },
    { id: 'products', label: 'Products' }
  ]

  // Datos de Wishlist - artículos de deseo
  const wishlistItems = [
    { id: 1, type: 'image', url: 'https://picsum.photos/400/300?random=101' },
    { id: 2, type: 'image', url: 'https://picsum.photos/400/500?random=102' },
    { id: 3, type: 'image', url: 'https://picsum.photos/400/400?random=103' },
    { id: 4, type: 'image', url: 'https://picsum.photos/400/600?random=104' },
    { id: 5, type: 'image', url: 'https://picsum.photos/400/350?random=105' },
    { id: 6, type: 'image', url: 'https://picsum.photos/400/450?random=106' },
    { id: 7, type: 'image', url: 'https://picsum.photos/400/550?random=107' },
    { id: 8, type: 'image', url: 'https://picsum.photos/400/380?random=108' },
    { id: 9, type: 'image', url: 'https://picsum.photos/400/520?random=109' },
    { id: 10, type: 'image', url: 'https://picsum.photos/400/420?random=110' },
    { id: 11, type: 'image', url: 'https://picsum.photos/400/480?random=111' },
    { id: 12, type: 'image', url: 'https://picsum.photos/400/360?random=112' },
    { id: 13, type: 'image', url: 'https://picsum.photos/400/540?random=113' },
    { id: 14, type: 'image', url: 'https://picsum.photos/400/440?random=114' },
    { id: 15, type: 'image', url: 'https://picsum.photos/400/500?random=115' },
    { id: 16, type: 'image', url: 'https://picsum.photos/400/320?random=116' },
    { id: 17, type: 'image', url: 'https://picsum.photos/400/580?random=117' },
    { id: 18, type: 'image', url: 'https://picsum.photos/400/460?random=118' },
    { id: 19, type: 'image', url: 'https://picsum.photos/400/390?random=119' },
    { id: 20, type: 'image', url: 'https://picsum.photos/400/510?random=120' }
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
                    ? 'bg-rosado text-morado' 
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
      <main className="p-8 bg-gradient-to-b from-rosado from-5% via-blanco via-50% to-blanco to-95% bg-fixed min-h-screen">
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
                      alt="Artículo de deseo"
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Capa de sombreado suave en hover */}
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Botón Guardar dinámico */}
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-4 right-4 bg-[#79d063] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#79d063]/90"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </Masonry>
      </main>
    </div>
  )
}

export default WishlistPage
