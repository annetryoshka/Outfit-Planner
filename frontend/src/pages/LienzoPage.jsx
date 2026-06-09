import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas, FabricImage } from 'fabric'
import { Save, Trash2, ChevronLeft, Sparkles, Shirt, Package, ArrowUp, ShoppingBasket, Layers, CircleDot } from 'lucide-react'
import Swal from 'sweetalert2'
import Masonry from 'react-masonry-css'
import outfitService from '../services/outfitService'
import prendaService from '../services/prendaService'
import { normalizeForDb } from '../utils/normalizeForDb'

const TIPO_CATEGORIAS = {
  Superior: ['Camisa', 'Polera', 'Blusa', 'Chompa', 'Abrigo', 'Chaquetas'],
  Inferior: ['Pantalón', 'Shorts', 'Falda', 'Jeans'],
  Otros:    ['Vestido', 'Calzado', 'Bolso', 'Bufanda', 'Guantes', 'Accesorio', 'Otros'],
}
const TIPOS = Object.keys(TIPO_CATEGORIAS)

// Ícono por tipo usando Lucide React
const TIPO_ICON = {
  Superior: <Shirt size={18} />,
  Inferior: <Layers size={18} />,
  Otros: <CircleDot size={18} />,
}

const CAT_ICON = {
  Camisa: <Shirt size={16} />,
  Polera: <Shirt size={16} />,
  Blusa: <Shirt size={16} />,
  Chompa: <Shirt size={16} />,
  Abrigo: <Shirt size={16} />,
  Chaquetas: <Shirt size={16} />,
  Pantalón: <Package size={16} />,
  Shorts: <Package size={16} />,
  Falda: <Package size={16} />,
  Jeans: <Package size={16} />,
  Vestido: <Package size={16} />,
  Calzado: <Package size={16} />,
  Bolso: <Package size={16} />,
  Bufanda: <Package size={16} />,
  Guantes: <Package size={16} />,
  Accesorio: <Package size={16} />,
  Otros: <Package size={16} />,
}

const COLORES_FONDO = ['#ffffff','#000000','#f6ccfa','#c2e1f9','#fafbad','#fde8e8','#d4f1d4','#3D2B1F']

const PrendaPin = ({ prenda, onAgregar }) => (
  <div className="mb-2 break-inside-avoid">
    <button type="button" onClick={() => onAgregar(prenda)}
      className="w-full group rounded-xl overflow-hidden border border-gray-100 hover:border-[#9f8aef]/40 bg-white transition-all hover:shadow-md text-left">
      <div className="relative overflow-hidden">
        <img src={prenda.imagen_url} alt={prenda.nombre}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="block w-full text-center bg-[#9f8aef] text-white text-[0.6rem] font-bold py-1 rounded-lg">
            + Agregar
          </span>
        </div>
      </div>
      <div className="px-2 py-1.5">
        <p className="text-[0.65rem] font-semibold text-gray-700 truncate group-hover:text-[#9f8aef] transition-colors">
          {prenda.nombre}
        </p>
      </div>
    </button>
  </div>
)

