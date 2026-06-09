import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { Search, Link as LinkIcon, Download, Check } from 'lucide-react'
import Masonry from 'react-masonry-css'
import logo6 from '../assets/logo6.png'
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
  const productFromExplore = location.state?.product

  const [item, setItem] = useState(null)
  const [productosAbajo, setProductosAbajo] = useState([]) // Catálogo + Wishlist mezclados
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })
  const [checkButton, setCheckButton] = useState(null)

  const esVistaPreviaExplorar = id === 'new' && productFromExplore

  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [statusMessage])

  useEffect(() => {
    if (checkButton) {
      const timer = setTimeout(() => setCheckButton(null), 1500)
      return () => clearTimeout(timer)
    }
  }, [checkButton])

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
        setError(null)
        try {
          const categoriaFiltro =
            productFromExplore.categoria === "women's clothing" || productFromExplore.categoria === "mujer"
              ? 'mujer'
              : productFromExplore.categoria === "men's clothing" || productFromExplore.categoria === "hombre"
                ? 'hombre'
                : ''

          const [relacionados, wishlist] = await Promise.all([
            wishlistService.buscarProductos('', categoriaFiltro).catch(() => []),
            wishlistService.listar().catch(() => [])
          ])

          if (cancelled) return

          const mapaProductos = new Map()
          
          if (Array.isArray(wishlist)) {
            wishlist.forEach(p => {
              if (p.url_tienda !== productFromExplore.url_tienda) {
                mapaProductos.set(p.url_tienda || p.id, p)
              }
            })
          }
          if (Array.isArray(relacionados)) {
            relacionados.forEach(p => {
              if (p.product_id !== productFromExplore.product_id && p.url_tienda !== productFromExplore.url_tienda) {
                if (!mapaProductos.has(p.url_tienda)) {
                  mapaProductos.set(p.url_tienda || p.product_id, p)
                }
              }
            })
          }

          setProductosAbajo(Array.from(mapaProductos.values()).slice(0, 16))
        } catch {
          if (!cancelled) setProductosAbajo([])
        }
        setLoading(false)
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

        const [wishlist, catalogo] = await Promise.all([
          wishlistService.listar().catch(() => []),
          wishlistService.buscarProductos('', data.categoria || '').catch(() => [])
        ])

        if (cancelled) return

        const mapaProductos = new Map()
        
        if (Array.isArray(wishlist)) {
          wishlist.forEach(x => {
            if (String(x.id) !== String(id)) {
              mapaProductos.set(x.url_tienda || x.id, x)
            }
          })
        }

        if (Array.isArray(catalogo)) {
          catalogo.forEach(x => {
            if (String(x.id) !== String(id) && String(x.product_id) !== String(id)) {
              if (!mapaProductos.has(x.url_tienda)) {
                mapaProductos.set(x.url_tienda || x.product_id || x.id, x)
              }
            }
          })
        }

        setProductosAbajo(Array.from(mapaProductos.values()).slice(0, 16))
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
    return () => { cancelled = true }
  }, [id, esVistaPreviaExplorar, productFromExplore])

  const handleCopyLink = () => {
    const url = esVistaPreviaExplorar ? item.url_tienda : `${window.location.origin}/wishdetail/${item.id}`
    navigator.clipboard.writeText(url)
      .then(() => {
        setStatusMessage({ type: 'success', text: 'Enlace copiado al portapapeles' })
        setCheckButton('copy')
      })
      .catch(() => setStatusMessage({ type: 'error', text: 'No se pudo copiar el enlace' }))
  }

  const handleDownload = async () => {
    if (!item?.imagen_url) return
    try {
      const res = await fetch(item.imagen_url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${item.nombre || 'producto'}.jpg`
      a.click()
      URL.revokeObjectURL(url)
      setStatusMessage({ type: 'success', text: 'Imagen descargada' })
      setCheckButton('download')
    } catch {
      window.open(item.imagen_url, '_blank')
      setStatusMessage({ type: 'success', text: 'Imagen abierta en nueva pestaña' })
      setCheckButton('download')
    }
  }

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
      alert('No se pudo guardar la wishlist: ' + (e.response?.data?.message || 'Error desconocido'))
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

  // ¡AQUÍ ESTÁ LA FUNCIÓN QUE FALTABA DECLARAR!
  const handleBotonPrincipal = () => {
    if (esVistaPreviaExplorar) guardarEnWishlist()
    else marcarAdquirido()
  }

  if (loading) return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#f6ccfa_0%,#ffffff_40%,#ffffff_60%,#f6ccfa_100%)] bg-fixed flex items-center justify-center text-gray-600">
      Cargando...
    </div>
  )

  if (error === 'login') return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#f6ccfa_0%,#ffffff_40%,#ffffff_60%,#f6ccfa_100%)] bg-fixed flex flex-col items-center justify-center gap-4 text-gray-700 px-6">
      <p>Inicia sesión para ver este artículo.</p>
      <button type="button" onClick={() => navigate('/login')} className="px-6 py-3 rounded-full bg-[#9f8aef] text-white font-medium">
        Ir a iniciar sesión
      </button>
    </div>
  )

  if (error || !item) return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#f6ccfa_0%,#ffffff_40%,#ffffff_60%,#f6ccfa_100%)] bg-fixed flex flex-col items-center justify-center gap-4 text-gray-700 px-6">
      <p>No encontramos este artículo.</p>
      <button type="button" onClick={() => navigate('/wishlist')} className="px-6 py-3 rounded-full bg-[#f6ccfa] text-gray-900 font-medium">
        Volver a la wishlist
      </button>
    </div>
  )

  const badges = [
    item.precio != null && item.precio !== '' ? `$${Number(item.precio).toFixed(2)}` : '',
    item.categoria ? fmt(item.categoria) : '',
    item.tienda ? fmt(item.tienda) : ''
  ].filter(Boolean)

  const prendasIzquierda = productosAbajo.slice(0, Math.ceil(productosAbajo.length / 2))
  const prendasDerecha   = productosAbajo.slice(Math.ceil(productosAbajo.length / 2))

  const botonPrincipalLabel = esVistaPreviaExplorar
    ? guardando ? 'Guardando…' : 'Guardar en Wishlist'
    : 'Adquirido'

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#f6ccfa_0%,#ffffff_40%,#ffffff_60%,#f6ccfa_100%)] bg-fixed">
      {statusMessage.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-2 bg-white transition-all ${
          statusMessage.type === 'success' ? 'border-[#79d063] text-gray-900' : 'border-red-300 text-red-600'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${statusMessage.type === 'success' ? 'bg-[#79d063]' : 'bg-red-500'}`} />
          {statusMessage.text}
        </div>
      )}

      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-50 py-4 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center">
          <button onClick={() => navigate('/')} className="h-10 w-auto cursor-pointer ml-8 mr-6 hover:opacity-90 transition-all">
            <img src={logo6} alt="PinWand" className="h-full w-auto object-contain" />
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

      {/* Contenedor Principal en Grid de 4 columnas */}
      <div className="max-w-[1340px] mx-auto px-6 pt-24 pb-10 grid grid-cols-5 gap-12">

        {/* COLUMNA IZQUIERDA: Detalle del item */}
        <div className="col-span-3">
          <div className="rounded-[32px] shadow-[0_1px_20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col mb-6 bg-white border border-gray-200">
            
            <div className="flex justify-between items-center p-6">
              <div className="flex gap-1">
                <button onClick={handleCopyLink} className={`p-3 rounded-full transition-colors ${checkButton === 'copy' ? 'bg-gray-100' : 'hover:bg-gray-100'}`} title="Copiar enlace">
                  {checkButton === 'copy' ? <Check className="w-6 h-6 text-green-500" /> : <LinkIcon className="w-6 h-6 text-gray-800" />}
                </button>
                <button onClick={handleDownload} className={`p-3 rounded-full transition-colors ${checkButton === 'download' ? 'bg-gray-100' : 'hover:bg-gray-100'}`} title="Descargar imagen">
                  {checkButton === 'download' ? <Check className="w-6 h-6 text-green-500" /> : <Download className="w-6 h-6 text-gray-800" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleBotonPrincipal}
                disabled={guardando}
                className="rounded-full px-6 py-3 font-bold shadow-md transition-all duration-300 text-lg bg-[#79d063] text-white hover:bg-[#79d063]/90 disabled:opacity-50"
              >
                {botonPrincipalLabel}
              </button>
            </div>

            <div className="px-6 pb-2 flex justify-center">
              {item.imagen_url ? (
                <img
                  src={item.imagen_url}
                  alt={item.nombre}
                  className="w-auto max-w-full max-h-[65vh] rounded-[24px] object-contain mx-auto block"
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
                  <a href={item.url_tienda} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    <span>Ver producto en tienda</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6m0 0h4m0 0v4m0 0h-4m6 0v4m0 0h-4" />
                    </svg>
                  </a>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {badges.map((text, i) => (
                  <span key={`${i}-${text}`} className="bg-white border border-[#f6ccfa] text-gray-700 px-5 py-2 rounded-full text-sm font-bold shadow-[inset_0_0_10px_rgba(246,204,250,0.3)]">
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Masonry breakpointCols={2} className="flex -ml-4 w-auto" columnClassName="pl-4 bg-clip-padding">
            {prendasIzquierda.map((item) => (
              <MiniPinWish key={item.id} item={item} 
                onNavigate={() => item.tienda === 'fakestore' || !item.id
                  ? navigate(`/wishdetail/new?from=wishlist-explore`, { state: { product: item } })
                  : navigate(`/wishdetail/${item.id}?from=wishlist-selection`)
                } 
              />
            ))}
          </Masonry>
        </div>


        {/* COLUMNA DERECHA: Masonry de productos relacionados */}
        <div className="col-span-2">
          
          <Masonry breakpointCols={2} className="flex -ml-4 w-auto" columnClassName="pl-4 bg-clip-padding">
            {prendasDerecha.map((item) => (
              <MiniPinWish key={item.id} item={item} 
                onNavigate={() => item.tienda === 'fakestore' || !item.id
                  ? navigate(`/wishdetail/new?from=wishlist-explore`, { state: { product: item } })
                  : navigate(`/wishdetail/${item.id}?from=wishlist-selection`)
                } 
              />
            ))}
          </Masonry>

        </div>

      </div>
    </div>
  )
}

const MiniPinWish = ({ item, onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleCopyLink = (e) => {
    e.stopPropagation()
    const url = item.id ? `${window.location.origin}/wishdetail/${item.id}` : item.url_tienda
    navigator.clipboard.writeText(url).catch(() => {})
    setMenuOpen(false)
  }

  const handleDownload = async (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!item.imagen_url) return
    try {
      const res = await fetch(item.imagen_url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${item.nombre || 'producto'}.jpg`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(item.imagen_url, '_blank')
    }
  }

  return (
    <div className="mb-4 break-inside-avoid group/mini cursor-pointer" onClick={onNavigate}>
      <div className="relative rounded-[20px] overflow-hidden bg-white shadow-sm border border-gray-100">
        <img 
          src={item.imagen_url} 
          alt={item.nombre} 
          className="w-full object-cover rounded-[20px] transition-transform duration-500 group-hover/mini:scale-105" 
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/mini:opacity-100 transition-opacity duration-300 rounded-[20px]" />
      </div>

      <div className="mt-2 px-1 flex items-center justify-between gap-2 relative">
        <p className="text-sm font-semibold text-gray-800 truncate flex-1">{item.nombre}</p>
        <div className="relative flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(prev => !prev) }}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3" cy="8" r="1.4" fill="#374151"/>
              <circle cx="8" cy="8" r="1.4" fill="#374151"/>
              <circle cx="13" cy="8" r="1.4" fill="#374151"/>
            </svg>
          </button>
          
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setMenuOpen(false) }} />
              <div className="absolute bottom-8 right-0 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[170px]">
                <button onClick={handleCopyLink} className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Copiar enlace
                </button>
                <button onClick={handleDownload} className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar imagen
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default WishDetail