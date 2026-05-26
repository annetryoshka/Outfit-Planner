import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Upload, X, Sparkles, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import prendaService from '../services/prendaService'
import tryonService from '../services/tryonService'

const TryOnPrenda = () => {
  const navigate = useNavigate()

  // Imagen de la persona
  const fileInputRef = useRef(null)
  const [personaFile, setPersonaFile] = useState(null)
  const [personaPreview, setPersonaPreview] = useState(null)

  // Prenda seleccionada del armario
  const [prendaSeleccionada, setPrendaSeleccionada] = useState(null)

  // Prendas del armario (solo superior e inferior)
  const [prendas, setPrendas] = useState([])
  const [loadingPrendas, setLoadingPrendas] = useState(true)

  // Estado de la prueba
  const [probando, setProbando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  // Cargar prendas compatibles con try-on
  useEffect(() => {
    setLoadingPrendas(true)
    prendaService.obtenerTodas()
      .then(data => {
        const compatibles = (Array.isArray(data) ? data : []).filter(p => {
          const tipo = p.tipo?.trim().toLowerCase()
          return tipo === 'superior' || tipo === 'inferior'
        })
        setPrendas(compatibles)
      })
      .catch(() => setPrendas([]))
      .finally(() => setLoadingPrendas(false))
  }, [])

  const handlePersonaFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setPersonaFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPersonaPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e) => e.preventDefault()

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handlePersonaFileSelect(file)
  }

  const handleProbar = async () => {
    if (!personaFile) {
      setError('Sube una foto tuya para continuar.')
      return
    }
    if (!prendaSeleccionada) {
      setError('Selecciona una prenda del armario.')
      return
    }

    setError(null)
    setProbando(true)

    try {
      await tryonService.crearPrueba(prendaSeleccionada.id, personaFile)
      setExito(true)
      // Redirigir al perfil en tab pruebas después de 2 segundos
      setTimeout(() => {
        navigate('/perfil?tab=pruebas')
      }, 2000)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al procesar la prueba.'
      setError(msg)
    } finally {
      setProbando(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-b from-[#fafbad] to-[#ffffff] overflow-hidden flex flex-col">

      {/* Header */}
      <div className="flex flex-col gap-2 px-8 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/perfil?tab=pruebas')}
            className="w-12 h-12 bg-[#f6ccfa] hover:bg-[#9f8aef] rounded-xl flex items-center justify-center transition-all duration-300 group shadow-sm"
          >
            <ArrowLeft className="w-6 h-6 text-[#9f8aef] group-hover:text-white" />
          </button>
          <h1 className="text-3xl font-semibold text-gray-800">Probar Prenda</h1>
        </div>
        <div className="w-full h-px bg-[#f6ccfa]" />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-8 mb-2 flex-shrink-0">
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Popup de éxito */}
      {exito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
            <div className="w-16 h-16 bg-[#79d063]/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#79d063]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">¡Prueba creada!</h2>
            <p className="text-gray-500 text-sm text-center">
              Tu prueba virtual se ha generado correctamente. Redirigiendo...
            </p>
            <div className="w-6 h-6 border-2 border-[#9f8aef] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Contenido principal — dos columnas, sin scroll de página */}
      <div className="flex flex-1 gap-6 px-8 pb-6 overflow-hidden">

        {/* Columna izquierda — persona + prenda seleccionada */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">

          {/* Fila superior — persona y prenda lado a lado */}
          <div className="flex gap-4 flex-1 min-h-0">

            {/* Zona persona */}
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex-shrink-0">
                Tu foto
              </p>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  flex-1 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer
                  relative overflow-hidden
                  ${personaPreview
                    ? 'border-[#9f8aef] p-1'
                    : 'border-[#f6ccfa] hover:border-[#9f8aef] bg-white p-6'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && handlePersonaFileSelect(e.target.files[0])}
                />

                {personaPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={personaPreview}
                      alt="Tu foto"
                      className="w-full h-full object-contain rounded-2xl bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPersonaPreview(null)
                        setPersonaFile(null)
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white border-2 border-[#f6ccfa] text-[#9f8aef] rounded-full flex items-center justify-center shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#f6ccfa]/50 flex items-center justify-center">
                      <User className="w-8 h-8 text-[#9f8aef]" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium text-sm">Sube tu foto</p>
                      <p className="text-gray-400 text-xs mt-1">Arrastra o haz clic</p>
                      <p className="text-gray-300 text-xs mt-1">Foto de cuerpo completo recomendada</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Zona prenda seleccionada */}
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex-shrink-0">
                Prenda a probar
              </p>
              <div className={`
                flex-1 rounded-3xl border-2 border-dashed transition-all duration-300
                relative overflow-hidden
                ${prendaSeleccionada
                  ? 'border-[#9f8aef] p-1'
                  : 'border-[#f6ccfa] bg-white p-6'
                }
              `}>
                {prendaSeleccionada ? (
                  <div className="relative w-full h-full">
                    <img
                      src={prendaSeleccionada.imagen_url}
                      alt={prendaSeleccionada.nombre}
                      className="w-full h-full object-contain rounded-2xl bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => setPrendaSeleccionada(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white border-2 border-[#f6ccfa] text-[#9f8aef] rounded-full flex items-center justify-center shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {/* Badge tipo */}
                    <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-[#9f8aef] border border-[#f6ccfa]">
                      {prendaSeleccionada.tipo}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#f6ccfa]/50 flex items-center justify-center">
                      <span className="text-2xl">👗</span>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium text-sm">Selecciona una prenda</p>
                      <p className="text-gray-400 text-xs mt-1">Haz clic en el armario</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botón probar */}
          <button
            type="button"
            onClick={handleProbar}
            disabled={probando || !personaFile || !prendaSeleccionada}
            className="w-full py-4 bg-[#9f8aef] text-white rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:bg-[#8a7ae0] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Sparkles className="w-5 h-5" />
            {probando ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando prueba virtual...
              </span>
            ) : (
              'Probar Prenda'
            )}
          </button>
        </div>

        {/* Columna derecha — armario virtual (scroll interno) */}
        <div className="w-72 flex flex-col overflow-hidden bg-white rounded-3xl border-2 border-[#f6ccfa] shadow-sm flex-shrink-0">

          {/* Header armario */}
          <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-[#f6ccfa]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Armario Virtual
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Solo prendas compatibles con try-on
            </p>
          </div>

          {/* Lista de prendas con scroll interno */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
            {loadingPrendas ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#9f8aef] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : prendas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">👗</p>
                <p className="text-xs text-gray-400 font-medium">
                  No tienes prendas compatibles
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Agrega prendas de tipo superior o inferior
                </p>
              </div>
            ) : (
              prendas.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPrendaSeleccionada(p)}
                  className={`
                    flex items-center gap-3 p-2 rounded-2xl transition-all duration-200 text-left w-full
                    ${prendaSeleccionada?.id === p.id
                      ? 'bg-[#f6ccfa] border-2 border-[#9f8aef]'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-[#f6ccfa]/40 hover:border-[#f6ccfa]'
                    }
                  `}
                >
                  {/* Miniatura */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-100">
                    {p.imagen_url ? (
                      <img
                        src={p.imagen_url}
                        alt={p.nombre}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-lg">👕</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{p.nombre}</p>
                    <p className="text-[10px] text-gray-400 capitalize mt-0.5">{p.tipo}</p>
                    {p.color && (
                      <p className="text-[10px] text-gray-300 capitalize">{p.color}</p>
                    )}
                  </div>

                  {/* Indicador seleccionado */}
                  {prendaSeleccionada?.id === p.id && (
                    <div className="w-5 h-5 rounded-full bg-[#9f8aef] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TryOnPrenda