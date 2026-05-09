import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { Search, ExternalLink, Trash, Sparkles, X, Plus } from 'lucide-react'
import logo3 from '../assets/logo3.png'

const WishlistPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'seleccion')
  const [showSuggestion, setShowSuggestion] = useState(true)

  // Estado para el formulario de añadir
  const [formData, setFormData] = useState({
    url: '',
    imageFile: null,
    imagePreview: '',
    descripcion: '',
    categoria: ''
  })

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        const result = event.target.result;
        setFormData({ ...formData, imagePreview: result });
      };
      reader.readAsDataURL(file);
      setFormData({ ...formData, imageFile: file });
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageFile: null, imagePreview: '' });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.url && !formData.imageFile) {
      alert('Por favor, añade una URL o una imagen del producto');
      return;
    }
    if (!formData.categoria) {
      alert('Por favor, selecciona una categoría');
      return;
    }
    
    console.log('Producto añadido a la selección:', formData);
    alert('¡Producto añadido con éxito a tu Selección!');
    
    // Resetear formulario
    setFormData({
      url: '',
      imageFile: null,
      imagePreview: '',
      descripcion: '',
      categoria: ''
    });
    
    // Redirigir a la pestaña de selección
    navigate('/wishlist?tab=seleccion');
  };

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const tabs = [
    { id: 'seleccion', label: 'Mi Selección' },
    { id: 'explorar', label: 'Explorar' },
    { id: 'añadir', label: 'Añadir Producto' }
  ]

  // Datos de Explorar - nuevos productos para descubrir
  const explorarItems = [
    {
      id: 101,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1558769132-cb1aea45c1e5?w=400&h=450&fit=crop',
      name: 'Blazer moderno',
      description: 'Estilo urbano elegante'
    },
    {
      id: 102,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=550&fit=crop',
      name: 'Vestido coctel',
      description: 'Perfecto para eventos especiales'
    },
    {
      id: 103,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      name: 'Jeans vintage',
      description: 'Clásicos atemporales'
    },
    {
      id: 104,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1578632292385-f441ccb0561e?w=400&h=500&fit=crop',
      name: 'Camiseta gráfica',
      description: 'Diseños originales'
    },
    {
      id: 105,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=350&fit=crop',
      name: 'Botas de cuero',
      description: 'Calidad duradera'
    },
    {
      id: 106,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop',
      name: 'Bolso de mano',
      description: 'Elegancia funcional'
    }
  ]

  // Datos de Wishlist - ropa real con información completa
  const wishlistItems = [
    {
      id: 1,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop',
      name: 'Vestido floral verano',
      description: 'Perfecto para días soleados y reuniones informales',
      externalLink: 'https://www.zara.com'
    },
    {
      id: 2,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop',
      name: 'Blazer beige elegante',
      description: 'Ideal para oficina y eventos formales',
      externalLink: 'https://www.hm.com'
    },
    {
      id: 3,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      name: 'Jeans clásicos azul',
      description: 'Versátiles y cómodos para cualquier ocasión'
    },
    {
      id: 4,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1558769132-cb1aea45c1e5?w=400&h=450&fit=crop',
      name: 'Camiseta blanca básica',
      description: 'Imprescindible en todo armario',
      externalLink: 'https://www.mango.com'
    },
    {
      id: 5,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1578632292385-f441ccb0561e?w=400&h=550&fit=crop',
      name: 'Botines de cuero marrón',
      description: 'Comodidad y estilo para el día a día'
    },
    {
      id: 6,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=350&fit=crop',
      name: 'Bufanda de lana gris',
      description: 'Perfecta para el invierno',
      externalLink: 'https://www.massimodutti.com'
    }
  ]

  const breakpointColumnsObj = {
    default: 5,
    1200: 4,
    900: 3,
    600: 2,
    400: 1
  }

  return (
    <div className="min-h-screen relative">
      {/* Barra de Navegación Superior - Wishlist */}
      <header className="sticky top-0 z-30 bg-[#ffffff] shadow-sm px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo PinWand - Extremo Izquierdo */}
          <button
            onClick={() => navigate('/')}
            className="h-10 w-auto cursor-pointer mr-6 hover:opacity-90 transition-all"
          >
            <img
              src={logo3}
              alt="PinWand"
              className="h-full w-auto object-contain"
            />
          </button>

          {/* Tabs de navegación - Wishlist */}
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  navigate(`/wishlist?tab=${tab.id}`)
                }}
                className={`
                  px-4 py-2 font-medium transition-all duration-300 rounded-2xl
                  ${activeTab === tab.id 
                    ? 'bg-morado text-white' 
                    : 'text-gray-900 hover:bg-rosado/30'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Buscador Central - Wishlist */}
          <div className="flex-1 mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Buscar en mi Wishlist..."
                className="w-full pl-12 pr-4 py-3 bg-[#ffffff] rounded-full border-2 border-rosado/50 focus:border-rosado focus:ring-0 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>

        </div>
      </header>

      
      {/* Contenido Principal - Wishlist */}
      <main className="p-8 bg-[linear-gradient(to_bottom,#f6ccfa_0%,#ffffff_40%,#ffffff_60%,#f6ccfa_100%)] bg-fixed min-h-screen">
        {/* Renderizado Condicional de Vistas */}
        {activeTab === 'seleccion' && (
          <div>
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex gap-6"
              columnClassName="flex-1"
            >
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="mb-6 break-inside-avoid"
                >
                  {item.type === 'image' ? (
                    <div 
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/wishdetail/${item.id}?from=wishlist-selection`)}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Capa de sombreado suave en hover */}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Botón de eliminar */}
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        
                        {/* Botón Adquirido */}
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-4 right-4 bg-[#79d063] text-white font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#79d063]/90"
                        >
                          Adquirido
                        </button>
                      </div>
                      
                      {/* Información de la prenda */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            {item.name}
                            {item.externalLink && (
                              <ExternalLink 
                                className="w-3 h-3 text-gray-500 hover:text-rosado cursor-pointer" 
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </Masonry>
          </div>
        )}

        {activeTab === 'explorar' && (
          <div>
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex gap-6"
              columnClassName="flex-1"
            >
              {explorarItems.map((item) => (
                <div
                  key={item.id}
                  className="mb-6 break-inside-avoid"
                >
                  {item.type === 'image' ? (
                    <div 
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/wishdetail/${item.id}?from=wishlist-explore`)}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Overlay oscuro con icono + en hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-t-3xl">
                          <div className="bg-white rounded-full p-4 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <Plus className="w-8 h-8 text-morado" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Información de la prenda */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900 text-sm">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </Masonry>
          </div>
        )}

        {activeTab === 'añadir' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-md border border-rosado/30 mt-8 mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-[#f6ccfa] rounded-full p-3">
                <Plus className="w-6 h-6 text-morado" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Añade tu objeto de deseo</h2>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Campo URL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL de la prenda</label>
                <div className="relative">
                  <input 
                    type="url" 
                    name="url" 
                    value={formData.url} 
                    onChange={handleFormChange} 
                    required 
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-100 focus:border-rosado focus:ring-0 outline-none transition-all text-gray-800 bg-white" 
                    placeholder="https://zara.com/vestido-floral..."
                  />
                  {/* Divisor "o" */}
                  <div className="absolute inset-y-0 left-1/2 top-1/2 bottom-1/2 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">—</span>
                  </div>
                </div>
              </div>
              
              {/* Campo imagen con drop zone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">o subí una foto</label>
                <div 
                  className="relative border-2 border-dashed border-rosado/50 rounded-2xl p-8 text-center cursor-pointer hover:bg-rosado/10 transition-colors"
                  onClick={() => document.getElementById('imageInput')?.click()}
                >
                  <input 
                    type="file" 
                    id="imageInput"
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {formData.imagePreview ? (
                    <div className="relative">
                      <img 
                        src={formData.imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-rosado/20 rounded-full p-4 mb-4">
                        <Plus className="w-8 h-8 text-morado" />
                      </div>
                      <p className="text-gray-600 text-sm">Arrastra una imagen o haz clic para subir</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Campo descripción */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción / Notas</label>
                <textarea 
                  name="descripcion" 
                  value={formData.descripcion} 
                  onChange={handleFormChange} 
                  rows={4} 
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-rosado focus:ring-0 outline-none transition-all text-gray-800 resize-none" 
                  placeholder="ej: La quiero en talle M, para usar en verano..."
                />
              </div>
              
              {/* Campo categoría */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
                <select 
                  name="categoria" 
                  value={formData.categoria} 
                  onChange={handleFormChange} 
                  className="w-full px-4 py-3 border-2 border-gray-100 focus:border-rosado focus:ring-0 outline-none transition-all text-gray-800 bg-white cursor-pointer"
                >
                  <option value="">Seleccioná una categoría</option>
                  <option value="tops">Tops y camisas</option>
                  <option value="pantalones">Pantalones y jeans</option>
                  <option value="vestidos">Vestidos y faldas</option>
                  <option value="calzado">Calzado</option>
                  <option value="abrigos">Abrigos y blazers</option>
                  <option value="accesorios">Accesorios</option>
                </select>
              </div>
              
              {/* Botón de submit */}
              <button 
                type="submit" 
                className="w-full bg-[#79d063] text-white rounded-xl py-5 font-semibold text-lg shadow-lg hover:scale-[1.02] transition-all duration-300 mt-6 flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar a mi Selección
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Sugerencia Flotante de IA - RF15 */}
      {showSuggestion && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-amarillo/90 backdrop-blur-sm border border-amarillo rounded-3xl p-4 shadow-lg max-w-sm mx-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Sparkles className="w-5 h-5 text-morado" />
            </div>
            <div className="flex-1">
              <p className="text-gray-800 text-sm font-medium">
                <span className="font-semibold"> Sugerencia:</span> Tu armario tiene muchos pantalones oscuros pero pocas camisas claras para combinarlos. ¡Añade una a tu wishlist!
              </p>
            </div>
            <button
              onClick={() => setShowSuggestion(false)}
              className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WishlistPage
