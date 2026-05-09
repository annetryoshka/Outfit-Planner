import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { Search, Heart, MessageCircle, Upload, MoreHorizontal } from 'lucide-react'
import Masonry from 'react-masonry-css'
import logo3 from '../assets/logo3.png'
import prendaService from '../services/prendaService'

const fmt = (s) => {
  if (s == null || s === '') return ''
  const t = String(s)
  return t.charAt(0).toUpperCase() + t.slice(1)
}

const PrendaDetail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const isFromWishlist = location.search.includes('from=wishlist')

  const [prenda, setPrenda] = useState(null)
  const [prendasRelacionadas, setPrendasRelacionadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!id) {
        setLoading(false)
        setError('notfound')
        return
      }
      setLoading(true)
      setError(null)
      try {
        const [p, todas] = await Promise.all([
          prendaService.obtenerPorId(id),
          prendaService.obtenerTodas().catch(() => [])
        ])
        if (cancelled) return
        setPrenda(p)
        const lista = Array.isArray(todas) ? todas : []
        const otras = lista.filter((x) => String(x.id) !== String(id)).slice(0, 12)
        setPrendasRelacionadas(otras)
      } catch (e) {
        if (cancelled) return
        if (e.response?.status === 401) setError('login')
        else if (e.response?.status === 404) setError('notfound')
        else setError('error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const prendasIzquierda = prendasRelacionadas.slice(0, 6)
  const prendasDerecha = prendasRelacionadas.slice(6)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center text-gray-600">
        Cargando prenda…
      </div>
    )
  }

  if (error === 'login') {
    return (
      <div className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center gap-4 text-gray-700 px-6">
        <p>Inicia sesión para ver esta prenda.</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-6 py-3 rounded-full bg-[#9f8aef] text-white font-medium"
        >
          Ir a iniciar sesión
        </button>
      </div>
    )
  }

  if (error || !prenda) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center gap-4 text-gray-700 px-6">
        <p>{error === 'notfound' ? 'No encontramos esa prenda.' : 'No se pudo cargar la prenda.'}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-full bg-[#f6ccfa] text-gray-900 font-medium"
        >
          Volver al inicio
        </button>
      </div>
    )
  }

  const badges = [
    fmt(prenda.categoria),
    fmt(prenda.tipo),
    fmt(prenda.color),
    fmt(prenda.temporada),
    prenda.talla ? `Talla ${prenda.talla}` : '',
    fmt(prenda.material),
    prenda.marca ? fmt(prenda.marca) : ''
  ].filter(Boolean)

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
          <div className={`
            rounded-[32px] shadow-[0_1px_20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col mb-6
            ${isFromWishlist 
              ? 'bg-gradient-to-b from-[#f6ccfa] from-5% via-[#ffffff] via-20% to-[#ffffff]' 
              : 'bg-gradient-to-b from-[#fafbad] from-5% via-[#ffffff] via-20% to-[#ffffff]'
            }
          `}>
            
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
                {isFromWishlist ? 'Guardar en Wishlist' : 'Guardar'}
              </button>
            </div>

            {/* Contenedor de Imagen */}
            <div className="px-6 pb-2 flex justify-center">
              <img
                src={prenda.imagen_url}
                alt={prenda.nombre || 'Prenda'}
                className="w-full rounded-[24px] object-cover max-h-[65vh]"
              />
            </div>

            {/* Información de la Prenda */}
            <div className="px-6 pb-8 pt-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-5">
                {prenda.nombre}
              </h1>
              
              {/* Enlace/Link - Solo en modo Wishlist */}
              {isFromWishlist && (
                <div className="mb-4">
                  <a 
                    href="#" 
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    <span>Ver producto en tienda</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6m0 0h4m0 0v4m0 0h-4m6 0v4m0 0h-4" />
                    </svg>
                  </a>
                </div>
              )}
              
              {/* Badges de Características */}
              <div className="flex flex-wrap gap-3">
                {badges.map((text, i) => (
                  <span
                    key={`${i}-${text}`}
                    className="bg-[#ffffff] border border-[#f6ccfa] text-gray-700 px-5 py-2 rounded-full text-sm font-bold shadow-[inset_0_0_10px_rgba(246,204,250,0.3)]"
                  >
                    {text}
                  </span>
                ))}
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
                <div
                  className="bg-white rounded-[20px] overflow-hidden cursor-pointer group relative"
                  onClick={() => navigate(`/prenda/${item.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/prenda/${item.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={item.imagen_url}
                    alt={item.nombre || 'Prenda relacionada'}
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
                <div
                  className="bg-white rounded-[20px] overflow-hidden cursor-pointer group relative"
                  onClick={() => navigate(`/prenda/${item.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/prenda/${item.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={item.imagen_url}
                    alt={item.nombre || 'Prenda relacionada'}
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