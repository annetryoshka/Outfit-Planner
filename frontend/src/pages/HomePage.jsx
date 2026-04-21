import React, { useState } from 'react'
import Masonry from 'react-masonry-css'
import { Plus, ShoppingBag, ExternalLink, Search } from 'lucide-react'

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('todos')

  // Datos mockeados para el tablero Pinterest
  const mockItems = [
    {
      id: 1,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=600&fit=crop',
      title: 'Elegancia Urbana',
      category: 'outfit'
    },
    {
      id: 2,
      type: 'inspiration',
      content: 'Combina tonos tierra para este Otoño 🍂',
      color: 'crema'
    },
    {
      id: 3,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop',
      title: 'Minimalismo Chic',
      category: 'outfit'
    },
    {
      id: 4,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      title: 'Estilo Casual',
      category: 'outfit'
    },
    {
      id: 5,
      type: 'inspiration',
      content: 'La moda sostenible es el futuro ♻️',
      color: 'crema'
    },
    {
      id: 6,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=550&fit=crop',
      title: 'Noche Elegante',
      category: 'outfit'
    },
    {
      id: 7,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      title: 'Business Casual',
      category: 'outfit'
    },
    {
      id: 8,
      type: 'inspiration',
      content: 'Menos es más: 10 prendas básicas que necesitas',
      color: 'crema'
    },
    {
      id: 9,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&h=450&fit=crop',
      title: 'Boho Style',
      category: 'outfit'
    }
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
    <div className="min-h-screen bg-base relative">
      {/* Barra de Navegación Superior */}
      <header className="bg-base border-b border-arena/20 px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Tabs de navegación - Izquierda */}
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-2 py-4 font-medium transition-all duration-300 relative
                  ${activeTab === tab.id 
                    ? 'text-vino border-b-4 border-vino' 
                    : 'text-arena hover:text-vino/70'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Buscador Central */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-arena/60" />
              <input
                type="text"
                placeholder="Buscar outfits o prendas..."
                className="w-full pl-12 pr-4 py-3 bg-crema rounded-full border-2 border-transparent focus:border-vino focus:outline-none transition-all duration-300 text-arena placeholder-arena/60"
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
                  className="flex items-center gap-2 px-4 py-2 bg-crema/50 hover:bg-crema rounded-2xl transition-all duration-300 group"
                >
                  <Icon className="w-4 h-4 text-vino group-hover:scale-110 transition-transform" />
                  <span className="text-arena text-sm font-medium">{shop.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="p-8">
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
                <div className="bg-crema rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <div className="relative overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-vino">{item.title}</h3>
                    <p className="text-sm text-arena mt-1">{item.category}</p>
                  </div>
                </div>
              ) : (
                <div className={`bg-${item.color} rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                  <p className="text-xl font-medium text-vino leading-relaxed group-hover:scale-105 transition-transform duration-300">
                    {item.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </Masonry>
      </main>

          </div>
  )
}

export default HomePage
