const { getClima } = require('../services/weatherService')

const climaController = {
  async obtenerClima(req, res) {
    try {
      const { ciudad } = req.params
      const clima = await getClima(ciudad)
      res.json(clima)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  async outfitPorClima(req, res) {
    try {
      const { ciudad } = req.params
      const clima = await getClima(ciudad)

      const sugerencias = {
        muy_frio: {
          mensaje: `Hace ${clima.temperatura}°C en ${clima.ciudad}, abrígate muy bien!`,
          prendas: ['abrigo grueso', 'bufanda', 'gorro', 'guantes', 'botas', 'suéter de lana']
        },
        frio: {
          mensaje: `Hace ${clima.temperatura}°C en ${clima.ciudad}, lleva un abrigo!`,
          prendas: ['chaqueta', 'suéter', 'jeans', 'zapatillas cerradas', 'bufanda ligera']
        },
        templado: {
          mensaje: `Hace ${clima.temperatura}°C en ${clima.ciudad}, clima perfecto!`,
          prendas: ['camisa ligera', 'jeans o pantalón', 'zapatillas', 'chaqueta ligera']
        },
        calido: {
          mensaje: `Hace ${clima.temperatura}°C en ${clima.ciudad}, vístete ligero!`,
          prendas: ['camiseta', 'shorts o falda', 'zapatillas', 'gafas de sol']
        },
        caliente: {
          mensaje: `Hace ${clima.temperatura}°C en ${clima.ciudad}, mucho calor!`,
          prendas: ['ropa muy ligera', 'shorts', 'sandalias', 'gafas de sol', 'sombrero']
        }
      }

      res.json({
        clima,
        sugerencia: sugerencias[clima.clasificacion]
      })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = climaController