import React, { useState, useRef } from 'react'
import { ArrowLeft, Upload, Sparkles, Save, X, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AddPrenda = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [removeBackground, setRemoveBackground] = useState(false)
  
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
    <div className="min-h-screen bg-base py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12 px-8">
        <button
          onClick={() => navigate('/')}
          className="w-12 h-12 bg-crema hover:bg-vino hover:text-crema rounded-xl flex items-center justify-center transition-all duration-300 group shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-6 h-6 text-vino group-hover:text-crema" />
        </button>
        <h1 className="text-3xl font-semibold text-vino">Añadir Nueva Prenda</h1>
      </div>

      {/* Contenido Principal - 2 Columnas */}
      <div className="max-w-6xl mx-auto px-12">
        <div className="flex gap-16">
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
                relative bg-gris-claro rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer aspect-square
                ${isDragging ? 'border-vino bg-arena/20' : 'border-arena/40 hover:border-vino/60'}
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
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-96 object-cover rounded-2xl"
                />
              ) : (
                <div className="text-center">
                  <Upload className="w-16 h-16 text-arena mx-auto mb-4" />
                  <p className="text-arena font-medium mb-2">Arrastra una imagen aquí</p>
                  <p className="text-arena/60 text-sm">o haz clic para seleccionar</p>
                </div>
              )}
            </div>

            {/* Botón de Quitar Fondo */}
            <button
              onClick={handleRemoveBackground}
              className={`
                w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                ${removeBackground 
                  ? 'bg-vino text-crema shadow-lg' 
                  : 'bg-crema text-vino hover:bg-vino hover:text-crema'
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
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              {/* Fila 1 - Nombre (Ancho completo) */}
              <div className="col-span-2">
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 bg-crema rounded-xl border border-transparent focus:ring-2 focus:ring-vino/30 focus:border-vino focus:outline-none transition-all duration-300 text-vino placeholder-arena/60 text-lg"
                  placeholder="Nombre de la prenda"
                />
              </div>

              {/* Fila 2 - Categoría | Color */}
              <div className="relative">
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 pr-10 bg-crema rounded-xl border border-transparent focus:ring-2 focus:ring-vino/30 focus:border-vino focus:outline-none transition-all duration-300 text-vino appearance-none"
                >
                  <option value="">Categoría</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 pr-10 bg-crema rounded-xl border border-transparent focus:ring-2 focus:ring-vino/30 focus:border-vino focus:outline-none transition-all duration-300 text-vino appearance-none"
                >
                  <option value="">Color principal</option>
                  {colores.map(color => (
                    <option key={color} value={color.toLowerCase()}>{color}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena pointer-events-none" />
              </div>

              {/* Fila 3 - Talla | Temporada */}
              <div className="relative">
                <select
                  name="talla"
                  value={formData.talla}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 pr-10 bg-crema rounded-xl border border-transparent focus:ring-2 focus:ring-vino/30 focus:border-vino focus:outline-none transition-all duration-300 text-vino appearance-none"
                >
                  <option value="">Talla</option>
                  {tallas.map(talla => (
                    <option key={talla} value={talla}>{talla}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  name="temporada"
                  value={formData.temporada}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 pr-10 bg-crema rounded-xl border border-transparent focus:ring-2 focus:ring-vino/30 focus:border-vino focus:outline-none transition-all duration-300 text-vino appearance-none"
                >
                  <option value="">Temporada</option>
                  {temporadas.map(temp => (
                    <option key={temp} value={temp.toLowerCase()}>{temp}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena pointer-events-none" />
              </div>

              {/* Fila 4 - Material | Ocasión */}
              <div className="relative">
                <select
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 pr-10 bg-crema rounded-xl border border-transparent focus:ring-2 focus:ring-vino/30 focus:border-vino focus:outline-none transition-all duration-300 text-vino appearance-none"
                >
                  <option value="">Material</option>
                  {materiales.map(material => (
                    <option key={material} value={material.toLowerCase()}>{material}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  name="ocasion"
                  value={formData.ocasion}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 pr-10 bg-crema rounded-xl border border-transparent focus:ring-2 focus:ring-vino/30 focus:border-vino focus:outline-none transition-all duration-300 text-vino appearance-none"
                >
                  <option value="">Ocasión</option>
                  {ocasiones.map(ocasion => (
                    <option key={ocasion} value={ocasion.toLowerCase()}>{ocasion}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena pointer-events-none" />
              </div>

              {/* Fila 5 - Marca (Ancho completo) */}
              <div className="col-span-2">
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-crema rounded-xl border border-transparent focus:ring-2 focus:ring-vino/30 focus:border-vino focus:outline-none transition-all duration-300 text-vino placeholder-arena/60"
                  placeholder="Marca (opcional)"
                />
              </div>
            </div>

            {/* Fila 6 - Toggle Personalizado (Ancho completo) */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, es_publico: !prev.es_publico }))}
                className="relative w-14 h-8 bg-crema rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-vino/30"
              >
                <div className={`
                  absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm
                  ${formData.es_publico ? 'translate-x-6' : 'translate-x-0'}
                `} />
                {formData.es_publico && (
                  <div className="absolute inset-0 bg-vino rounded-full" />
                )}
              </button>
              <label className="text-gris-claro font-medium cursor-pointer hover:text-arena transition-colors">
                Hacer pública esta prenda
              </label>
            </div>

            {/* Botón de Guardar */}
            <button
              type="submit"
              className="w-full py-5 bg-vino text-crema rounded-xl font-semibold text-lg hover:bg-vino/90 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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
