import React, { useState } from 'react'
import { Home, Compass, Calendar, User, ShoppingBag, Plus } from 'lucide-react'

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('home')

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Compass, label: 'Explorar' },
    { id: 'calendar', icon: Calendar, label: 'Calendario' },
  ]

  return (
    <div className="fixed left-0 top-0 w-20 bg-gris-claro h-screen flex flex-col items-center py-8 gap-8 z-50">
      {/* Logo */}
      <div className="w-12 h-12 bg-vino rounded-2xl flex items-center justify-center shadow-lg">
        <ShoppingBag className="w-7 h-7 text-crema" />
      </div>

      {/* Navegación Vertical */}
      <nav className="flex flex-col gap-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`
                w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                ${isActive 
                  ? 'bg-vino shadow-lg' 
                  : 'hover:bg-arena/30'
                }
              `}
              title={item.label}
            >
              <Icon 
                className={`w-6 h-6 transition-colors duration-300 ${
                  isActive ? 'text-crema' : 'text-vino'
                }`} 
              />
            </button>
          )
        })}
      </nav>

      {/* Botón Añadir Prenda */}
      <button
        onClick={() => window.location.href = '/añadir-prenda'}
        className="w-12 h-12 bg-arena/30 hover:bg-vino rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
        title="Añadir Prenda"
      >
        <Plus className="w-6 h-6 text-vino group-hover:text-crema transition-colors" />
      </button>

      {/* Perfil/Inventario */}
      <div className="relative group">
        <button className="w-12 h-12 bg-vino rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
          <User className="w-6 h-6 text-crema" />
        </button>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 bottom-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-vino text-crema px-3 py-2 rounded-xl text-sm whitespace-nowrap shadow-lg">
            Mi Armario/Perfil
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-vino"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
