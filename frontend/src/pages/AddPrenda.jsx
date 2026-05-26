import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Upload, Sparkles, Save, X, ChevronDown } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import prendaService from '../services/prendaService'
import authService from '../services/authService'
import { normalizeForDb, alignValueToOptions } from '../utils/normalizeForDb'


const tipos = ['Superior', 'Inferior', 'Calzado', 'Accesorio', 'Otros']
const categorias = ['Camisa', 'Polera', 'Pantalón', 'Shorts', 'Vestido','Chompa' ,'Abrigo', 'Falda', 'Blusa', 'Jeans', 'Chaquetas',  'Bolso',  'Bufanda',  'Guantes']
const colores = ['Negro', 'Celeste', 'Amarillo', 'Blanco', 'Gris', 'Azul', 'Rojo', 'Verde', 'Verde Claro', 'Beige', 'Marrón', 'Rosado',  'Morado']
const tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const temporadas = ['Primavera', 'Verano', 'Otoño', 'Invierno']
const materiales = ['Algodón', 'Lana',  'Polar', 'Corderoy','Seda', 'Lino', 'Poliéster', 'Denim', 'Cuero']

const OPT_TIPOS = tipos.map((t) => ({ value: normalizeForDb(t), label: t }))
const OPT_CATEGORIAS = categorias.map((c) => ({ value: normalizeForDb(c), label: c }))
const OPT_COLORES = colores.map((c) => ({ value: normalizeForDb(c), label: c }))
const OPT_TALLAS = tallas.map((t) => ({ value: normalizeForDb(t), label: t }))
const OPT_TEMPORADAS = temporadas.map((t) => ({ value: normalizeForDb(t), label: t }))
const OPT_MATERIALES = materiales.map((m) => ({ value: normalizeForDb(m), label: m }))

