import React, { useState, useRef } from 'react'
import { ArrowLeft, Upload, Sparkles, Save, X, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AddPrenda = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [openSelect, setOpenSelect] = useState(null)
  
  // Campos del formulario basados en el análisis del backend
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    color: '',
    talla: '',
    temporada: '',
    marca: '',
    material: '',
    ocasion: '',
    es_publico: false
  })

  // Opciones para los selects
  const categorias = ['Camisa', 'Pantalón', 'Vestido', 'Abrigo', 'Falda', 'Blusa', 'Jeans', 'Chaquetas']
  const colores = ['Negro', 'Blanco', 'Gris', 'Azul', 'Rojo', 'Verde', 'Beige', 'Marrón', 'Rosa']
  const tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const temporadas = ['Primavera', 'Verano', 'Otoño', 'Invierno']
  const materiales = ['Algodón', 'Lana', 'Seda', 'Lino', 'Poliéster', 'Denim', 'Cuero']
  const ocasiones = ['Casual', 'Formal', 'Deportivo', 'Fiesta', 'Trabajo', 'Playa']

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
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
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

  // Componente Custom Select
const CustomSelect = ({ name, value, onChange, options, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } })
    setIsOpen(false)
  }

  const selectedOption = options.find(opt => opt.value === value)

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

const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí conectaríamos con la API del backend
    console.log('Datos del formulario:', formData)
    console.log('Imagen:', imagePreview)
    console.log('Quitar fondo:', removeBackground)
    
    // Mock: Simular guardado exitoso
    alert('Prenda guardada exitosamente en tu armario')
    navigate('/')
  }

  const handleRemoveBackground = () => {
    setRemoveBackground(!removeBackground)
    // Mock: Simular procesamiento con IA
    console.log('Procesando eliminación de fondo con IA...')
  }

  return (
    <div className="h-screen bg-gradient-to-b from-[#fafbad] to-[#ffffff] overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-6 px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-[#f6ccfa] hover:bg-[#9f8aef] hover:text-[#ffffff] rounded-xl flex items-center justify-center transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-6 h-6 text-[#9f8aef] group-hover:text-[#ffffff]" />
          </button>
          <h1 className="text-3xl font-semibold text-gray-900">Añadir Nueva Prenda</h1>
        </div>
        <div className="w-full h-px bg-[#f6ccfa]" />
      </div>

      {/* Contenido Principal - 2 Columnas */}
      <div className="max-w-6xl mx-auto px-12">
        <div className="flex gap-8">
        {/* Columna Izquierda - Subida de Imagen */}
        <div className="flex-1">
          <div className="space-y-4 max-w-md mx-auto">
            {/* Área de Drag & Drop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative bg-[#ffffff] rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer aspect-square
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
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setImagePreview(null)
                    }}
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

            {/* Botón de Quitar Fondo */}
            <button
              onClick={handleRemoveBackground}
              className={`
                w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                ${removeBackground 
                  ? 'bg-[#9f8aef] text-[#ffffff] shadow-lg' 
                  : 'bg-[#f6ccfa] text-[#9f8aef] hover:bg-[#9f8aef] hover:text-[#ffffff]'
                }
              `}
            >
              <Sparkles className="w-5 h-5" />
               Quitar Fondo (IA)
            </button>
          </div>
        </div>

        {/* Columna Derecha - Formulario */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Fila 1 - Nombre (Ancho completo) */}
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

              {/* Fila 2 - Categoría | Color */}
              <CustomSelect
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                required
                placeholder="Categoría"
                options={categorias.map(cat => ({ value: cat.toLowerCase(), label: cat }))}
              />

              <CustomSelect
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                required
                placeholder="Color principal"
                options={colores.map(color => ({ value: color.toLowerCase(), label: color }))}
              />

              {/* Fila 3 - Talla | Temporada */}
              <CustomSelect
                name="talla"
                value={formData.talla}
                onChange={handleInputChange}
                required
                placeholder="Talla"
                options={tallas.map(talla => ({ value: talla, label: talla }))}
              />

              <CustomSelect
                name="temporada"
                value={formData.temporada}
                onChange={handleInputChange}
                required
                placeholder="Temporada"
                options={temporadas.map(temp => ({ value: temp.toLowerCase(), label: temp }))}
              />

              {/* Fila 4 - Material | Ocasión */}
              <CustomSelect
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                placeholder="Material"
                options={materiales.map(material => ({ value: material.toLowerCase(), label: material }))}
              />

              <CustomSelect
                name="ocasion"
                value={formData.ocasion}
                onChange={handleInputChange}
                placeholder="Ocasión"
                options={ocasiones.map(ocasion => ({ value: ocasion.toLowerCase(), label: ocasion }))}
              />

              {/* Fila 5 - Marca (Ancho completo) */}
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

            {/* Fila 6 - Toggle Personalizado (Ancho completo) */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, es_publico: !prev.es_publico }))}
                className={`
                  relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#9f8aef]/30
                  ${formData.es_publico ? 'bg-[#9f8aef]' : 'bg-gray-300'}
                `}
              >
                <div className={`
                  absolute top-1 left-1 w-6 h-6 bg-[#ffffff] rounded-full transition-transform duration-300 shadow-sm
                  ${formData.es_publico ? 'translate-x-6' : 'translate-x-0'}
                `} />
              </button>
              <label className="text-gray-700 font-medium cursor-pointer hover:text-gray-900 transition-colors">
                Hacer pública esta prenda
              </label>
            </div>

            {/* Botón de Guardar */}
            <button
              type="submit"
              className="w-full py-5 bg-[#79d063] text-[#ffffff] rounded-xl font-semibold text-lg hover:bg-[#79d063]/90 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Save className="w-6 h-6" />
              Guardar Prenda en mi Armario
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  )
}

export default AddPrenda
