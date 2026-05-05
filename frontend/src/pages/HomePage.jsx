import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { Plus, ShoppingBag, ExternalLink, Search } from 'lucide-react'
import logo3 from '../assets/logo3.png'

const HomePage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('todos')

  // Datos mockeados para demo de emergencia - 20 imágenes dinámicas
  const mockItems = [
    { id: 1, type: 'image', url: 'https://picsum.photos/400/300?random=1' },
    { id: 2, type: 'image', url: 'https://picsum.photos/400/500?random=2' },
    { id: 3, type: 'image', url: 'https://picsum.photos/400/400?random=3' },
    { id: 4, type: 'image', url: 'https://picsum.photos/400/600?random=4' },
    { id: 5, type: 'image', url: 'https://picsum.photos/400/350?random=5' },
    { id: 6, type: 'image', url: 'https://picsum.photos/400/450?random=6' },
    { id: 7, type: 'image', url: 'https://picsum.photos/400/550?random=7' },
    { id: 8, type: 'image', url: 'https://picsum.photos/400/380?random=8' },
    { id: 9, type: 'image', url: 'https://picsum.photos/400/520?random=9' },
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
    { id: 20, type: 'image', url: 'https://picsum.photos/400/510?random=20' }
  ]

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'inspo', label: 'Inspo' },
    { id: 'products', label: 'Products' }
  ]

  const shopButtons = [
    { name: 'Shein', icon: ShoppingBag },
    { name: 'AliExpress', icon: ExternalLink }
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
      {/* Barra de Navegación Superior */}
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

          {/* Tabs de navegación */}
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 font-medium transition-all duration-300 rounded-2xl
                  ${activeTab === tab.id 
                    ? 'bg-[#9f8aef] text-[#ffffff]' 
                    : 'text-gray-900 hover:bg-[#f6ccfa]'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Buscador Central */}
          <div className="flex-1 mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Buscar outfits o prendas..."
                className="w-full pl-12 pr-4 py-3 bg-[#ffffff] rounded-full border-2 border-[#f6ccfa] focus:border-[#9f8aef] focus:ring-0 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>

          {/* Botones de Shop - Derecha */}
          <div className="flex gap-3">
            {shopButtons.map((shop) => {
              const Icon = shop.icon
              return (
                <button
                  key={shop.name}
                  className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-[#f6ccfa] rounded-2xl transition-all duration-300 group"
                >
                  <Icon className="w-4 h-4 text-gray-900 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-900 text-sm font-medium">{shop.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="p-8 bg-gradient-to-b from-[#fafbad] from-5% via-[#ffffff] via-50% to-[#fafbad] to-95% bg-fixed min-h-screen">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex gap-6"
          columnClassName="flex-1"
        >
          {mockItems.map((item) => (
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
                      alt="Prenda de moda"
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

export default HomePage