export default function LienzoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState(null)
  const [prendas, setPrendas] = useState([])
  const [outfit, setOutfit] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [eliminandoOutfit, setEliminandoOutfit] = useState(false)
  const [confirmAction, setConfirmAction] = useState({ show: false, type: '', action: null })
  const [fondoColor, setFondoColor] = useState('#ffffff')
  const fondoColorRef = useRef(fondoColor)
  fondoColorRef.current = fondoColor
  const [tipoActivo, setTipoActivo] = useState('Superior')
  const [catActiva, setCatActiva] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [quitandoFondo, setQuitandoFondo] = useState(false)

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const c = new Canvas(el, { width: 650, height: 500, backgroundColor: '#ffffff' })
    setCanvas(c)
    return () => { void c.dispose() }
  }, [])

  useEffect(() => {
    if (!canvas) return
    const onDown = (opt) => {
      if (opt.e.button === 2) {
        opt.e.preventDefault(); opt.e.stopPropagation()
        const obj = opt.target; if (!obj) return
        const rect = canvasRef.current.getBoundingClientRect()
        setContextMenu({ x: opt.e.clientX - rect.left, y: opt.e.clientY - rect.top, obj })
      }
    }
    const onBefore = (opt) => { if (opt.e.button !== 2) setContextMenu(null) }
    canvas.on('mouse:down', onDown)
    canvas.on('mouse:down:before', onBefore)
    return () => { canvas.off('mouse:down', onDown); canvas.off('mouse:down:before', onBefore) }
  }, [canvas])

  useEffect(() => {
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  useEffect(() => {
    if (id) outfitService.obtenerPorId(id).then(setOutfit).catch(() => {})
    prendaService.obtenerTodas().then(setPrendas).catch(() => {})
  }, [id])

  useEffect(() => {
    if (!canvas || !outfit?.canvas_data) return
    canvas.loadFromJSON(outfit.canvas_data)
      .then(() => { canvas.backgroundColor = fondoColorRef.current; canvas.requestRenderAll() })
      .catch(err => console.error(err))
  }, [canvas, outfit?.canvas_data])

  const prendasFiltradas = catActiva
    ? prendas.filter(p => normalizeForDb(p.categoria) === normalizeForDb(catActiva))
    : []

  const agregarPrenda = (prenda) => {
    if (!canvas || !prenda.imagen_url) return
    FabricImage.fromURL(prenda.imagen_url, { crossOrigin: 'anonymous' })
      .then(img => {
        img.scaleToHeight(150)
        img.set({ left: 80, top: 80, hasControls: true })
        canvas.add(img); canvas.setActiveObject(img); canvas.requestRenderAll()
      }).catch(() => {})
  }

  const eliminarPrendaDelCanvas = () => {
    if (!canvas) return
    const obj = contextMenu?.obj || canvas.getActiveObject()
    if (obj) { canvas.remove(obj); canvas.requestRenderAll() }
    setContextMenu(null)
  }

  const cambiarFondo = (color) => {
    setFondoColor(color)
    if (canvas) { canvas.backgroundColor = color; canvas.requestRenderAll() }
  }

  const quitarFondoPrenda = async () => {
    const obj = contextMenu?.obj
    if (!obj || !canvas) return
    if (obj.type !== 'image') {
      Swal.fire({ icon: 'info', title: 'No aplicable', text: 'Solo se puede quitar el fondo a imágenes.', confirmButtonColor: '#9f8aef' })
      setContextMenu(null); return
    }
    setContextMenu(null); setQuitandoFondo(true)
    const origLeft = obj.left, origTop = obj.top
    try {
      const tc = document.createElement('canvas')
      const b = obj.getBoundingRect()
      tc.width = Math.ceil(b.width); tc.height = Math.ceil(b.height)
      obj.set({ left: tc.width / 2, top: tc.height / 2 }); obj.setCoords()
      const tf = new Canvas(tc); tf.add(obj); tf.renderAll()
      const dataUrl = tc.toDataURL('image/png')
      obj.set({ left: origLeft, top: origTop }); obj.setCoords()
      tf.remove(obj); tf.dispose()
      canvas.add(obj); canvas.setActiveObject(obj); canvas.requestRenderAll()
      const fr = await fetch(dataUrl); const blob = await fr.blob()
      const file = new File([blob], 'prenda.png', { type: 'image/png' })
      const fd = new FormData(); fd.append('imagen', file)
      const resultBlob = await prendaService.quitarFondoPreview(fd)
      const url = URL.createObjectURL(resultBlob)
      const nueva = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
      nueva.set({ left: origLeft, top: origTop, scaleX: obj.scaleX, scaleY: obj.scaleY, angle: obj.angle, hasControls: true })
      nueva.setCoords(); canvas.remove(obj); canvas.add(nueva)
      canvas.setActiveObject(nueva); canvas.requestRenderAll()
      URL.revokeObjectURL(url)
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'No se pudo procesar.', confirmButtonColor: '#9f8aef' })
    } finally { setQuitandoFondo(false) }
  }

  const eliminarOutfit = () => {
    if (!id) return
    setConfirmAction({
      show: true, type: 'eliminar',
      action: async () => {
        setEliminandoOutfit(true)
        try { await outfitService.eliminar(id); navigate('/perfil?tab=outfits') }
        catch (err) { Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message, confirmButtonColor: '#9f8aef' }) }
        finally { setEliminandoOutfit(false); setConfirmAction({ show: false, type: '', action: null }) }
      }
    })
  }

  const guardar = async () => {
    if (!canvas || !id) return
    setGuardando(true)
    try {
      const jsonData = canvas.toJSON()
      const objetos = canvas.getObjects()
      if (objetos.length === 0) {
        Swal.fire({ icon: 'error', title: 'Vacío', text: 'Agrega prendas antes de guardar.', confirmButtonColor: '#9f8aef' })
        setGuardando(false); return
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      objetos.forEach(obj => {
        const b = obj.getBoundingRect()
        if (b.left < minX) minX = b.left; if (b.top < minY) minY = b.top
        if (b.left + b.width > maxX) maxX = b.left + b.width
        if (b.top + b.height > maxY) maxY = b.top + b.height
      })
      const pad = 10
      const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.6, left: minX - pad, top: minY - pad, width: (maxX - minX) + pad * 2, height: (maxY - minY) + pad * 2 })
      const res = await fetch(dataUrl); const blob = await res.blob()
      const formData = new FormData()
      formData.append('imagen', blob, `preview_${id}.jpg`)
      formData.append('canvas_data', JSON.stringify(jsonData))
      if (outfit?.nombre) formData.append('nombre', outfit.nombre)
      if (outfit?.ocasion) formData.append('ocasion', outfit.ocasion)
      if (outfit?.es_publico !== undefined) formData.append('es_publico', outfit.es_publico)
      if (outfit?.fecha_calendario) formData.append('fecha_calendario', outfit.fecha_calendario)
      await outfitService.actualizar(id, formData)
      navigate('/perfil?tab=outfits')
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message, confirmButtonColor: '#9f8aef' })
    } finally { setGuardando(false) }
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden" onContextMenu={e => e.preventDefault()}>

      {quitandoFondo && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 border-4 border-[#9f8aef] border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-semibold text-sm">Quitando fondo...</p>
        </div>
      )}

      {confirmAction.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar este outfit?</h3>
            <p className="text-gray-500 text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction({ show: false, type: '', action: null })}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-2xl transition-all">
                Cancelar
              </button>
              <button onClick={confirmAction.action} disabled={eliminandoOutfit}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl transition-all disabled:opacity-50">
                {eliminandoOutfit ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ HEADER ════ */}
      <div className="bg-white border-b border-[#f6ccfa] px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <button type="button" onClick={() => navigate('/calendario')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#9f8aef] transition-colors">
          <ChevronLeft size={16} /> Volver
        </button>
        <h1 className="font-semibold text-gray-800 flex-1 truncate">{outfit?.nombre || 'Lienzo de Outfit'}</h1>
        <button type="button" onClick={eliminarOutfit} disabled={eliminandoOutfit}
          className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-500 border border-red-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50">
          <Trash2 size={13} /> {eliminandoOutfit ? 'Eliminando...' : 'Eliminar outfit'}
        </button>
        <button type="button" onClick={guardar} disabled={guardando}
          className="flex items-center gap-1.5 bg-[#9f8aef] text-white px-4 py-1.5 rounded-full text-sm hover:bg-[#9f8aef]/80 transition-colors disabled:opacity-50">
          <Save size={13} /> {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* ════ CUERPO 3 COLUMNAS ════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══ COL 1 — Panel inventario ══ */}
        <div className="w-64 bg-gray-50 border-r border-[#f6ccfa] flex flex-col overflow-hidden flex-shrink-0 p-3 gap-3">

          {/* Selector horizontal de tipo — panel con borde redondeado */}
          <div className="bg-white rounded-2xl border border-[#f6ccfa] shadow-sm overflow-hidden flex-shrink-0">
            <div className="flex">
              {TIPOS.map((tipo, i) => {
                const activo = tipoActivo === tipo
                return (
                  <button key={tipo} type="button"
                    onClick={() => { setTipoActivo(tipo); setCatActiva(null) }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all duration-300 ease-in-out relative
                      ${activo ? 'bg-[#9f8aef] text-white' : 'text-gray-400 hover:bg-[#f6ccfa]/40 hover:text-gray-700'}
                      ${i < TIPOS.length - 1 ? 'border-r border-[#f6ccfa]' : ''}
                    `}>
                    {!activo && <span className="text-gray-400 transition-opacity duration-300">{TIPO_ICON[tipo]}</span>}
                    {activo && <span className="capitalize tracking-wide leading-none">{tipo}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Panel de categorías — diseño profesional con separadores */}
          <div className="bg-white rounded-2xl border border-[#f6ccfa] shadow-sm flex-1 overflow-hidden flex flex-col">
            <p className="text-[0.6rem] text-gray-400 uppercase tracking-widest px-4 pt-3 pb-2 flex-shrink-0">
              Categorías
            </p>
            <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col">
              {TIPO_CATEGORIAS[tipoActivo].map((cat, index) => (
                <div key={cat} className="relative">
                  <button type="button"
                    onClick={() => setCatActiva(prev => prev === cat ? null : cat)}
                    className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-all duration-200 ${
                      catActiva === cat
                        ? 'text-[#9f8aef] font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}>
                    {cat}
                  </button>
                  {index < TIPO_CATEGORIAS[tipoActivo].length - 1 && (
                    <div className="ml-3 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ══ COL 2 — Fondo + Canvas ══ */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">

          {/* Barra de fondo CENTRADA respecto al canvas */}
          <div className="flex-shrink-0 flex justify-center pt-3 pb-2 px-4">
            <div className="bg-white border border-[#f6ccfa] rounded-2xl shadow-sm px-4 py-2 flex items-center gap-2.5 inline-flex">
              <span className="text-[0.6rem] text-gray-400 uppercase tracking-widest whitespace-nowrap">Fondo</span>
              <div className="w-px h-4 bg-[#f6ccfa]" />
              <div className="flex items-center gap-2">
                {COLORES_FONDO.map(color => (
                  <button key={color} type="button" onClick={() => cambiarFondo(color)}
                    className={`w-7 h-7 rounded-lg border-2 flex-shrink-0 transition-all duration-200 ${
                      fondoColor === color
                        ? 'border-[#9f8aef] scale-125 shadow-md'
                        : 'border-transparent hover:border-gray-300 hover:scale-110'
                    }`}
                    style={{ background: color }} />
                ))}
              </div>
              <div className="w-px h-4 bg-[#f6ccfa]" />
              {/* Paleta personalizada */}
              <div className="relative w-6 h-6 flex-shrink-0">
                <input type="color" value={fondoColor} onChange={e => cambiarFondo(e.target.value)}
                  className="absolute inset-0 w-full h-full rounded-md cursor-pointer opacity-0"
                  title="Color personalizado" />
                <div className="w-6 h-6 rounded-md border-2 border-dashed border-gray-300 hover:border-[#9f8aef] transition-colors flex items-center justify-center overflow-hidden"
                  style={{ background: `conic-gradient(red, yellow, lime, cyan, blue, magenta, red)` }} />
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center overflow-hidden relative pb-4 px-4">
            <div className="shadow-2xl rounded-2xl overflow-hidden flex-shrink-0 relative">
              <canvas ref={canvasRef} />

              {contextMenu && (
                <div className="absolute z-50 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden w-48"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                  onClick={e => e.stopPropagation()}>
                  <button type="button" onClick={eliminarPrendaDelCanvas}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
                    <Trash2 size={14} /> Eliminar prenda
                  </button>
                  <div className="border-t border-gray-100" />
                  <button type="button" onClick={quitarFondoPrenda}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#9f8aef] hover:bg-[#f6ccfa]/30 transition-colors font-medium">
                    <Sparkles size={14} /> Quitar fondo
                  </button>
                  <div className="border-t border-gray-100" />
                  <button type="button" onClick={() => setContextMenu(null)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-400 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ COL 3 — Galería más ancha ══ */}
        <div className="w-96 bg-white border-l border-[#f6ccfa] flex flex-col overflow-hidden flex-shrink-0">

          {/* Header */}
          <div className="px-4 pt-3 pb-2.5 border-b border-[#f6ccfa] flex-shrink-0">
            {catActiva ? (
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-700">{catActiva}</p>
                <span className="text-[0.6rem] text-[#9f8aef] bg-[#f6ccfa]/50 px-2 py-0.5 rounded-full font-semibold">
                  {prendasFiltradas.length} prendas
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">← Elige una categoría</p>
            )}
          </div>

          {/* Galería Masonry */}
          <div className="flex-1 overflow-y-auto px-3 pt-2 pb-4">
            {!catActiva ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                <ArrowUp size={48} className="text-gray-300" />
                <p className="text-xs text-gray-400 text-center leading-relaxed px-6">
                  Selecciona un tipo y categoría para ver tus prendas
                </p>
              </div>
            ) : prendasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                <ShoppingBasket size={48} className="text-gray-300" />
                <p className="text-xs text-gray-400 text-center leading-relaxed px-6">
                  No tienes prendas en<br /><strong className="text-gray-600">{catActiva}</strong>
                </p>
              </div>
            ) : (
              <Masonry breakpointCols={2} className="flex gap-2" columnClassName="flex-1">
                {prendasFiltradas.map(p => (
                  <PrendaPin key={p.id} prenda={p} onAgregar={agregarPrenda} />
                ))}
              </Masonry>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}