import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as fabricModule from 'fabric'
const fabric = fabricModule.fabric
import { Save, Trash2, ChevronLeft, Plus } from 'lucide-react'
import outfitService from '../services/outfitService'
import prendaService from '../services/prendaService'

export default function LienzoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState(null)
  const [prendas, setPrendas] = useState([])
  const [outfit, setOutfit] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [fondoColor, setFondoColor] = useState('#ffffff')

  // Inicializar canvas
  useEffect(() => {
    const c = new fabric.Canvas(canvasRef.current, {
      width: 700,
      height: 500,
      backgroundColor: '#ffffff',
    })
    setCanvas(c)
    return () => c.dispose()
  }, [])

  // Cargar outfit y prendas
  useEffect(() => {
    if (id) {
      outfitService.obtenerPorId(id).then(setOutfit).catch(() => {})
    }
    prendaService.obtenerTodas().then(setPrendas).catch(() => {})
  }, [id])

  // Cargar imagen guardada del outfit en el canvas
  useEffect(() => {
    if (canvas && outfit?.imagen_url) {
      fabric.Image.fromURL(outfit.imagen_url, (img) => {
        canvas.clear()
        canvas.setBackgroundColor(fondoColor, canvas.renderAll.bind(canvas))
        img.scaleToWidth(canvas.width)
        canvas.add(img)
        canvas.renderAll()
      })
    }
  }, [canvas, outfit])

  const agregarPrenda = (prenda) => {
    if (!canvas) return
    if (prenda.imagen_url) {
      fabric.Image.fromURL(prenda.imagen_url, (img) => {
        img.scaleToHeight(150)
        img.set({ left: 100, top: 100, hasControls: true })
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
      }, { crossOrigin: 'anonymous' })
    } else {
      const texto = new fabric.Text(prenda.nombre || 'Prenda', {
        left: 100, top: 100,
        fontSize: 18,
        fill: '#9f8aef',
        fontFamily: 'sans-serif',
        hasControls: true,
      })
      canvas.add(texto)
      canvas.setActiveObject(texto)
      canvas.renderAll()
    }
  }

  const eliminarSeleccionado = () => {
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (obj) {
      canvas.remove(obj)
      canvas.renderAll()
    }
  }

  const cambiarFondo = (color) => {
    setFondoColor(color)
    if (canvas) {
      canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas))
    }
  }

  const guardar = async () => {
    if (!canvas || !id) return
    setGuardando(true)
    try {
      const dataUrl = canvas.toDataURL({ format: 'png', quality: 0.8 })
      await outfitService.actualizar(id, { imagen_url: dataUrl })
      alert('Outfit guardado!')
    } catch (err) {
      alert('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const coloresFondo = ['#ffffff', '#000000', '#f6ccfa', '#c2e1f9', '#fafbad', '#fde8e8', '#d4f1d4', '#3D2B1F']

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-[#f6ccfa] px-6 py-3 flex items-center gap-4">
        <button onClick={() => navigate('/calendario')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#9f8aef] transition-colors">
          <ChevronLeft size={18} /> Volver
        </button>
        <h1 className="font-semibold text-gray-800 flex-1">
          {outfit?.nombre || 'Lienzo de Outfit'}
        </h1>
        <button onClick={eliminarSeleccionado}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500 border border-red-200 px-3 py-1.5 rounded-full transition-colors">
          <Trash2 size={14} /> Eliminar
        </button>
        <button onClick={guardar} disabled={guardando}
          className="flex items-center gap-2 bg-[#9f8aef] text-white px-4 py-1.5 rounded-full text-sm hover:bg-[#9f8aef]/80 transition-colors disabled:opacity-50">
          <Save size={14} /> {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Panel izquierdo — prendas */}
        <div className="w-56 bg-white border-r border-[#f6ccfa] flex flex-col overflow-hidden">
          <p className="text-xs text-gray-400 uppercase tracking-widest px-4 pt-4 pb-2">Mi Inventario</p>
          <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-2">
            {prendas.length === 0 ? (
              <p className="text-xs text-gray-400 text-center mt-8">No tienes prendas aún</p>
            ) : (
              prendas.map(p => (
                <button key={p.id} onClick={() => agregarPrenda(p)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f6ccfa]/40 transition-colors text-left group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f6ccfa] to-[#c2e1f9] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {p.imagen_url
                      ? <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                      : <span className="text-lg">👕</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{p.nombre}</p>
                    <p className="text-[0.65rem] text-gray-400 truncate">{p.tipo}</p>
                  </div>
                  <Plus size={14} className="text-[#9f8aef] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Canvas central */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
          <div className="shadow-2xl rounded-2xl overflow-hidden">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Panel derecho — opciones */}
        <div className="w-48 bg-white border-l border-[#f6ccfa] p-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Fondo</p>
          <div className="grid grid-cols-4 gap-2">
            {coloresFondo.map(color => (
              <button key={color} onClick={() => cambiarFondo(color)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${fondoColor === color ? 'border-[#9f8aef] scale-110' : 'border-transparent hover:border-gray-300'}`}
                style={{ background: color }}
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 uppercase tracking-widest mt-5 mb-3">Color personalizado</p>
          <input type="color" value={fondoColor} onChange={e => cambiarFondo(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer border border-[#f6ccfa]" />
        </div>
      </div>
    </div>
  )
}