import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Compass, Calendar, User, ShoppingBag, Plus } from 'lucide-react'

const Sidebar = () => {
  const navigate = useNavigate()
  const [activeItem, setActiveItem] = useState('home')

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'wishlist', icon: ShoppingBag, label: 'Wishlist' },
    { id: 'explore', icon: Compass, label: 'Explorar' },
    { id: 'calendar', icon: Calendar, label: 'Calendario' },
  ]

  return (
    <div className="fixed left-0 top-0 w-20 bg-[#c2e1f9] h-screen flex flex-col items-center pt-8 pb-8 gap-4 z-50">
      {/* Navegación Vertical */}
      <nav className="flex flex-col gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          
          return (
            <div className="relative group" key={item.id}>
              <button
                onClick={() => {
                  setActiveItem(item.id)
                  const paths = {
                    home: '/',
                    wishlist: '/wishlist',
                    explore: '/explore',
                    calendar: '/calendar'
                  }
                  if (paths[item.id]) navigate(paths[item.id])
                }}
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? 'bg-[#9f8aef] shadow-lg' 
                    : 'hover:bg-[#9f8aef]/30'
                  }
                `}
              >
                <Icon 
                  className={`w-6 h-6 transition-colors duration-300 ${
                    isActive ? 'text-[#ffffff]' : 'text-[#9f8aef]'
                  }`} 
                />
              </button>
              
              {/* Tooltip */}
              <div className="absolute left-full ml-3 bottom-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[9999]">
                <div className="bg-[#9f8aef] text-[#ffffff] px-3 py-2 rounded-xl text-sm whitespace-nowrap shadow-lg">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#9f8aef]"></div>
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      <div className="flex-1"></div>
      
      {/* Tope Invisible para ajustar posición de botones inferiores */}
      <div className="h-20"></div>

      {/* Botón Añadir Prenda */}
      <div className="relative group">
        <button
          onClick={() => navigate('/añadir-prenda')}
          className="w-12 h-12 bg-[#9f8aef] hover:bg-[#9f8aef]/80 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-6 h-6 text-[#ffffff] group-hover:scale-110 transition-colors" />
        </button>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 bottom-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-[#9f8aef] text-[#ffffff] px-3 py-2 rounded-xl text-sm whitespace-nowrap shadow-lg">
            Añadir Prenda
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#9f8aef]"></div>
          </div>
        </div>
      </div>

      {/* Perfil/Inventario */}
      <div className="relative group">
        <button 
          onClick={() => {
            setActiveItem('profile')
            navigate('/perfil')
          }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${
            activeItem === 'profile' ? 'bg-[#9f8aef]' : 'bg-[#9f8aef]/80 hover:bg-[#9f8aef]'
          }`}
        >
          <User className="w-6 h-6 text-[#ffffff]" />
        </button>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 bottom-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-[#9f8aef] text-[#ffffff] px-3 py-2 rounded-xl text-sm whitespace-nowrap shadow-lg">
            Mi Armario/Perfil
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#9f8aef]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
