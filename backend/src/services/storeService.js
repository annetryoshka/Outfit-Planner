const fetch = require('node-fetch');

const CHANNEL3_URL = 'https://api.trychannel3.com/v1';
const CHANNEL3_API_KEY = process.env.CHANNEL3_API_KEY;

const buscarProductos = async (keyword = '', categoria = '') => {
  try {
    let queryBusqueda = keyword.trim().toLowerCase();
    
    if (categoria === 'mujer') {
      queryBusqueda = queryBusqueda ? `${queryBusqueda} women` : 'women clothing';
    } else if (categoria === 'hombre') {
      queryBusqueda = queryBusqueda ? `${queryBusqueda} men` : 'men clothing';
    } else if (!queryBusqueda) {
      queryBusqueda = 'clothes';
    }

    console.log(`[Channel3] Buscando productos con keyword="${queryBusqueda}"`);

    const response = await fetch(`${CHANNEL3_URL}/search`, {
      method: 'POST',
      headers: {
        'X-API-Key': CHANNEL3_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: queryBusqueda,
        limit: 20
      })
    });

    if (!response.ok) throw new Error(`Error en API de Channel3: ${response.status} ${response.statusText}`);

    const result = await response.json();
    console.log(`[Channel3] Resultados obtenidos: ${result.products.length} productos encontrados`);
    const listaProductos = result.products || [];

    return listaProductos.map(item => {
      const primeraOferta = item.offers && item.offers[0] ? item.offers[0] : null;
      let imagen = 'https://via.placeholder.com/400?text=Sin+Imagen';
      if (item.images && item.images[0]) {
        if (typeof item.images[0] === 'string') {
          imagen = item.images[0];
        } else if (item.images[0].url) {
          imagen = item.images[0].url;
        }
      }
      return {
        product_id: item.id || Math.random().toString(),
        nombre: item.title || 'Prenda de vestir',
        imagen_url: imagen,
        precio: primeraOferta?.price?.price ? parseFloat(primeraOferta.price.price) : 0.00,
        
        url_tienda: primeraOferta?.url || 'https://trychannel3.com',
        rating: 4.5, 
        reviews: 18,
        categoria: categoria || item.category?.title || 'Ropa',
        tienda: primeraOferta?.domain || 'Tienda Asociada'
      };
    });

  } catch (error) {
    console.error('Error en buscarProductos:', error.message);
    return [];
  }
};

module.exports = { buscarProductos };