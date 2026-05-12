import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { Search, ExternalLink, Trash, Sparkles, X, Plus } from 'lucide-react'
import logo3 from '../assets/logo3.png'
import wishlistService from '../services/wishlistService'

const WishlistPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'seleccion')
  const [showSuggestion, setShowSuggestion] = useState(true)

  const [wishlist, setWishlist] = useState([])
  const [loadingWishlist, setLoadingWishlist] = useState(false)
  const [exploreProducts, setExploreProducts] = useState([])
  const [loadingExplore, setLoadingExplore] = useState(false)
  const [wishlistSearch, setWishlistSearch] = useState('')
  const [exploreQ, setExploreQ] = useState('')
  const [exploreCat, setExploreCat] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    url: '',
    imageFile: null,
    imagePreview: '',
    descripcion: '',
    categoria: ''
  })

  const loadWishlist = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setWishlist([])
      return
    }
    setLoadingWishlist(true)
    try {
      const data = await wishlistService.listar()
      setWishlist(Array.isArray(data) ? data : [])
    } catch {
      setWishlist([])
    } finally {
      setLoadingWishlist(false)
    }
  }, [])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab) setActiveTab(tab)
    else setActiveTab('seleccion')
  }, [location.search])

  useEffect(() => {
    if (activeTab !== 'explorar') return
    const timer = setTimeout(async () => {
      if (!localStorage.getItem('token')) {
        setExploreProducts([])
        return
      }
      setLoadingExplore(true)
      try {
        const data = await wishlistService.buscarProductos(exploreQ.trim(), exploreCat)
        setExploreProducts(Array.isArray(data) ? data : [])
      } catch {
        setExploreProducts([])
      } finally {
        setLoadingExplore(false)
      }
    }, 380)
    return () => clearTimeout(timer)
  }, [activeTab, exploreQ, exploreCat])

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = (event) => {
        setFormData((prev) => ({ ...prev, imagePreview: event.target.result }))
      }
      reader.readAsDataURL(file)
      setFormData((prev) => ({ ...prev, imageFile: file }))
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageFile: null, imagePreview: '' }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!localStorage.getItem('token')) {
      Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Inicia sesión para añadir productos a tu wishlist.',
      confirmButtonColor: '#9f8aef'
    })
      return
    }
    if (!formData.url?.trim() && !formData.imageFile) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Añade una URL o una imagen del producto.',
        confirmButtonColor: '#9f8aef'
      })
      return
    }
    if (!formData.categoria) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Selecciona una categoría.',
        confirmButtonColor: '#9f8aef'
      })
      return
    }

    const url_tienda =
      formData.url?.trim() || `https://wishlist.local/manual/${Date.now()}`
    const nombre = (
      formData.descripcion?.trim() ||
      formData.url?.trim() ||
      'Producto deseado'
    ).slice(0, 500)

    setFormSubmitting(true)
    try {
      await wishlistService.agregar({
        nombre,
        url_tienda,
        imagen_url: null,
        precio: null
      })
      setFormData({
        url: '',
        imageFile: null,
        imagePreview: '',
        descripcion: '',
        categoria: ''
      })
      await loadWishlist()
      navigate('/wishlist?tab=seleccion')
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo guardar el producto.',
        confirmButtonColor: '#9f8aef'
      })
    } finally {
      setFormSubmitting(false)
    }
  }

  const eliminarItem = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('¿Quitar este producto de tu selección?')) return
    try {
      await wishlistService.eliminar(id)
      await loadWishlist()
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el producto.',
        confirmButtonColor: '#9f8aef'
      })
    }
  }

  const marcarAdquirido = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('¿Marcar como adquirido? Se quitará de la wishlist (simulación de paso al armario).')) return
    try {
      await wishlistService.moverAlArmario(id)
      await loadWishlist()
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar.',
        confirmButtonColor: '#9f8aef'
      })
    }
  }

  const guardarProductoExplorar = async (e, p) => {
    e.stopPropagation()
    if (!localStorage.getItem('token')) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Inicia sesión para guardar en tu wishlist.',
        confirmButtonColor: '#9f8aef'
      })
      return
    }
    try {
      await wishlistService.agregar({
        nombre: p.nombre,
        imagen_url: p.imagen_url,
        precio: p.precio,
        url_tienda: p.url_tienda
      })
      await loadWishlist()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo guardar.',
        confirmButtonColor: '#9f8aef'
      })
    }
  }

  const abrirDetalleExplorar = (p) => {
    navigate('/wishdetail/new?from=wishlist-explore', { state: { product: p } })
  }

  const abrirDetalleSeleccion = (id) => {
    navigate(`/wishdetail/${id}?from=wishlist-selection`)
  }

  const tabs = [
    { id: 'seleccion', label: 'Mi Selección' },
    { id: 'explorar', label: 'Explorar' },
    { id: 'añadir', label: 'Añadir Producto' }
  ]

  const filtradosSeleccion = wishlist.filter((item) => {
    if (!wishlistSearch.trim()) return true
    return item.nombre?.toLowerCase().includes(wishlistSearch.trim().toLowerCase())
  })

  const breakpointColumnsObj = {
    default: 5,
    1200: 4,
    900: 3,
    600: 2,
    400: 1
  }

  const exploreFilters = [
    { id: '', label: 'Todo' },
    { id: 'mujer', label: 'Mujer' },
    { id: 'hombre', label: 'Hombre' }
  ]

  return (
    <div className="min-h-screen relative">
      <header className="sticky top-0 z-30 bg-[#ffffff] shadow-sm px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="h-10 w-auto cursor-pointer mr-6 hover:opacity-90 transition-all"
          >
            <img src={logo3} alt="PinWand" className="h-full w-auto object-contain" />
          </button>

          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  navigate(`/wishlist?tab=${tab.id}`)
                }}
                className={`
                  px-4 py-2 font-medium transition-all duration-300 rounded-2xl
                  ${activeTab === tab.id ? 'bg-morado text-white' : 'text-gray-900 hover:bg-rosado/30'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                value={wishlistSearch}
                onChange={(e) => setWishlistSearch(e.target.value)}
                disabled={activeTab !== 'seleccion'}
                placeholder={
                  activeTab === 'seleccion'
                    ? 'Buscar en mi Wishlist…'
                    : 'Activa “Mi Selección” para filtrar tu lista'
                }
                className="w-full pl-12 pr-4 py-3 bg-[#ffffff] rounded-full border-2 border-rosado/50 focus:border-rosado focus:ring-0 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-600 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 bg-[linear-gradient(to_bottom,#f6ccfa_0%,#ffffff_40%,#ffffff_60%,#f6ccfa_100%)] bg-fixed min-h-screen">
        {!localStorage.getItem('token') && (
          <div className="mb-6 rounded-2xl border border-rosado/40 bg-white px-6 py-4 text-center text-gray-700">
            Inicia sesión para ver tu wishlist y explorar productos desde el catálogo (Fake Store API).
          </div>
        )}

        {activeTab === 'seleccion' && (
          <div>
            {loadingWishlist && (
              <p className="text-center text-gray-600 py-8">Cargando tu selección…</p>
            )}
            {!loadingWishlist && filtradosSeleccion.length === 0 && localStorage.getItem('token') && (
              <p className="text-center text-gray-600 py-8">
                {wishlist.length === 0
                  ? 'Aún no guardaste productos. Explora la pestaña “Explorar” o añade uno manualmente.'
                  : 'Ningún producto coincide con la búsqueda.'}
              </p>
            )}
            {!loadingWishlist && filtradosSeleccion.length > 0 && (
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="flex gap-6"
                columnClassName="flex-1"
              >
                {filtradosSeleccion.map((item) => (
                  <div key={item.id} className="mb-6 break-inside-avoid">
                    <div
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => abrirDetalleSeleccion(item.id)}
                      onKeyDown={(e) => e.key === 'Enter' && abrirDetalleSeleccion(item.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="relative overflow-hidden">
                        {item.imagen_url ? (
                          <img
                            src={item.imagen_url}
                            alt={item.nombre}
                            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full min-h-[200px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm p-6">
                            Sin imagen
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <button
                          type="button"
                          onClick={(e) => eliminarItem(e, item.id)}
                          className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => marcarAdquirido(e, item.id)}
                          className="absolute top-4 right-4 bg-[#79d063] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#79d063]/90"
                        >
                          Adquirido
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            {item.nombre}
                            {item.url_tienda && (
                              <a
                                href={item.url_tienda}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3 text-gray-500 hover:text-rosado" />
                              </a>
                            )}
                          </h3>
                        </div>
                        {item.precio != null && (
                          <p className="text-[#9f8aef] text-sm font-semibold">${Number(item.precio).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </Masonry>
            )}
          </div>
        )}

        {activeTab === 'explorar' && (
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-sm font-medium text-gray-700">Catálogo (Fake Store):</span>
              {exploreFilters.map((f) => (
                <button
                  key={f.id || 'all'}
                  type="button"
                  onClick={() => setExploreCat(f.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    exploreCat === f.id ? 'bg-morado text-white' : 'bg-white border border-rosado/40 text-gray-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <div className="flex-1 min-w-[200px] max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={exploreQ}
                  onChange={(e) => setExploreQ(e.target.value)}
                  placeholder="Buscar por nombre o descripción…"
                  className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-rosado/40 focus:border-rosado focus:outline-none text-sm"
                />
              </div>
            </div>
            {loadingExplore && <p className="text-center text-gray-600 py-8">Cargando productos…</p>}
            {!loadingExplore && exploreProducts.length === 0 && localStorage.getItem('token') && (
              <p className="text-center text-gray-600 py-8">No hay productos para mostrar. Prueba otra búsqueda o categoría.</p>
            )}
            {!loadingExplore && exploreProducts.length > 0 && (
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="flex gap-6"
                columnClassName="flex-1"
              >
                {exploreProducts.map((p) => (
                  <div key={`${p.tienda}-${p.product_id}`} className="mb-6 break-inside-avoid">
                    <div
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => abrirDetalleExplorar(p)}
                      onKeyDown={(e) => e.key === 'Enter' && abrirDetalleExplorar(p)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={p.imagen_url}
                          alt={p.nombre}
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-t-3xl">
                          <button
                            type="button"
                            onClick={(e) => guardarProductoExplorar(e, p)}
                            className="bg-white rounded-full p-4 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-rosado/20"
                            title="Guardar en mi wishlist"
                          >
                            <Plus className="w-8 h-8 text-morado" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{p.nombre}</h3>
                        <p className="text-[#9f8aef] text-sm font-semibold">${Number(p.precio).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </Masonry>
            )}
          </div>
        )}

        {activeTab === 'añadir' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-md border border-rosado/30 mt-8 mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-[#f6ccfa] rounded-full p-3">
                <Plus className="w-6 h-6 text-morado" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Añade tu objeto de deseo</h2>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL del producto</label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-rosado focus:ring-0 outline-none transition-all text-gray-800 bg-white"
                  placeholder="https://…"
                />
                <p className="text-xs text-gray-500 mt-1">Si solo subes foto, se generará un enlace interno para poder guardarlo en la base de datos.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">o subí una foto (opcional)</label>
                <div
                  className="relative border-2 border-dashed border-rosado/50 rounded-2xl p-8 text-center cursor-pointer hover:bg-rosado/10 transition-colors"
                  onClick={() => document.getElementById('imageInput')?.click()}
                >
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {formData.imagePreview ? (
                    <div className="relative">
                      <img src={formData.imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-rosado/20 rounded-full p-4 mb-4 inline-block">
                        <Plus className="w-8 h-8 text-morado" />
                      </div>
                      <p className="text-gray-600 text-sm">Imagen de referencia (la URL sigue siendo la fuente principal para la tienda)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre / notas</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-rosado focus:ring-0 outline-none transition-all text-gray-800 resize-none"
                  placeholder="Nombre del producto o notas…"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-rosado focus:ring-0 outline-none transition-all text-gray-800 bg-white cursor-pointer"
                >
                  <option value="">Seleccioná una categoría</option>
                  <option value="tops">Tops y camisas</option>
                  <option value="pantalones">Pantalones y jeans</option>
                  <option value="vestidos">Vestidos y faldas</option>
                  <option value="calzado">Calzado</option>
                  <option value="abrigos">Abrigos y blazers</option>
                  <option value="accesorios">Accesorios</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full bg-[#79d063] text-white rounded-xl py-5 font-semibold text-lg shadow-lg hover:scale-[1.02] transition-all duration-300 mt-6 flex items-center justify-center disabled:opacity-60"
              >
                <Plus className="w-5 h-5 mr-2" />
                {formSubmitting ? 'Guardando…' : 'Agregar a mi Selección'}
              </button>
            </form>
          </div>
        )}
      </main>

      {showSuggestion && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-amarillo/90 backdrop-blur-sm border border-amarillo rounded-3xl p-4 shadow-lg max-w-sm mx-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Sparkles className="w-5 h-5 text-morado" />
            </div>
            <div className="flex-1">
              <p className="text-gray-800 text-sm font-medium">
                <span className="font-semibold"> Sugerencia:</span> Explora productos reales del catálogo y guárdalos en un clic con el botón +.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSuggestion(false)}
              className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WishlistPage
