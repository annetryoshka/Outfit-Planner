import { useState, useEffect, useMemo } from 'react'
import {
  Pencil, Trash2, PlusCircle, ChevronDown, X,
  Lock, Globe, ShirtIcon
} from 'lucide-react'

// ── Servicios (conectar al backend) ──────────────────────────────────────────
import api from '../services/api'

const prendaService = {
  getAll: () => api.get('/prendas').then(r => r.data),
  delete: (id) => api.delete(`/prendas/${id}`).then(r => r.data),
}
const outfitService = {
  getAll: () => api.get('/outfits').then(r => r.data),
  delete: (id) => api.delete(`/outfits/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/outfits/${id}`, data).then(r => r.data),
}
const userService = {
  update: (data) => api.put('/auth/perfil', data).then(r => r.data),
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const colorHex = (c = '') => ({
  negro: '#1a1a1a', blanco: '#f5f5f5', beige: '#D4C4B0',
  azul: '#5B7FA6', gris: '#9E9E9E', rojo: '#C0392B',
  verde: '#27AE60', rosado: '#E91E8C', morado: '#8E44AD',
})[c.toLowerCase()] ?? '#ccc'

// ── Sub‑componente: Combobox filtro ──────────────────────────────────────────
function FilterSelect({ id, label, options, value, onChange }) {
  const active = value !== ''
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`appearance-none border rounded-full pl-3 pr-7 py-1.5 text-xs font-medium cursor-pointer outline-none transition-all
          ${active
            ? 'bg-[#3D2B1F] text-white border-[#3D2B1F]'
            : 'bg-white text-[#6B4F3A] border-[#E8E2DA] hover:border-[#B09070]'
          }`}
      >
        <option value="">{label}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown
        size={12}
        className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${active ? 'text-white' : 'text-[#8A7060]'}`}
      />
    </div>
  )
}

// ── Sub‑componente: Card prenda ───────────────────────────────────────────────
function PrendaCard({ prenda, onDelete }) {
  const tall = prenda.tipo === 'outerwear' || prenda.tipo === 'vestido'
  return (
    <div className="break-inside-avoid mb-4 rounded-xl overflow-hidden bg-white shadow-sm group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
      {/* imagen placeholder */}
      <div
        className="w-full flex items-center justify-center text-4xl"
        style={{ aspectRatio: tall ? '2/3' : '4/3', background: 'linear-gradient(145deg,#F0E8DC,#E8E2DA)' }}
      >
        <ShirtIcon size={48} color="#B09070" strokeWidth={1} />
      </div>

      {/* overlay con acciones centradas */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(61,43,31,0.7)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
        <button className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform" title="Editar">
          <Pencil size={13} color="#6B4F3A" strokeWidth={2} />
        </button>
        <button className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform" title="Añadir a outfit">
          <PlusCircle size={13} color="#1D9E75" strokeWidth={2} />
        </button>
        <button
          className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
          title="Eliminar"
          onClick={e => { e.stopPropagation(); onDelete(prenda.id) }}
        >
          <Trash2 size={13} color="#c0392b" strokeWidth={2} />
        </button>
      </div>

      <div className="px-3 pb-3 pt-2">
        <p className="text-xs font-medium text-[#3D2B1F] truncate">{prenda.nombre}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: colorHex(prenda.color) }} />
          {prenda.material && (
            <span className="bg-[#F0E8DC] text-[#6B4F3A] text-[0.65rem] px-2 py-0.5 rounded-full">{prenda.material}</span>
          )}
          <span className="text-[0.65rem] text-[#8A7060]">{prenda.temporada}</span>
        </div>
      </div>
    </div>
  )
}

// ── Sub‑componente: Card outfit ───────────────────────────────────────────────
function OutfitCard({ outfit, onDelete, onEdit }) {
  return (
    <div className="break-inside-avoid mb-4 rounded-xl overflow-hidden bg-white shadow-sm group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg relative">
      <div
        className="w-full flex items-center justify-center text-4xl"
        style={{ aspectRatio: '3/4', background: 'linear-gradient(135deg,#F0E8DC,#E8E2DA)' }}
      >
        👗
      </div>

      {/* overlay con acciones centradas */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(61,43,31,0.7)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
        <button
          className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
          title="Editar"
          onClick={e => { e.stopPropagation(); onEdit(outfit) }}
        >
          <Pencil size={13} color="#6B4F3A" strokeWidth={2} />
        </button>
        <button
          className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
          title="Eliminar"
          onClick={e => { e.stopPropagation(); onDelete(outfit.id) }}
        >
          <Trash2 size={13} color="#c0392b" strokeWidth={2} />
        </button>
      </div>

      <div className="px-3 pb-3 pt-2">
        <p className="font-semibold text-[#3D2B1F] text-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {outfit.nombre}
        </p>
        <div className="flex gap-1 flex-wrap mt-1">
          {outfit.ocasion && (
            <span className="bg-[#F0E8DC] text-[#6B4F3A] text-[0.65rem] px-2 py-0.5 rounded-full">{outfit.ocasion}</span>
          )}
          <span className="bg-[#F0E8DC] text-[#6B4F3A] text-[0.65rem] px-2 py-0.5 rounded-full flex items-center gap-1">
            {outfit.es_publico ? <><Globe size={9} /> Público</> : <><Lock size={9} /> Privado</>}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Perfil() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const [tab, setTab] = useState('armario')
  const [prendas, setPrendas] = useState([])
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)

  // filtros
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroColor, setFiltroColor] = useState('')
  const [filtroTemporada, setFiltroTemporada] = useState('')
  const [filtroMaterial, setFiltroMaterial] = useState('')

  // modal editar perfil
  const [modalPerfil, setModalPerfil] = useState(false)
  const [formPerfil, setFormPerfil] = useState({
    nombre: usuario.nombre || '',
    bio: usuario.bio || '',
    ciudad: usuario.ciudad || '',
  })

  // modal editar outfit
  const [modalOutfit, setModalOutfit] = useState(false)
  const [outfitEditando, setOutfitEditando] = useState(null)
  const [formOutfit, setFormOutfit] = useState({ nombre: '', ocasion: '', es_publico: false })

  useEffect(() => {
    Promise.all([prendaService.getAll(), outfitService.getAll()])
      .then(([p, o]) => { setPrendas(p); setOutfits(o) })
      .catch(() => {}) // usa datos vacíos si falla
      .finally(() => setLoading(false))
  }, [])

  // ── Filtrado ────────────────────────────────────────────────────────────────
  const prendasFiltradas = useMemo(() => prendas.filter(p =>
    (!filtroTipo || p.tipo === filtroTipo) &&
    (!filtroColor || p.color?.toLowerCase() === filtroColor) &&
    (!filtroTemporada || p.temporada === filtroTemporada) &&
    (!filtroMaterial || p.material?.toLowerCase().includes(filtroMaterial))
  ), [prendas, filtroTipo, filtroColor, filtroTemporada, filtroMaterial])

  const hayFiltros = filtroTipo || filtroColor || filtroTemporada || filtroMaterial

  // ── Acciones prendas ────────────────────────────────────────────────────────
  const eliminarPrenda = async (id) => {
    if (!confirm('¿Eliminar esta prenda?')) return
    await prendaService.delete(id)
    setPrendas(prev => prev.filter(p => p.id !== id))
  }

  // ── Acciones outfits ────────────────────────────────────────────────────────
  const eliminarOutfit = async (id) => {
    if (!confirm('¿Eliminar este outfit?')) return
    await outfitService.delete(id)
    setOutfits(prev => prev.filter(o => o.id !== id))
  }

  const abrirEditarOutfit = (outfit) => {
    setOutfitEditando(outfit)
    setFormOutfit({ nombre: outfit.nombre, ocasion: outfit.ocasion || '', es_publico: outfit.es_publico })
    setModalOutfit(true)
  }

  const guardarOutfit = async () => {
    const updated = await outfitService.update(outfitEditando.id, formOutfit)
    setOutfits(prev => prev.map(o => o.id === updated.id ? updated : o))
    setModalOutfit(false)
  }

  // ── Editar perfil ───────────────────────────────────────────────────────────
  const guardarPerfil = async () => {
    await userService.update(formPerfil)
    localStorage.setItem('usuario', JSON.stringify({ ...usuario, ...formPerfil }))
    setModalPerfil(false)
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-[#FAF7F2]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── HEADER PERFIL ── */}
        <div className="bg-white border-b border-[#E8E2DA]">
          <div className="max-w-4xl mx-auto px-6 pt-8">
            <div className="flex items-start gap-6">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-light"
                  style={{ background: 'linear-gradient(135deg,#B09070,#D4C4B0)', fontFamily: "'Cormorant Garamond', serif" }}>
                  {(formPerfil.nombre || usuario.nombre || 'U')[0].toUpperCase()}
                </div>
                <button
                  onClick={() => setModalPerfil(true)}
                  className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-[#3D2B1F] rounded-full flex items-center justify-center border-2 border-white"
                >
                  <Pencil size={10} color="white" strokeWidth={2} />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-[#3D2B1F]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {formPerfil.nombre || usuario.nombre}
                </h1>
                <p className="text-xs text-[#8A7060] mb-1 tracking-wide">
                  @{(usuario.nombre || 'usuario').toLowerCase().replace(/\s/g, '')}
                  {formPerfil.ciudad ? ` · ${formPerfil.ciudad}` : ''}
                </p>
                {formPerfil.bio && (
                  <p className="text-sm text-[#6B4F3A] leading-relaxed max-w-sm mb-2">{formPerfil.bio}</p>
                )}
                <div className="flex gap-5">
                  <div>
                    <span className="text-xl font-semibold text-[#3D2B1F]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {prendas.length}
                    </span>
                    <span className="text-[0.65rem] text-[#8A7060] uppercase tracking-widest ml-1">Prendas</span>
                  </div>
                  <div>
                    <span className="text-xl font-semibold text-[#3D2B1F]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {outfits.length}
                    </span>
                    <span className="text-[0.65rem] text-[#8A7060] uppercase tracking-widest ml-1">Outfits</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModalPerfil(true)}
                className="bg-[#3D2B1F] text-white text-xs px-4 py-2 rounded-full hover:bg-[#6B4F3A] transition-colors flex-shrink-0"
              >
                Editar perfil
              </button>
            </div>

            {/* Tabs */}
            <div className="flex mt-6">
              {['armario', 'outfits'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-3 text-xs uppercase tracking-widest font-medium border-b-2 transition-all ${
                    tab === t
                      ? 'text-[#3D2B1F] border-[#3D2B1F]'
                      : 'text-[#8A7060] border-transparent hover:text-[#6B4F3A]'
                  }`}
                >
                  {t === 'armario' ? 'Mi Armario' : 'Mis Outfits'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENIDO ── */}
        <div className="max-w-4xl mx-auto px-6 py-6">

          {/* ARMARIO */}
          {tab === 'armario' && (
            <>
              {/* Filtros */}
              <div className="flex flex-wrap gap-2 items-center mb-5">
                <span className="text-[0.68rem] text-[#8A7060] uppercase tracking-widest">Filtrar</span>
                <FilterSelect id="tipo" label="Tipo" value={filtroTipo} onChange={setFiltroTipo}
                  options={[
                    { value:'top', label:'Tops' }, { value:'bottom', label:'Bottoms' },
                    { value:'outerwear', label:'Abrigos' }, { value:'shoes', label:'Zapatos' },
                    { value:'vestido', label:'Vestidos' },
                  ]}
                />
                <FilterSelect id="color" label="Color" value={filtroColor} onChange={setFiltroColor}
                  options={['negro','blanco','beige','azul','gris','rojo','verde','rosado','morado']
                    .map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                />
                <FilterSelect id="temporada" label="Temporada" value={filtroTemporada} onChange={setFiltroTemporada}
                  options={[
                    { value:'verano', label:'Verano' }, { value:'invierno', label:'Invierno' },
                    { value:'primavera', label:'Primavera' }, { value:'otoño', label:'Otoño' },
                    { value:'todo', label:'Todo el año' },
                  ]}
                />
                <FilterSelect id="material" label="Material" value={filtroMaterial} onChange={setFiltroMaterial}
                  options={[
                    { value:'algodón', label:'Algodón' }, { value:'lana', label:'Lana' },
                    { value:'lino', label:'Lino' }, { value:'cuero', label:'Cuero' },
                    { value:'denim', label:'Denim' }, { value:'seda', label:'Seda' },
                  ]}
                />
                {hayFiltros && (
                  <button
                    onClick={() => { setFiltroTipo(''); setFiltroColor(''); setFiltroTemporada(''); setFiltroMaterial('') }}
                    className="flex items-center gap-1 text-[0.72rem] text-[#8A7060] border border-[#E8E2DA] rounded-full px-3 py-1.5 hover:border-[#B09070] hover:text-[#6B4F3A] transition-colors"
                  >
                    <X size={11} /> Limpiar
                  </button>
                )}
              </div>

              {loading ? (
                <p className="text-sm text-[#8A7060] text-center py-12">Cargando prendas…</p>
              ) : prendasFiltradas.length === 0 ? (
                <div className="text-center py-16 text-[#8A7060]">
                  <ShirtIcon size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No hay prendas con esos filtros</p>
                </div>
              ) : (
                <div style={{ columns: 3, columnGap: '1rem' }}>
                  {prendasFiltradas.map(p => (
                    <div key={p.id} className="relative">
                      <PrendaCard prenda={p} onDelete={eliminarPrenda} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* OUTFITS */}
          {tab === 'outfits' && (
            loading ? (
              <p className="text-sm text-[#8A7060] text-center py-12">Cargando outfits…</p>
            ) : outfits.length === 0 ? (
              <div className="text-center py-16 text-[#8A7060]">
                <p className="text-3xl mb-3">👗</p>
                <p className="text-sm">Aún no has creado outfits</p>
              </div>
            ) : (
              <div style={{ columns: 3, columnGap: '1rem' }}>
                {outfits.map(o => (
                  <div key={o.id} className="relative">
                    <OutfitCard outfit={o} onDelete={eliminarOutfit} onEdit={abrirEditarOutfit} />
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* ── MODAL EDITAR PERFIL ── */}
        {modalPerfil && (
          <div className="fixed inset-0 bg-[rgba(61,43,31,0.4)] backdrop-blur-sm flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && setModalPerfil(false)}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-[#3D2B1F] mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Editar Perfil
              </h2>
              {[
                { label: 'Nombre', key: 'nombre', placeholder: 'Tu nombre' },
                { label: 'Biografía', key: 'bio', placeholder: 'Algo sobre ti...' },
                { label: 'Ciudad', key: 'ciudad', placeholder: 'Tu ciudad' },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="mb-4">
                  <label className="block text-[0.72rem] text-[#8A7060] uppercase tracking-widest mb-1">{label}</label>
                  <input
                    value={formPerfil[key]}
                    onChange={e => setFormPerfil(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-[#E8E2DA] rounded-lg px-3 py-2.5 text-sm text-[#2A1F18] outline-none focus:border-[#B09070] transition-colors"
                  />
                </div>
              ))}
              <div className="flex gap-3 mt-5">
                <button onClick={() => setModalPerfil(false)}
                  className="flex-1 border border-[#E8E2DA] rounded-lg py-2.5 text-sm text-[#6B4F3A] hover:border-[#B09070] transition-colors">
                  Cancelar
                </button>
                <button onClick={guardarPerfil}
                  className="flex-1 bg-[#3D2B1F] text-white rounded-lg py-2.5 text-sm hover:bg-[#6B4F3A] transition-colors">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL EDITAR OUTFIT ── */}
        {modalOutfit && (
          <div className="fixed inset-0 bg-[rgba(61,43,31,0.4)] backdrop-blur-sm flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && setModalOutfit(false)}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-[#3D2B1F] mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Editar Outfit
              </h2>
              <div className="mb-4">
                <label className="block text-[0.72rem] text-[#8A7060] uppercase tracking-widest mb-1">Nombre</label>
                <input
                  value={formOutfit.nombre}
                  onChange={e => setFormOutfit(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full border border-[#E8E2DA] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#B09070] transition-colors"
                />
              </div>
              <div className="mb-4">
                <label className="block text-[0.72rem] text-[#8A7060] uppercase tracking-widest mb-1">Ocasión</label>
                <div className="relative">
                  <select
                    value={formOutfit.ocasion}
                    onChange={e => setFormOutfit(p => ({ ...p, ocasion: e.target.value }))}
                    className="w-full appearance-none border border-[#E8E2DA] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#B09070] transition-colors"
                  >
                    <option value="">Sin ocasión</option>
                    {['casual','trabajo','fiesta','escuela','formal','deporte'].map(o => (
                      <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A7060]" />
                </div>
              </div>
              <div className="mb-4 flex items-center gap-3">
                <label className="block text-[0.72rem] text-[#8A7060] uppercase tracking-widest">Público</label>
                <button
                  onClick={() => setFormOutfit(p => ({ ...p, es_publico: !p.es_publico }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${formOutfit.es_publico ? 'bg-[#3D2B1F]' : 'bg-[#E8E2DA]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${formOutfit.es_publico ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setModalOutfit(false)}
                  className="flex-1 border border-[#E8E2DA] rounded-lg py-2.5 text-sm text-[#6B4F3A] hover:border-[#B09070] transition-colors">
                  Cancelar
                </button>
                <button onClick={guardarOutfit}
                  className="flex-1 bg-[#3D2B1F] text-white rounded-lg py-2.5 text-sm hover:bg-[#6B4F3A] transition-colors">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}