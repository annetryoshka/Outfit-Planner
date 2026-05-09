import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import dayjs from 'dayjs'
import { Plus, Pencil, Trash2, Palette } from 'lucide-react'
import outfitService from '../services/outfitService'

export default function CalendarioPage() {
  const navigate = useNavigate()
  const [fecha, setFecha] = useState(new Date())
  const [outfits, setOutfits] = useState([])
  const [outfitsDia, setOutfitsDia] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [outfitEditando, setOutfitEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', ocasion: '', es_publico: false })

  // Cargar todos los outfits al montar
  useEffect(() => {
    outfitService.obtenerTodos()
      .then(data => setOutfits(data))
      .catch(() => {})
  }, [])

  // Filtrar outfits del día seleccionado
  useEffect(() => {
    const fechaStr = dayjs(fecha).format('YYYY-MM-DD')
    const del_dia = outfits.filter(o =>
      o.fecha_calendario && dayjs(o.fecha_calendario).format('YYYY-MM-DD') === fechaStr
    )
    setOutfitsDia(del_dia)
  }, [fecha, outfits])

  // Marcar días que tienen outfits
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null
    const fechaStr = dayjs(date).format('YYYY-MM-DD')
    const tiene = outfits.some(o =>
      o.fecha_calendario && dayjs(o.fecha_calendario).format('YYYY-MM-DD') === fechaStr
    )
    return tiene ? (
      <div className="flex justify-center mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9f8aef] block" />
      </div>
    ) : null
  }

  const abrirCrear = () => {
    setOutfitEditando(null)
    setForm({ nombre: '', ocasion: '', es_publico: false })
    setModalAbierto(true)
  }

  const abrirEditar = (outfit) => {
    setOutfitEditando(outfit)
    setForm({ nombre: outfit.nombre, ocasion: outfit.ocasion || '', es_publico: outfit.es_publico })
    setModalAbierto(true)
  }

  const guardar = async () => {
    const fechaStr = dayjs(fecha).format('YYYY-MM-DD')
    try {
      if (outfitEditando) {
        const updated = await outfitService.actualizar(outfitEditando.id, { ...form, fecha_calendario: fechaStr })
        setOutfits(prev => prev.map(o => o.id === updated.id ? updated : o))
      } else {
        const nuevo = await outfitService.crear({ ...form, fecha_calendario: fechaStr })
        setOutfits(prev => [...prev, nuevo])
      }
      setModalAbierto(false)
    } catch (err) {
      alert('Error al guardar el outfit')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este outfit?')) return
    await outfitService.eliminar(id)
    setOutfits(prev => prev.filter(o => o.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafbad]/40 to-white p-8">
      <h1 className="text-2xl font-bold text-[#9f8aef] mb-6">📅 Mi Calendario de Outfits</h1>

      <div className="flex gap-8 flex-wrap">

        {/* Calendario */}
        <div className="bg-white rounded-3xl shadow-md p-6 flex-shrink-0">
          <style>{`
            .react-calendar { border: none; font-family: inherit; }
            .react-calendar__tile--active { background: #9f8aef !important; border-radius: 12px; }
            .react-calendar__tile:hover { background: #f6ccfa; border-radius: 12px; }
            .react-calendar__navigation button:hover { background: #f6ccfa; border-radius: 12px; }
          `}</style>
          <Calendar
            onChange={setFecha}
            value={fecha}
            tileContent={tileContent}
            locale="es-ES"
          />
        </div>

        {/* Panel del día */}
        <div className="flex-1 min-w-64">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {dayjs(fecha).format('dddd, D [de] MMMM')}
            </h2>
            <button
              onClick={abrirCrear}
              className="flex items-center gap-2 bg-[#9f8aef] text-white px-4 py-2 rounded-full text-sm hover:bg-[#9f8aef]/80 transition-colors"
            >
              <Plus size={16} /> Añadir outfit
            </button>
          </div>

          {outfitsDia.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
              <p className="text-3xl mb-2">👗</p>
              <p className="text-sm">No hay outfits para este día</p>
              <p className="text-xs mt-1">¡Añade uno o crea uno en el lienzo!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {outfitsDia.map(o => (
                <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 group">
                  {/* Imagen o placeholder */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#f6ccfa] to-[#c2e1f9] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {o.imagen_url
                      ? <img src={o.imagen_url} alt={o.nombre} className="w-full h-full object-cover" />
                      : <span className="text-2xl">👗</span>
                    }
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{o.nombre}</p>
                    {o.ocasion && <p className="text-xs text-gray-400 capitalize">{o.ocasion}</p>}
                    <p className="text-xs text-gray-400">{o.es_publico ? '🌍 Público' : '🔒 Privado'}</p>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/lienzo/${o.id}`)}
                      className="w-8 h-8 bg-[#f6ccfa] rounded-full flex items-center justify-center hover:bg-[#9f8aef] hover:text-white transition-colors"
                      title="Editar en lienzo"
                    >
                      <Palette size={14} />
                    </button>
                    <button
                      onClick={() => abrirEditar(o)}
                      className="w-8 h-8 bg-[#f6ccfa] rounded-full flex items-center justify-center hover:bg-[#9f8aef] hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => eliminar(o.id)}
                      className="w-8 h-8 bg-[#f6ccfa] rounded-full flex items-center justify-center hover:bg-red-400 hover:text-white transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal crear/editar outfit */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={e => e.target === e.currentTarget && setModalAbierto(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-[#9f8aef] mb-5">
              {outfitEditando ? 'Editar Outfit' : 'Nuevo Outfit'}
            </h2>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Nombre</label>
              <input
                value={form.nombre}
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Look casual lunes"
                className="w-full border border-[#f6ccfa] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#9f8aef] transition-colors"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Ocasión</label>
              <select
                value={form.ocasion}
                onChange={e => setForm(p => ({ ...p, ocasion: e.target.value }))}
                className="w-full border border-[#f6ccfa] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#9f8aef] transition-colors"
              >
                <option value="">Sin ocasión</option>
                {['casual', 'trabajo', 'fiesta', 'escuela', 'formal', 'deporte'].map(o => (
                  <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <label className="text-xs text-gray-400 uppercase tracking-widest">Público</label>
              <button
                onClick={() => setForm(p => ({ ...p, es_publico: !p.es_publico }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.es_publico ? 'bg-[#9f8aef]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.es_publico ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModalAbierto(false)}
                className="flex-1 border border-[#f6ccfa] rounded-xl py-2.5 text-sm text-gray-500 hover:border-[#9f8aef] transition-colors">
                Cancelar
              </button>
              <button onClick={guardar}
                className="flex-1 bg-[#9f8aef] text-white rounded-xl py-2.5 text-sm hover:bg-[#9f8aef]/80 transition-colors">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}