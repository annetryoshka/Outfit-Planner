import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import dayjs from 'dayjs'
import { Plus, Pencil, Trash2, Palette, Shirt, Globe, Lock } from 'lucide-react'
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
  const [hoveredDia, setHoveredDia] = useState(null)
  const [dragOverDia, setDragOverDia] = useState(null)

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
    if (!confirm('¿Seguro que quieres eliminar este outfit del calendario? Esta acción no se puede deshacer.')) return
    try {
      await outfitService.eliminar(id)
      setOutfits(prev => prev.filter(o => o.id !== id))
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error desconocido'
      alert('No se pudo eliminar el outfit: ' + msg)
    }
  }

  const outfitsSinFecha = outfits.filter(o => !o.fecha_calendario)

  const generarDiasMes = () => {
    const inicio = dayjs(fecha).startOf('month')
    const fin = dayjs(fecha).endOf('month')
    const primerDiaSemana = inicio.day() === 0 ? 6 : inicio.day() - 1
    const diasMes = fin.date()
    
    const dias = []
    
    // Añadir días vacíos del mes anterior
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null)
    }
    
    // Añadir días del mes actual
    for (let dia = 1; dia <= diasMes; dia++) {
      dias.push(dia)
    }
    
    return dias
  }

  const diasCalendario = generarDiasMes()

  const outfitsDelDia = (dia) => {
    if (!dia) return []
    const fechaStr = dayjs(fecha).date(dia).format('YYYY-MM-DD')
    return outfits.filter(o =>
      o.fecha_calendario && dayjs(o.fecha_calendario).format('YYYY-MM-DD') === fechaStr
    )
  }

  const esHoy = (dia) => {
    if (!dia) return false
    return dayjs().isSame(dayjs(fecha).date(dia), 'day')
  }

  const esSeleccionado = (dia) => {
    if (!dia) return false
    return dayjs(fecha).date(dia).isSame(fecha, 'day')
  }

  const handleCeldaClick = (dia) => {
    if (!dia) return
    const nuevaFecha = new Date(fecha.getFullYear(), fecha.getMonth(), dia)
    setFecha(nuevaFecha)
  }

  // Función para clonar al soltar
  const handleDrop = async (e, dia) => {
    e.preventDefault()
    console.log('🔴 DROP EJECUTADO, dia:', dia)
    const outfitId = e.dataTransfer.getData('outfitId')
    console.log('🔴 outfitId:', outfitId)
    if (!outfitId || !dia) return

    const nuevaFecha = dayjs(fecha).date(dia).format('YYYY-MM-DD')
    const original = outfits.find(o => String(o.id) === String(outfitId))
    if (!original) return

    try {
      const clon = await outfitService.crear({
        nombre: original.nombre,
        ocasion: original.ocasion,
        es_publico: original.es_publico,
        imagen_url: original.imagen_url,       
        canvas_data: original.canvas_data,     
        fecha_calendario: nuevaFecha,
        es_clon: true,
      })
      setOutfits(prev => [...prev, clon])
    } catch (err) {
      console.error('Drop error:', err)
      alert('No se pudo asignar el outfit a ese día')
    }
  }

  return (
    <div className="flex flex-row h-screen overflow-hidden">
      {/* Hijo izquierdo — Calendario grande (70%) */}
      <div className="w-[70%] flex flex-col h-full p-6 overflow-hidden">
        <h1 className="text-2xl font-subtitulo text-gray-800 mb-6">
          Mi Calendario
        </h1>
        
        {/* Grilla de calendario personalizado */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 overflow-auto">
          {/* Navegación de mes */}
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              onClick={() => setFecha(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="w-8 h-8 rounded-full hover:bg-[#f6ccfa] flex items-center justify-center transition-colors text-gray-600 font-bold"
            >
              ‹
            </button>
            <span className="text-base font-semibold text-gray-800 capitalize">
              {dayjs(fecha).format('MMMM YYYY')}
            </span>
            <button
              onClick={() => setFecha(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="w-8 h-8 rounded-full hover:bg-[#f6ccfa] flex items-center justify-center transition-colors text-gray-600 font-bold"
            >
              ›
            </button>
          </div>
          
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-px bg-gray-100 mb-px">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(dia => (
              <div key={dia} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-600">
                {dia}
              </div>
            ))}
          </div>
          
          {/* Celdas del mes */}
          <div className="grid grid-cols-7 gap-px bg-gray-100">
            {diasCalendario.map((dia, index) => {
              const outfitsDia = outfitsDelDia(dia)
              const hoy = esHoy(dia)
              const seleccionado = esSeleccionado(dia)
              
              return (
                <div key={index} className="relative" onDragOver={(e) => { e.preventDefault(); setDragOverDia(dia) }} onDragLeave={() => setDragOverDia(null)} onDrop={(e) => { setDragOverDia(null); handleDrop(e, dia) }}>
                  <div
                    onClick={() => handleCeldaClick(dia)}
                    onMouseEnter={() => outfitsDia.length > 0 && setHoveredDia(dia)}
                    onMouseLeave={() => setHoveredDia(null)}
                    className={`bg-white min-h-[100px] p-2 relative cursor-pointer transition-colors
                      ${dia ? '' : 'opacity-30'}
                      ${seleccionado ? 'border-2 border-[#9f8aef] bg-[#f6ccfa]/30' : ''}
                      ${dragOverDia === dia && dia ? 'bg-[#9f8aef]/20 ring-2 ring-[#9f8aef] ring-inset' : 'hover:bg-[#f6ccfa]/20'}
                    `}
                  >
                    {dia && (
                      <>
                        {/* Badge +N si hay múltiples outfits */}
                        {outfitsDia.length > 1 && (
                          <div className="absolute top-1 left-1 w-5 h-5 bg-[#9f8aef] text-white text-xs rounded-full flex items-center justify-center">
                            +{outfitsDia.length - 1}
                          </div>
                        )}
                        
                        {/* Número del día */}
                        <div className={`absolute top-1 right-1 text-sm ${
                          hoy ? 'text-[#9f8aef] font-bold' : 'text-gray-600'
                        }`}>
                          {dia}
                        </div>
                        
                        {/* Outfit del día */}
                        {outfitsDia.length > 0 && (
                          <div className="mt-4 flex flex-col items-center">
                            {outfitsDia[0].imagen_url ? (
                              <img
                                src={outfitsDia[0].imagen_url}
                                alt={outfitsDia[0].nombre}
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
                              <Shirt size={20} className="text-gray-400" />
                            )}
                            <p className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                              {outfitsDia[0].nombre}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Tooltip DENTRO del wrapper */}
                  {hoveredDia === dia && dia && outfitsDelDia(dia).length > 0 && (
                    <div className="absolute bottom-full left-0 z-50 bg-white rounded-xl shadow-xl p-3 border border-gray-200 min-w-[180px] pointer-events-none mb-1">
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        {dayjs(fecha).date(dia).format('D [de] MMMM')}
                      </div>
                      <div className="space-y-2">
                        {outfitsDelDia(dia).map(outfit => (
                          <div key={outfit.id} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f6ccfa] to-[#c2e1f9] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {outfit.imagen_url ? (
                                <img src={outfit.imagen_url} alt={outfit.nombre} className="w-full h-full object-cover" />
                              ) : (
                                <Shirt size={14} className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-800 truncate">{outfit.nombre}</p>
                              {outfit.ocasion && <p className="text-xs text-gray-400">{outfit.ocasion}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Hijo derecho — Panel lateral (30%) */}
      <div className="w-[30%] flex flex-col h-full p-6 border-l border-gray-100 overflow-y-auto bg-white">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {dayjs(fecha).format('dddd, D [de] MMMM')}
          </h2>
          <button
            type="button"
            onClick={abrirCrear}
            className="flex items-center gap-2 bg-[#9f8aef] text-white px-4 py-2 rounded-full text-sm hover:bg-[#9f8aef]/80 transition-colors"
          >
            <Plus size={16} /> Añadir outfit
          </button>
        </div>

        {/* Outfits del día */}
        <div className="mb-6">
          {outfitsDia.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
              <Shirt size={48} className="text-gray-300 mx-auto mb-2" />
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
                      : <Shirt size={24} className="text-gray-400" />
                    }
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{o.nombre}</p>
                    {o.ocasion && <p className="text-xs text-gray-400 capitalize">{o.ocasion}</p>}
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      {o.es_publico ? <><Globe size={12} /> Público</> : <><Lock size={12} /> Privado</>}
                    </p>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigate(`/lienzo/${o.id}`) }}
                      className="w-8 h-8 bg-[#f6ccfa] rounded-full flex items-center justify-center hover:bg-[#9f8aef] hover:text-white transition-colors"
                      title="Editar en lienzo"
                    >
                      <Palette size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); abrirEditar(o) }}
                      className="w-8 h-8 bg-[#f6ccfa] rounded-full flex items-center justify-center hover:bg-[#9f8aef] hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); eliminar(o.id) }}
                      className="w-8 h-8 bg-[#f6ccfa] rounded-full flex items-center justify-center hover:bg-red-400 hover:text-white transition-colors"
                      title="Eliminar outfit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Todos mis outfits */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Todos mis outfits</h3>
          <div className="space-y-2">
            {outfits.filter(o => !o.es_clon).map(o => (
              <div
                key={o.id}
                draggable
                onDragStart={(e) => {
                  console.log('🟢 DRAG START, id:', o.id)
                  e.dataTransfer.setData('outfitId', o.id)
                }}
                className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 cursor-move hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f6ccfa] to-[#c2e1f9] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {o.imagen_url
                    ? <img src={o.imagen_url} alt={o.nombre} className="w-full h-full object-cover" />
                    : <Shirt size={16} className="text-gray-400" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{o.nombre}</p>
                  {o.ocasion && <p className="text-xs text-gray-400 capitalize">{o.ocasion}</p>}
                </div>
              </div>
            ))}
          </div>
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