function CustomSelect({ name, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } })
    setIsOpen(false)
  }

  const selectedOption = options.find(
    (opt) => opt.value === value || normalizeForDb(opt.value) === normalizeForDb(value)
  )

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-4 pr-10 rounded-xl border-2 focus:outline-none focus:ring-0 transition-all duration-300 text-gray-900 flex items-center justify-between ${
          selectedOption
            ? 'bg-[#f6ccfa] border-2 border-[#ffffff] shadow-[inset_0_0_20px_rgba(255,255,255,0.9)]'
            : 'bg-[#ffffff] border-2 border-[#f6ccfa] shadow-[inset_0_0_24px_rgba(246,204,250,0.6)]'
        } focus:border-[#9f8aef]`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#ffffff] rounded-xl border-2 border-[#f6ccfa] shadow-lg z-20 overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="w-full px-5 py-3 text-left hover:bg-[#f6ccfa] transition-colors duration-200 text-gray-900 first:rounded-t-xl last:rounded-b-xl"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const AddPrenda = () => {
  const navigate = useNavigate()
  const { id: editarId } = useParams()
  const isEdit = Boolean(editarId)

  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)
  const [bgRemovalLoading, setBgRemovalLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [loadingPrenda, setLoadingPrenda] = useState(!!editarId)
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })
  const [confirmAction, setConfirmAction] = useState({ show: false, type: '', action: null })

  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    categoria: '',
    color: '',
    talla: '',
    temporada: '',
    marca: '',
    material: '',
    es_publico: false
  })

  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000)
      return () => clearTimeout(timer)
    }
  }, [statusMessage])

  useEffect(() => {
    if (!editarId) return
    let cancelled = false
    setLoadingPrenda(true)
    setSaveError(null)
    prendaService
      .obtenerPorId(editarId)
      .then((p) => {
        if (cancelled || !p) return
        const u = authService.getCurrentUser()
        if (u && p.user_id != null && String(p.user_id) !== String(u.id)) {
          setSaveError('No puedes editar esta prenda.')
          return
        }
        setFormData({
          nombre: p.nombre || '',
          tipo: alignValueToOptions(p.tipo, OPT_TIPOS),
          categoria: alignValueToOptions(p.categoria, OPT_CATEGORIAS),
          color: alignValueToOptions(p.color, OPT_COLORES),
          talla: alignValueToOptions(p.talla, OPT_TALLAS),
          temporada: alignValueToOptions(p.temporada, OPT_TEMPORADAS),
          marca: p.marca || '',
          material: alignValueToOptions(p.material, OPT_MATERIALES),
          es_publico: !!p.publico
        })
        const url = p.imagen_url || ''
        setExistingImageUrl(url)
        setImagePreview(url || null)
        setImageFile(null)
      })
      .catch(() => {
        if (!cancelled) setSaveError('No se pudo cargar la prenda.')
      })
      .finally(() => {
        if (!cancelled) setLoadingPrenda(false)
      })
    return () => {
      cancelled = true
    }
  }, [editarId])

  const imagenActualEsPng = () => {
    if (imageFile) return imageFile.type === 'image/png'
    if (typeof imagePreview === 'string') {
      if (imagePreview.startsWith('data:image/png')) return true
      if (imagePreview.startsWith('http')) return /\.png(\?|#|$)/i.test(imagePreview)
    }
    return false
  }

  const puedeQuitarFondo =
    !imagenActualEsPng() &&
    (!!imageFile || (!!imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('http')))

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImagePreview(ev.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const appendCamposPrenda = (fd) => {
    fd.append('nombre', normalizeForDb(formData.nombre))
    fd.append('tipo', normalizeForDb(formData.tipo))
    fd.append('categoria', normalizeForDb(formData.categoria))
    fd.append('talla', normalizeForDb(formData.talla))
    fd.append('color', normalizeForDb(formData.color))
    fd.append('temporada', normalizeForDb(formData.temporada))
    fd.append('marca', normalizeForDb(formData.marca || ''))
    fd.append('material', normalizeForDb(formData.material || ''))
    fd.append('publico', formData.es_publico ? 'true' : 'false')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveError(null)
    if (!isEdit && !imageFile) {
      setStatusMessage({ type: 'error', text: 'Selecciona una imagen de la prenda.' })
      return
    }
    if (isEdit && !imagePreview) {
      setStatusMessage({ type: 'error', text: 'La prenda debe tener una imagen.' })
      return
    }
    if (!localStorage.getItem('token')) {
      setStatusMessage({ type: 'error', text: 'Inicia sesión para guardar prendas.' })
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        const fd = new FormData()
        if (imageFile) fd.append('imagen', imageFile)
        appendCamposPrenda(fd)
        await prendaService.actualizar(editarId, fd)
        setStatusMessage({ type: 'success', text: 'Prenda actualizada correctamente.' })
        navigate(`/prenda/${editarId}`)
        return
      }

      const fd = new FormData()
      fd.append('imagen', imageFile)
      appendCamposPrenda(fd)
      fd.append('quitar_fondo', 'false')
      await prendaService.crear(fd)
      setStatusMessage({ type: 'success', text: 'Prenda guardada correctamente.' })
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message
      setStatusMessage({ type: 'error', text: typeof msg === 'string' ? msg : 'No se pudo guardar la prenda.' })
    } finally {
      setSaving(false)
    }
  }
  const handleEliminar = () => {
    setConfirmAction({
      show: true,
      type: 'eliminar',
      action: async () => {
        setSaving(true)
        try {
          await prendaService.eliminar(editarId)
          setStatusMessage({ type: 'success', text: 'Prenda eliminada correctamente.' })
          navigate('/')
        } catch (err) {
          const msg = err.response?.data?.message || err.response?.data?.error || err.message
          setStatusMessage({ type: 'error', text: typeof msg === 'string' ? msg : 'No se pudo eliminar la prenda.' })
        } finally {
          setSaving(false)
          setConfirmAction({ show: false, type: '', action: null })
        }
      }
    })
  }

  const handleQuitarFondo = async (e) => {
    e.stopPropagation()
    setStatusMessage({ type: '', text: '' })

    let fileToProcess = imageFile
    if (!fileToProcess && imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('http')) {
      if (/\.png(\?|#|$)/i.test(imagePreview)) return
      setBgRemovalLoading(true)
      try {
        const resp = await fetch(imagePreview, { mode: 'cors' })
        if (!resp.ok) throw new Error('No se pudo descargar la imagen desde la URL.')
        const blob = await resp.blob()
        if (!blob.type.startsWith('image/')) throw new Error('La URL no devolvió una imagen válida.')
        const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg'
        fileToProcess = new File([blob], `prenda.${ext}`, { type: blob.type || 'image/jpeg' })
      } catch (err) {
        setStatusMessage({
          type: 'error',
          text: err.message ||
            'No se pudo cargar la imagen para quitar el fondo (CORS o red). Sube de nuevo la foto desde tu dispositivo.'
        })
        setBgRemovalLoading(false)
        return
      }
    }

    if (!fileToProcess) {
      setStatusMessage({ type: 'error', text: 'Primero selecciona una imagen.' })
      setBgRemovalLoading(false)
      return
    }

    setBgRemovalLoading(true)
    try {
      const fd = new FormData()
      fd.append('imagen', fileToProcess)
      const blob = await prendaService.quitarFondoPreview(fd)
      const baseName = (fileToProcess.name || 'prenda').replace(/\.[^.]+$/, '')
      const newFile = new File([blob], `${baseName}-sin-fondo.png`, { type: 'image/png' })
      setImageFile(newFile)
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target.result)
      reader.readAsDataURL(newFile)
    } catch (err) {
      const msg = err.message || 'No se pudo quitar el fondo.'
      setStatusMessage({ type: 'error', text: msg })
    } finally {
      setBgRemovalLoading(false)
    }
  }

  const handleClearImage = (e) => {
  e.stopPropagation()
  setBgRemovalLoading(false)
  if (imageFile) {
    // Había una imagen nueva subida — cancelar y volver a la original
    setImageFile(null)
    setImagePreview(isEdit && existingImageUrl ? existingImageUrl : null)
  } else {
    // Ya estaba viendo la imagen original — limpiar completamente
    setImagePreview(null)
    setImageFile(null)
  }
  // Resetear el input para permitir re-seleccionar el mismo archivo
  if (fileInputRef.current) fileInputRef.current.value = ''
}

  if (loadingPrenda) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fafbad] to-[#ffffff] flex items-center justify-center text-gray-700">
        Cargando prenda…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafbad] to-[#ffffff] overflow-y-auto p-6 pb-12">
      {statusMessage.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-2 bg-white transition-all ${
          statusMessage.type === 'success' ? 'border-[#79d063] text-gray-900' : 'border-red-300 text-red-600'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${statusMessage.type === 'success' ? 'bg-[#79d063]' : 'bg-red-500'}`} />
          {statusMessage.text}
        </div>
      )}

      {confirmAction.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {confirmAction.type === 'eliminar' ? '¿Eliminar esta prenda?' : '¿Confirmar acción?'}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {confirmAction.type === 'eliminar'
                ? 'Esta acción no se puede deshacer. La prenda se eliminará permanentemente de tu armario.'
                : '¿Estás seguro de realizar esta acción?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction({ show: false, type: '', action: null })}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction.action}
                className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-2xl transition-all ${
                  confirmAction.type === 'eliminar' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#79d063] hover:bg-[#79d063]/90'
                }`}
              >
                {confirmAction.type === 'eliminar' ? 'Eliminar' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2 mb-6 px-8">
  <div className="flex items-center gap-4">
    <button
      type="button"
      onClick={() => (isEdit ? navigate(`/prenda/${editarId}`) : navigate('/'))}
      className="w-12 h-12 bg-[#f6ccfa] hover:bg-[#9f8aef] hover:text-[#ffffff] rounded-xl flex items-center justify-center transition-all duration-300 group shadow-sm hover:shadow-md"
    >
      <ArrowLeft className="w-6 h-6 text-[#9f8aef] group-hover:text-[#ffffff]" />
    </button>
    <h1 className="text-3xl font-subtitulo text-gray-800">
      {isEdit ? 'Editar Prenda' : 'Añadir Nueva Prenda'}
    </h1>
  </div>
  <div className="w-full h-px bg-[#f6ccfa]" />
</div>

      <div className="max-w-6xl mx-auto px-12">
        <div className="flex gap-8 flex-col lg:flex-row">
          <div className="flex-1">
            <div className="space-y-4 max-w-md mx-auto">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !bgRemovalLoading && fileInputRef.current?.click()}
                className={`
                relative bg-[#ffffff] rounded-3xl border-2 border-dashed transition-all duration-300 aspect-square
                ${bgRemovalLoading ? 'pointer-events-none cursor-wait' : 'cursor-pointer'}
                ${isDragging ? 'border-[#9f8aef] bg-[#f6ccfa]/10' : 'border-[#f6ccfa] hover:border-[#9f8aef]'}
                ${imagePreview ? 'p-2' : 'p-8'}
              `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={`w-full h-full rounded-2xl ${imagenActualEsPng() ? 'object-contain bg-[#f3f4f6]' : 'object-cover'}`}
                    />
                    {bgRemovalLoading && (
                      <div className="absolute inset-0 rounded-2xl bg-white/80 flex flex-col items-center justify-center gap-3 z-10">
                        <div className="w-10 h-10 border-[3px] border-[#9f8aef] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium text-gray-700">Quitando fondo…</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-white border-2 border-[#f6ccfa] text-[#9f8aef] hover:bg-[#f6ccfa]/20 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div className="flex flex-col items-center">
                      <Upload className="w-16 h-16 text-[#f6ccfa] mb-4" />
                      <p className="text-gray-900 font-medium mb-2">Arrastra una imagen aquí</p>
                      <p className="text-gray-600 text-sm">o haz clic para seleccionar</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!puedeQuitarFondo || bgRemovalLoading}
                onClick={handleQuitarFondo}
                className="w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-[#9f8aef] text-[#ffffff] shadow-lg hover:bg-[#8a7ae0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                {bgRemovalLoading ? 'Procesando…' : 'Quitar fondo'}
              </button>
              <p className="text-xs text-gray-600 text-center px-2">
                {imagenActualEsPng()
                  ? 'Esta imagen ya es PNG (suele indicar fondo transparente). No hace falta quitar fondo de nuevo.'
                  : 'Opcional: quita el fondo con IA y revisa el resultado antes de guardar. Si no usas este botón, la foto se guarda tal como está.'}
              </p>
            </div>
          </div>

          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              {saveError && (
                <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {saveError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-5 py-4 rounded-xl transition-all duration-300 placeholder-gray-500 text-lg font-medium ${
                        formData.nombre
                          ? 'bg-[#c2e1f9] border-2 border-[#ffffff] shadow-[inset_0_0_15px_rgba(255,255,255,0.9)] text-black'
                          : 'bg-[#ffffff] border-2 border-[#f6ccfa] shadow-[inset_0_0_20px_rgba(246,204,250,0.7)] text-gray-900'
                      } focus:outline-none focus:ring-0 autofill:shadow-[inset_0_0_15px_rgba(255,255,255,0.9),inset_0_0_0_1000px_#c2e1f9]`}
                      placeholder="Nombre de la prenda"
                    />
                  </div>
                </div>

                <CustomSelect
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  placeholder="Categoría"
                  options={OPT_CATEGORIAS}
                />

                <CustomSelect
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Color principal"
                  options={OPT_COLORES}
                />

                <CustomSelect
                  name="talla"
                  value={formData.talla}
                  onChange={handleInputChange}
                  placeholder="Talla"
                  options={OPT_TALLAS}
                />

                <CustomSelect
                  name="temporada"
                  value={formData.temporada}
                  onChange={handleInputChange}
                  placeholder="Temporada"
                  options={OPT_TEMPORADAS}
                />

                <CustomSelect
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  placeholder="Material"
                  options={OPT_MATERIALES}
                />

                <CustomSelect
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  placeholder="Tipo de prenda"
                  options={OPT_TIPOS}
                />

                <div className="col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 rounded-xl transition-all duration-300 placeholder-gray-500 font-medium ${
                        formData.marca
                          ? 'bg-[#c2e1f9] border-2 border-[#ffffff] shadow-[inset_0_0_15px_rgba(255,255,255,0.9)] text-black'
                          : 'bg-[#ffffff] border-2 border-[#f6ccfa] shadow-[inset_0_0_20px_rgba(246,204,250,0.7)] text-gray-900'
                      } focus:outline-none focus:ring-0 autofill:shadow-[inset_0_0_15px_rgba(255,255,255,0.9),inset_0_0_0_1000px_#c2e1f9]`}
                      placeholder="Marca (opcional)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, es_publico: !prev.es_publico }))}
                  className={`
                  relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#9f8aef]/30
                  ${formData.es_publico ? 'bg-[#9f8aef]' : 'bg-gray-300'}
                `}
                >
                  <div
                    className={`
                  absolute top-1 left-1 w-6 h-6 bg-[#ffffff] rounded-full transition-transform duration-300 shadow-sm
                  ${formData.es_publico ? 'translate-x-6' : 'translate-x-0'}
                `}
                  />
                </button>
                <span className="text-gray-700 font-medium">Hacer pública esta prenda</span>
              </div>

              {/* Botones de acción - Guardar y Eliminar */}
<div className={`${isEdit ? 'flex gap-4' : ''}`}>
  <button
    type="submit"
    disabled={saving}
    className={`py-5 bg-[#79d063] text-[#ffffff] rounded-xl font-semibold text-lg hover:bg-[#79d063]/90 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-60 disabled:transform-none ${
      isEdit ? 'flex-1' : 'w-full'
    }`}
  >
    <Save className="w-6 h-6" />
    {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Guardar Prenda en mi Armario'}
  </button>

  {isEdit && (
    <button
      type="button"
      onClick={handleEliminar}
      disabled={saving}
      className="flex-1 py-5 bg-red-500 text-[#ffffff] rounded-xl font-semibold text-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-60 disabled:transform-none"
    >
      <X className="w-6 h-6" />
      Eliminar prenda
    </button>
  )}
</div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddPrenda
