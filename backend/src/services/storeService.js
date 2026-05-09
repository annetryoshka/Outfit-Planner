const fetch = require('node-fetch');

const FAKE_STORE_URL = 'https://fakestoreapi.com';

// Categorías de ropa disponibles en Fake Store API
const CATEGORIAS_ROPA = ["women's clothing", "men's clothing"];

const buscarProductos = async (keyword = '', categoria = '') => {
  try {
    let productos = [];

    if (categoria === 'mujer') {
      // Solo ropa de mujer
      const response = await fetch(`${FAKE_STORE_URL}/products/category/women's clothing`);
      productos = await response.json();

    } else if (categoria === 'hombre') {
      // Solo ropa de hombre
      const response = await fetch(`${FAKE_STORE_URL}/products/category/men's clothing`);
      productos = await response.json();

    } else {
      // Sin categoría → traer AMBAS categorías de ropa, no todos los productos
      const [mujer, hombre] = await Promise.all([
        fetch(`${FAKE_STORE_URL}/products/category/women's clothing`).then(r => r.json()),
        fetch(`${FAKE_STORE_URL}/products/category/men's clothing`).then(r => r.json())
      ]);
      productos = [...mujer, ...hombre];
    }

    // Filtrar por keyword si viene
    const filtrados = keyword
      ? productos.filter(item =>
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          item.description.toLowerCase().includes(keyword.toLowerCase())
        )
      : productos;

    return filtrados.map(item => ({
      product_id: item.id,
      nombre: item.title,
      imagen_url: item.image,
      precio: item.price,
      url_tienda: `${FAKE_STORE_URL}/products/${item.id}`,
      rating: item.rating?.rate,
      reviews: item.rating?.count,
      categoria: item.category,
      tienda: 'fakestore'
    }));

  } catch (error) {
    console.error('Error en buscarProductos:', error.message);
    return [];
  }
};

module.exports = { buscarProductos };