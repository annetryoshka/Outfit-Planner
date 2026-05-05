import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Heart, MessageCircle, Upload, MoreHorizontal } from 'lucide-react'
import Masonry from 'react-masonry-css'
import logo3 from '../assets/logo3.png'

const PrendaDetail = () => {
  const navigate = useNavigate()
  
  // Mock data para la prenda principal
  const prendaData = {
    id: 1,
    nombre: 'Camisa NewJeans Core',
    categoria: 'Camisa',
    color: 'Azul',
    temporada: 'Primavera',
    ocasion: 'Casual',
    imagen: 'https://picsum.photos/600/800?random=999'
  }

  // Datos de prueba para prendas relacionadas
  const prendasRelacionadas = [
    { id: 1, url: 'https://picsum.photos/300/400?random=1' },
    { id: 2, url: 'https://picsum.photos/300/350?random=2' },
    { id: 3, url: 'https://picsum.photos/300/450?random=3' },
    { id: 4, url: 'https://picsum.photos/300/380?random=4' },
    { id: 5, url: 'https://picsum.photos/300/420?random=5' },
    { id: 6, url: 'https://picsum.photos/300/360?random=6' },
    { id: 7, url: 'https://picsum.photos/300/400?random=7' },
    { id: 8, url: 'https://picsum.photos/300/320?random=8' },
    { id: 9, url: 'https://picsum.photos/300/300?random=9' },
    { id: 10, url: 'https://picsum.photos/300/350?random=10' },
    { id: 11, url: 'https://picsum.photos/300/280?random=11' },
    { id: 12, url: 'https://picsum.photos/300/400?random=12' }
  ]

  // Dividir prendas en dos mitades
  const prendasIzquierda = prendasRelacionadas.slice(0, 6)
  const prendasDerecha = prendasRelacionadas.slice(6)

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Header con Logo y Barra de Búsqueda Pinterest - Sticky */}
      <div className="sticky top-0 z-50 w-full py-4 bg-white shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center">
          
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

          {/* Barra de Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar prendas..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-700 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Contenedor Principal - Grid de 4 Columnas */}
      <div className="max-w-[1260px] mx-auto px-4 py-10 grid grid-cols-4 gap-6">
        
        {/* Bloque Izquierdo (col-span-2): Panel + Masonry */}
        <div className="col-span-2">
          
          {/* Panel de Información (Súper Pin) */}
          <div className="bg-gradient-to-b from-[#fafbad] from-5% via-[#ffffff] via-20% to-[#ffffff] rounded-[32px] shadow-[0_1px_20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col mb-6">
            
            {/* Header Interno de la Tarjeta */}
            <div className="flex justify-between items-center p-6">
              <div className="flex gap-1">
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <Heart className="w-6 h-6 text-gray-800" />
                </button>
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <MessageCircle className="w-6 h-6 text-gray-800" />
                </button>
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <Upload className="w-6 h-6 text-gray-800" />
                </button>
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreHorizontal className="w-6 h-6 text-gray-800" />
                </button>
              </div>
              <button className="bg-[#79d063] text-[#ffffff] rounded-full px-6 py-3 font-bold shadow-md hover:bg-[#79d063]/90 transition-all duration-300 text-lg">
                Guardar
              </button>
            </div>

            {/* Contenedor de Imagen */}
            <div className="px-6 pb-2 flex justify-center">
              <img
                src={prendaData.imagen}
                alt={prendaData.nombre}
                className="w-full rounded-[24px] object-cover max-h-[65vh]"
              />
            </div>

            {/* Información de la Prenda */}
            <div className="px-6 pb-8 pt-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-5">
                {prendaData.nombre}
              </h1>
              
              {/* Badges de Características */}
              <div className="flex flex-wrap gap-3">
                <span className="bg-[#ffffff] border border-[#f6ccfa] text-gray-700 px-5 py-2 rounded-full text-sm font-bold shadow-[inset_0_0_10px_rgba(246,204,250,0.3)]">
                  {prendaData.categoria}
                </span>
                <span className="bg-[#ffffff] border border-[#f6ccfa] text-gray-700 px-5 py-2 rounded-full text-sm font-bold shadow-[inset_0_0_10px_rgba(246,204,250,0.3)]">
                  {prendaData.color}
                </span>
                <span className="bg-[#ffffff] border border-[#f6ccfa] text-gray-700 px-5 py-2 rounded-full text-sm font-bold shadow-[inset_0_0_10px_rgba(246,204,250,0.3)]">
                  {prendaData.temporada}
                </span>
                <span className="bg-[#ffffff] border border-[#f6ccfa] text-gray-700 px-5 py-2 rounded-full text-sm font-bold shadow-[inset_0_0_10px_rgba(246,204,250,0.3)]">
                  {prendaData.ocasion}
                </span>
              </div>
            </div>
          </div>

          {/* Masonry de 2 Columnas (debajo del panel) */}
          <Masonry
            breakpointCols={2}
            className="flex gap-6"
            columnClassName="flex-1"
          >
            {prendasIzquierda.map((item) => (
              <div key={item.id} className="mb-4 break-inside-avoid">
                <div className="bg-white rounded-[20px] overflow-hidden cursor-pointer group relative">
                  <img
                    src={item.url}
                    alt="Prenda relacionada"
                    className="w-full object-cover rounded-[20px]"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
                  <button className="absolute top-3 right-3 bg-[#79d063] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#79d063]/90 text-sm">
                    Guardar
                  </button>
                </div>
              </div>
            ))}
          </Masonry>
        </div>

        {/* Bloque Derecho (col-span-2): Masonry de 2 Columnas */}
        <div className="col-span-2">
          <Masonry
            breakpointCols={2}
            className="flex gap-6"
            columnClassName="flex-1"
          >
            {prendasDerecha.map((item) => (
              <div key={item.id} className="mb-4 break-inside-avoid">
                <div className="bg-white rounded-[20px] overflow-hidden cursor-pointer group relative">
                  <img
                    src={item.url}
                    alt="Prenda relacionada"
                    className="w-full object-cover rounded-[20px]"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
                  <button className="absolute top-3 right-3 bg-[#79d063] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#79d063]/90 text-sm">
                    Guardar
                  </button>
                </div>
              </div>
            ))}
          </Masonry>
        </div>
        
      </div>
    </div>
  )
}

export default PrendaDetail