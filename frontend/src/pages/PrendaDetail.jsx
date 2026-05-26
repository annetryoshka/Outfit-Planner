import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom'
import { Search, Heart, Link as LinkIcon, Download, Check } from 'lucide-react'
import Masonry from 'react-masonry-css'
import logo6 from '../assets/logo6.png'
import prendaService from '../services/prendaService'
import authService from '../services/authService'
import guardadoService from '../services/guardadoService'
import likeService from '../services/likeService'

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

  const [guardado, setGuardado] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)

  const [guardadosIds, setGuardadosIds] = useState(new Set())
  const [guardandoMiniId, setGuardandoMiniId] = useState(null)

  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })
  const [checkButton, setCheckButton] = useState(null)

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
    const load = async () => {
      if (!id) { setLoading(false); setError('notfound'); return }
      setLoading(true); setError(null)
      try {
        const [p, todas] = await Promise.all([
          prendaService.obtenerPorId(id),
          prendaService.obtenerPublicas().catch(() => [])
        ])
        if (cancelled) return
        // DEBUG: descomenta para ver qué campos devuelve tu backend
        // console.log('Prenda recibida del backend:', p)
        setPrenda(p)
        setLikesCount(p.likes_count || 0)
        const lista = Array.isArray(todas) ? todas : []
        setPrendasRelacionadas(lista.filter(x => String(x.id) !== String(id)).slice(0, 12))
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
  }, [id])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !id) return
    guardadoService.obtenerMisGuardados()
      .then(data => {
        const ids = new Set((Array.isArray(data) ? data : []).map(p => String(p.id)))
        setGuardadosIds(ids)
        setGuardado(ids.has(String(id)))
      })
      .catch(() => {})
    likeService.verificarLike(id)
      .then(data => setLiked(data.tienelike))
      .catch(() => {})
  }, [id])

  const handleCopyLink = () => {
    const url = `${window.location.origin}/prenda/${prenda.id}`
    navigator.clipboard.writeText(url)
      .then(() => {
        setStatusMessage({ type: 'success', text: 'Enlace copiado al portapapeles' })
        setCheckButton('copy')
      })
      .catch(() => setStatusMessage({ type: 'error', text: 'No se pudo copiar el enlace' }))
  }

  const handleDownload = async () => {
    if (!prenda?.imagen_url) return
    try {
      const res = await fetch(prenda.imagen_url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${prenda.nombre || 'prenda'}.jpg`
      a.click()
      URL.revokeObjectURL(url)
      setStatusMessage({ type: 'success', text: 'Imagen descargada' })
      setCheckButton('download')
    } catch {
      window.open(prenda.imagen_url, '_blank')
      setStatusMessage({ type: 'success', text: 'Imagen abierta en nueva pestaña' })
      setCheckButton('download')
    }
  }

  const toggleLike = async () => {
    if (likeLoading) return
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    setLikeLoading(true)
    try {
      if (liked) {
        await likeService.quitarLike(prenda.id)
        setLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
      } else {
        await likeService.darLike(prenda.id)
        setLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error al dar/quitar like:', error)
    } finally {
      setLikeLoading(false)
    }
  }

  const toggleGuardar = async () => {
    if (guardando) return
    setGuardando(true)
    try {
      if (guardado) {
        await guardadoService.desguardar(prenda.id)
        setGuardado(false)
        setGuardadosIds(prev => { const next = new Set(prev); next.delete(String(prenda.id)); return next })
      } else {
        await guardadoService.guardar(prenda.id)
        setGuardado(true)
        setGuardadosIds(prev => new Set([...prev, String(prenda.id)]))
      }
    } catch { /* silencioso */ } finally {
      setGuardando(false)
    }
  }

  const toggleGuardarMini = async (e, itemId) => {
    e.stopPropagation()
    if (guardandoMiniId === itemId) return
    const yaGuardado = guardadosIds.has(String(itemId))
    setGuardandoMiniId(itemId)
    try {
      if (yaGuardado) {
        await guardadoService.desguardar(itemId)
        setGuardadosIds(prev => { const next = new Set(prev); next.delete(String(itemId)); return next })
      } else {
        await guardadoService.guardar(itemId)
        setGuardadosIds(prev => new Set([...prev, String(itemId)]))
      }
    } catch { /* silencioso */ } finally {
      setGuardandoMiniId(null)
    }
  }

  const prendasIzquierda = prendasRelacionadas.slice(0, 6)
  const prendasDerecha   = prendasRelacionadas.slice(6)

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafbad] from-5% via-white via-50% to-[#fafbad] to-95% bg-fixed flex items-center justify-center text-gray-600">
      Cargando prenda...
    </div>
  )

  if (error === 'login') return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafbad] from-5% via-white via-50% to-[#fafbad] to-95% bg-fixed flex flex-col items-center justify-center gap-4 text-gray-700 px-6">
      <p>Inicia sesion para ver esta prenda.</p>
      <button type="button" onClick={() => navigate('/login')} className="px-6 py-3 rounded-full bg-[#9f8aef] text-white font-medium">
        Ir a iniciar sesion
      </button>
    </div>
  )

  if (error || !prenda) return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafbad] from-5% via-white via-50% to-[#fafbad] to-95% bg-fixed flex flex-col items-center justify-center gap-4 text-gray-700 px-6">
      <p>{error === 'notfound' ? 'No encontramos esa prenda.' : 'No se pudo cargar la prenda.'}</p>
      <button type="button" onClick={() => navigate('/')} className="px-6 py-3 rounded-full bg-[#f6ccfa] text-gray-900 font-medium">
        Volver al inicio
      </button>
    </div>
  )

  const currentUser = authService.getCurrentUser()
  const miUserId = currentUser?.id ?? null
  const esMia = !isFromWishlist && currentUser && prenda.user_id != null && String(prenda.user_id) === String(currentUser.id)

  const badges = [
    fmt(prenda.categoria), fmt(prenda.tipo), fmt(prenda.color), fmt(prenda.temporada),
    prenda.talla ? `Talla ${String(prenda.talla).toUpperCase()}` : '',
    fmt(prenda.material), prenda.marca ? fmt(prenda.marca) : ''
  ].filter(Boolean)

  const nombreAutor = prenda.autor_nombre && prenda.autor_apellido
    ? `${prenda.autor_nombre} ${prenda.autor_apellido}`
    : prenda.autor_nombre || 'Usuario anonimo'

  // Intentamos obtener el user_id con los posibles nombres de campo que puede mandar el backend
  const autorUserId = prenda.user_id || prenda.autor_id || prenda.userId || null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafbad] from-5% via-white via-50% to-[#fafbad] to-95% bg-fixed">
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

      {/* Contenedor Principal */}
      <div className="max-w-[1260px] mx-auto px-4 pt-24 pb-10 grid grid-cols-4 gap-6">

        {/* Bloque Izquierdo */}
        <div className="col-span-2">
          <div className="rounded-[32px] shadow-[0_1px_20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col mb-6 bg-white border border-gray-200">

            {/* Header interno */}
            <div className="flex justify-between items-center p-6">
              <div className="flex gap-1">
                <button
                  onClick={toggleLike}
                  disabled={likeLoading}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors group disabled:opacity-50"
                >
                  <Heart className={`w-6 h-6 transition-all ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-400'}`} />
                </button>
                {likesCount > 0 && (
                  <span className="flex items-center text-sm text-gray-600 font-medium px-2">{likesCount}</span>
                )}
                <button onClick={handleCopyLink} className={`p-3 rounded-full transition-colors ${checkButton === 'copy' ? 'bg-gray-100' : 'hover:bg-gray-100'}`} title="Copiar enlace">
                  {checkButton === 'copy' ? <Check className="w-6 h-6 text-green-500" /> : <LinkIcon className="w-6 h-6 text-gray-800" />}
                </button>
                <button onClick={handleDownload} className={`p-3 rounded-full transition-colors ${checkButton === 'download' ? 'bg-gray-100' : 'hover:bg-gray-100'}`} title="Descargar imagen">
                  {checkButton === 'download' ? <Check className="w-6 h-6 text-green-500" /> : <Download className="w-6 h-6 text-gray-800" />}
                </button>
              </div>

              {isFromWishlist ? (
                <button type="button" className="bg-[#79d063] text-white rounded-full px-6 py-3 font-bold shadow-md hover:bg-[#79d063]/90 transition-all duration-300 text-lg">
                  Guardar en Wishlist
                </button>
              ) : esMia ? (
                <button type="button" onClick={() => navigate(`/editar-prenda/${prenda.id}`)} className="bg-[#9f8aef] text-white rounded-full px-6 py-3 font-bold shadow-md hover:bg-[#9f8aef]/90 transition-all duration-300 text-lg">
                  Editar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleGuardar}
                  disabled={guardando}
                  className={`rounded-full px-6 py-3 font-bold shadow-md transition-all duration-300 text-lg disabled:opacity-60 ${guardado ? 'bg-[#9f8aef] text-white hover:bg-[#9f8aef]/90' : 'bg-[#79d063] text-white hover:bg-[#79d063]/90'}`}
                >
                  {guardando ? '...' : guardado ? 'Guardado' : 'Guardar'}
                </button>
              )}
            </div>

            {/* Imagen */}
            <div className="px-6 pb-2 flex justify-center">
              <img
                src={prenda.imagen_url}
                alt={prenda.nombre || 'Prenda'}
                className="w-auto max-w-full max-h-[65vh] rounded-[24px] object-contain mx-auto block"
              />
            </div>

            {/* Info */}
            <div className="px-6 pb-8 pt-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{prenda.nombre}</h1>

              {/*
                NOMBRE DEL AUTOR - cliqueable
                Si el link no funciona, abre la consola del navegador (F12) y busca
                "Campos de prenda" para ver que campo tiene el user_id real.
                Luego avisame y lo ajusto.
              */}
              {console.log('Campos de prenda (para debug):', Object.keys(prenda), '| user_id:', prenda.user_id, '| autor_id:', prenda.autor_id)}
              <p className="text-sm text-gray-500 mb-4">
                Subido por{' '}
                {autorUserId ? (
                  <Link
                    to={`/perfil/${autorUserId}`}
                    className="font-semibold text-gray-700 hover:text-[#9f8aef] transition-colors underline-offset-2 hover:underline"
                  >
                    {nombreAutor}
                  </Link>
                ) : (
                  <span className="font-semibold text-gray-700">{nombreAutor}</span>
                )}
              </p>

              {isFromWishlist && (
                <div className="mb-4">
                  <a href="#" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
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

          <Masonry breakpointCols={2} className="flex gap-6" columnClassName="flex-1">
            {prendasIzquierda.map((item) => (
              <MiniPin key={item.id} item={item} miUserId={miUserId} guardadosIds={guardadosIds} guardandoId={guardandoMiniId} onNavigate={() => navigate(`/prenda/${item.id}`)} onEdit={e => { e.stopPropagation(); navigate(`/editar-prenda/${item.id}`) }} onGuardar={e => toggleGuardarMini(e, item.id)} />
            ))}
          </Masonry>
        </div>

        {/* Bloque Derecho */}
        <div className="col-span-2">
          <Masonry breakpointCols={2} className="flex gap-6" columnClassName="flex-1">
            {prendasDerecha.map((item) => (
              <MiniPin key={item.id} item={item} miUserId={miUserId} guardadosIds={guardadosIds} guardandoId={guardandoMiniId} onNavigate={() => navigate(`/prenda/${item.id}`)} onEdit={e => { e.stopPropagation(); navigate(`/editar-prenda/${item.id}`) }} onGuardar={e => toggleGuardarMini(e, item.id)} />
            ))}
          </Masonry>
        </div>

      </div>
    </div>
  )
}

const MiniPin = ({ item, miUserId, guardadosIds, guardandoId, onNavigate, onEdit, onGuardar }) => {
  const esMio = String(item.user_id) === String(miUserId)
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleCopyLink = (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}/prenda/${item.id}`
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
      a.download = `${item.nombre || 'prenda'}.jpg`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(item.imagen_url, '_blank')
    }
  }

  return (
    <div className="mb-4 break-inside-avoid group/mini cursor-pointer" onClick={onNavigate}>
      <div className="relative rounded-[20px] overflow-hidden">
        <img src={item.imagen_url} alt={item.nombre || 'Prenda relacionada'} className="w-full object-cover rounded-[20px] transition-transform duration-500 group-hover/mini:scale-105" />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/mini:opacity-100 transition-opacity duration-300 rounded-[20px]" />
        {esMio ? (
          <button onClick={onEdit} className="absolute top-3 right-3 bg-[#9f8aef] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover/mini:opacity-100 transition-opacity duration-300 text-sm shadow-md">
            Editar
          </button>
        ) : (
          <button
            onClick={onGuardar}
            disabled={guardandoId === item.id}
            className={`absolute top-3 right-3 text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover/mini:opacity-100 transition-all duration-300 text-sm shadow-md disabled:opacity-60 ${guardadosIds.has(String(item.id)) ? 'bg-[#9f8aef]' : 'bg-[#79d063]'}`}
          >
            {guardandoId === item.id ? '...' : guardadosIds.has(String(item.id)) ? 'Guardado' : 'Guardar'}
          </button>
        )}
      </div>

      <div className="mt-2 px-1 flex items-center justify-between gap-2 relative">
        <p className="text-sm font-semibold text-gray-800 truncate flex-1">{item.nombre}</p>
        <div className="relative flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(prev => !prev) }}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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

export default PrendaDetail