import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas, FabricImage, FabricText } from 'fabric'
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
  const fondoColorRef = useRef(fondoColor)
  fondoColorRef.current = fondoColor

  // Inicializar canvas (Fabric v7: import nombrado; la API antigua `fabric.fabric` ya no existe)
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const c = new Canvas(el, {
      width: 700,
      height: 500,
      backgroundColor: '#ffffff',
    })
    setCanvas(c)
    return () => {
      void c.dispose()
    }
  }, [])

  // Cargar outfit y prendas
  useEffect(() => {
    if (id) {
      outfitService.obtenerPorId(id).then(setOutfit).catch(() => {})
    }
    prendaService.obtenerTodas().then(setPrendas).catch(() => {})
  }, [id])

  // Cargar imagen guardada del outfit en el canvas (solo cuando cambia la URL del outfit, no al cambiar el color de fondo)
  useEffect(() => {
    if (!canvas || !outfit?.canvas_data) return;
    canvas.loadFromJSON(outfit.canvas_data)
      .then(() => {
        canvas.backgroundColor = fondoColorRef.current
        canvas.requestRenderAll()
      })
      .catch(err => {
        console.error('Error al cargar canvas_data:', err);
      })
  }, [canvas, outfit?.canvas_data])

  const agregarPrenda = (prenda) => {
    if (!canvas) return
    if (prenda.imagen_url) {
      FabricImage.fromURL(prenda.imagen_url, { crossOrigin: 'anonymous' })
        .then((img) => {
          img.scaleToHeight(150)
          img.set({ left: 100, top: 100, hasControls: true })
          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.requestRenderAll()
        })
        .catch(() => {})
    } else {
      const texto = new FabricText(prenda.nombre || 'Prenda', {
        left: 100,
        top: 100,
        fontSize: 18,
        fill: '#9f8aef',
        fontFamily: 'sans-serif',
        hasControls: true,
      })
      canvas.add(texto)
      canvas.setActiveObject(texto)
      canvas.requestRenderAll()
    }
  }

  const eliminarSeleccionado = () => {
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (obj) {
      canvas.remove(obj)
      canvas.requestRenderAll()
    }
  }

  const cambiarFondo = (color) => {
    setFondoColor(color)
    if (canvas) {
      canvas.backgroundColor = color
      canvas.requestRenderAll()
    }
  }

  const guardar = async () => {
    if (!canvas || !id) return;
    setGuardando(true);
    try {
      const jsonData = canvas.toJSON();
      //Encontrar el área que ocupan los objetos (Bounding Box)
      const objetos = canvas.getObjects();
      if (objetos.length === 0) {
        Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El lienzo está vacío. Agrega prendas antes de guardar.',
        confirmButtonColor: '#9f8aef'
      })
        setGuardando(false);
        return;
      }

      // Calculamos el área que encierra a todos los objetos manualmente
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      objetos.forEach(obj => {
        const bound = obj.getBoundingRect();
        if (bound.left < minX) minX = bound.left;
        if (bound.top < minY) minY = bound.top;
        if (bound.left + bound.width > maxX) maxX = bound.left + bound.width;
        if (bound.top + bound.height > maxY) maxY = bound.top + bound.height;
      });

      const padding = 10;
      const finalLeft = minX - padding;
      const finalTop = minY - padding;
      const finalWidth = (maxX - minX) + (padding * 2);
      const finalHeight = (maxY - minY) + (padding * 2);

      // Generar la imagen SOLO de esa área y con dimensiones reducidas
      const dataUrl = canvas.toDataURL({
        format: 'jpeg', // JPEG pesa mucho menos que PNG para fotos de ropa
        quality: 0.6,   // Reducimos la calidad al 60% 
        left: finalLeft,
        top: finalTop,
        width: finalWidth,
        height: finalHeight
      });

      // El resto del proceso de conversión a Blob y FormData se mantiene igua
      
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append('imagen', blob, `preview_${id}.jpg`);
      formData.append('canvas_data', JSON.stringify(jsonData));

      if (outfit?.nombre) formData.append('nombre', outfit.nombre);
      if (outfit?.ocasion) formData.append('ocasion', outfit.ocasion);
      if (outfit?.es_publico !== undefined) formData.append('es_publico', outfit.es_publico);
      if (outfit?.fecha_calendario) {
        formData.append('fecha_calendario', outfit.fecha_calendario);
      }

      await outfitService.actualizar(id, formData);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Outfit optimizado y guardado',
        confirmButtonColor: '#9f8aef'
      });
      
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar los cambios: ' + (err.response?.data?.message || err.message),
        confirmButtonColor: '#9f8aef'
      });
    } finally {
      setGuardando(false);
    }
  }

  const coloresFondo = ['#ffffff', '#000000', '#f6ccfa', '#c2e1f9', '#fafbad', '#fde8e8', '#d4f1d4', '#3D2B1F']

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-[#f6ccfa] px-6 py-3 flex items-center gap-4">
        <button type="button" onClick={() => navigate('/calendario')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#9f8aef] transition-colors">
          <ChevronLeft size={18} /> Volver
        </button>
        <h1 className="font-semibold text-gray-800 flex-1">
          {outfit?.nombre || 'Lienzo de Outfit'}
        </h1>
        <button type="button" onClick={eliminarSeleccionado}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500 border border-red-200 px-3 py-1.5 rounded-full transition-colors">
          <Trash2 size={14} /> Eliminar
        </button>
        <button type="button" onClick={guardar} disabled={guardando}
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
                <button type="button" key={p.id} onClick={() => agregarPrenda(p)}
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
              <button type="button" key={color} onClick={() => cambiarFondo(color)}
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
