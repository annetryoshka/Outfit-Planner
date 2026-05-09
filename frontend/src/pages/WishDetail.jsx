import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { Search, Heart, MessageCircle, Upload, MoreHorizontal } from 'lucide-react'
import Masonry from 'react-masonry-css'
import logo3 from '../assets/logo3.png'
import wishlistService from '../services/wishlistService'

const fmt = (s) => {
  if (s == null || s === '') return ''
  const t = String(s)
  return t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ')
}

const WishDetail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const searchParams = new URLSearchParams(location.search)
  const fromParam = searchParams.get('from')
  const productFromExplore = location.state?.product

  const [item, setItem] = useState(null)
  const [otros, setOtros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const esVistaPreviaExplorar = id === 'new' && productFromExplore

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (esVistaPreviaExplorar) {
        setItem({
          nombre: productFromExplore.nombre,
          imagen_url: productFromExplore.imagen_url,
          precio: productFromExplore.precio,
          url_tienda: productFromExplore.url_tienda,
          categoria: productFromExplore.categoria,
          tienda: productFromExplore.tienda
        })
        setLoading(false)
        setError(null)
        try {
          const lista = await wishlistService.listar()
          if (!cancelled) setOtros((lista || []).slice(0, 12))
        } catch {
          if (!cancelled) setOtros([])
        }
        return
      }

      if (!id || id === 'new') {
        setError('notfound')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const data = await wishlistService.obtener(id)
        if (cancelled) return
        setItem(data)
        const lista = await wishlistService.listar()
        if (cancelled) return
        setOtros((lista || []).filter((x) => String(x.id) !== String(id)).slice(0, 12))
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
  }, [id, esVistaPreviaExplorar, productFromExplore])

  const guardarEnWishlist = async () => {
    if (!productFromExplore) return
    setGuardando(true)
    try {
      const created = await wishlistService.agregar({
        nombre: productFromExplore.nombre,
        imagen_url: productFromExplore.imagen_url,
        precio: productFromExplore.precio,
        url_tienda: productFromExplore.url_tienda
      })
      const newId = created?.id ?? created?.data?.id
      if (newId) {
        navigate(`/wishdetail/${newId}?from=wishlist-selection`, { replace: true })
      } else {
        navigate('/wishlist?tab=seleccion')
      }
    } catch (e) {
      alert(e.response?.data?.message || 'No se pudo guardar en la wishlist.')
    } finally {
      setGuardando(false)
    }
  }

  const marcarAdquirido = async () => {
    if (!id || id === 'new') return
    if (!window.confirm('¿Marcar como adquirido? Se quitará de la wishlist.')) return
    try {
      await wishlistService.moverAlArmario(id)
      navigate('/wishlist?tab=seleccion')
    } catch {
      alert('No se pudo completar la acción.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center text-gray-600">
        Cargando…
      </div>
    )
  }

  if (error === 'login') {
    return (
      <div className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center gap-4 text-gray-700 px-6">
        <p>Inicia sesión para ver este producto.</p>
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

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center gap-4 text-gray-700 px-6">
        <p>No encontramos este artículo.</p>
        <button
          type="button"
          onClick={() => navigate('/wishlist')}
          className="px-6 py-3 rounded-full bg-[#f6ccfa] text-gray-900 font-medium"
        >
          Volver a la wishlist
        </button>
      </div>
    )
  }

  const badges = [
    item.precio != null ? `$${Number(item.precio).toFixed(2)}` : '',
    item.categoria ? fmt(item.categoria) : '',
    item.tienda ? fmt(item.tienda) : ''
  ].filter(Boolean)

  const prendasIzquierda = otros.slice(0, 6)
  const prendasDerecha = otros.slice(6)

  const botonPrincipalLabel = esVistaPreviaExplorar
    ? guardando
      ? 'Guardando…'
      : 'Guardar en Wishlist'
    : 'Adquirido'

  const handleBotonPrincipal = () => {
    if (esVistaPreviaExplorar) guardarEnWishlist()
    else marcarAdquirido()
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <div className="sticky top-0 z-50 w-full py-4 bg-white shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center">
          <button
            onClick={() => navigate('/')}
            className="h-10 w-auto cursor-pointer mr-6 hover:opacity-90 transition-all"
          >
            <img src={logo3} alt="PinWand" className="h-full w-auto object-contain" />
          </button>
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

      <div className="max-w-[1260px] mx-auto px-4 py-10 grid grid-cols-4 gap-6">
        <div className="col-span-2">
          <div className="bg-gradient-to-b from-[#f6ccfa] from-5% via-[#ffffff] via-20% to-[#ffffff] rounded-[32px] shadow-[0_1px_20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col mb-6">
            <div className="flex justify-between items-center p-6">
              <div className="flex gap-1">
                <button type="button" className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <Heart className="w-6 h-6 text-gray-800" />
                </button>
                <button type="button" className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <MessageCircle className="w-6 h-6 text-gray-800" />
                </button>
                <button type="button" className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <Upload className="w-6 h-6 text-gray-800" />
                </button>
                <button type="button" className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreHorizontal className="w-6 h-6 text-gray-800" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleBotonPrincipal}
                disabled={guardando}
                className="rounded-full px-6 py-3 font-bold shadow-md transition-all duration-300 text-lg bg-[#79d063] text-[#ffffff] hover:bg-[#79d063]/90 disabled:opacity-50"
              >
                {botonPrincipalLabel}
              </button>
            </div>

            <div className="px-6 pb-2 flex justify-center">
              {item.imagen_url ? (
                <img
                  src={item.imagen_url}
                  alt={item.nombre}
                  className="w-full rounded-[24px] object-cover max-h-[65vh]"
                />
              ) : (
                <div className="w-full min-h-[240px] rounded-[24px] bg-gray-100 flex items-center justify-center text-gray-500">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="px-6 pb-8 pt-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-5">{item.nombre}</h1>

              {item.url_tienda && (
                <div className="mb-4">
                  <a
                    href={item.url_tienda}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    <span>Ver producto en tienda</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6m0 0h4m0 0v4m0 0h-4m6 0v4m0 0h-4" />
                    </svg>
                  </a>
                </div>
              )}

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

          <Masonry breakpointCols={2} className="flex gap-6" columnClassName="flex-1">
            {prendasIzquierda.map((rel) => (
              <div key={rel.id} className="mb-4 break-inside-avoid">
                <div
                  className="bg-white rounded-[20px] overflow-hidden cursor-pointer group relative"
                  onClick={() => navigate(`/wishdetail/${rel.id}?from=wishlist-selection`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/wishdetail/${rel.id}?from=wishlist-selection`)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={rel.imagen_url}
                    alt={rel.nombre}
                    className="w-full object-cover rounded-[20px]"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
                </div>
              </div>
            ))}
          </Masonry>
        </div>

        <div className="col-span-2">
          <Masonry breakpointCols={2} className="flex gap-6" columnClassName="flex-1">
            {prendasDerecha.map((rel) => (
              <div key={rel.id} className="mb-4 break-inside-avoid">
                <div
                  className="bg-white rounded-[20px] overflow-hidden cursor-pointer group relative"
                  onClick={() => navigate(`/wishdetail/${rel.id}?from=wishlist-selection`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/wishdetail/${rel.id}?from=wishlist-selection`)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={rel.imagen_url}
                    alt={rel.nombre}
                    className="w-full object-cover rounded-[20px]"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />
                </div>
              </div>
            ))}
          </Masonry>
        </div>
      </div>
    </div>
  )
}

export default WishDetail
