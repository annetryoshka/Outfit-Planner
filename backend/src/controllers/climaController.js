const { getClima, getClimaPorCoordenadas } = require('../services/weatherService')

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
      res.json({ clima, sugerencia: sugerencias[clima.clasificacion] })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  async outfitPorCoordenadas(req, res) {
    try {
      const { lat, lon } = req.query
      console.log('Coordenadas recibidas:', lat, lon)
      const clima = await getClimaPorCoordenadas(lat, lon)
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
      res.json({ clima, sugerencia: sugerencias[clima.clasificacion] })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  async outfitInteligente(req, res) {
  try {
    const { lat, lon } = req.query
    const pool = require('../config/database')
    const clima = await getClimaPorCoordenadas(lat, lon)

    // Mapear
    const recomendaciones = {
      muy_frio: ['abrigo', 'outerwear', 'sueter', 'top', 'bottom'],
      frio: ['outerwear', 'sueter', 'top', 'bottom'],
      templado: ['top', 'bottom', 'outerwear'],
      calido: ['top', 'bottom', 'shoes'],
      caliente: ['top', 'bottom', 'shoes'],
    }

    const tiposRecomendados = recomendaciones[clima.clasificacion] || ['top', 'bottom']
    const user_id = req.usuario.id

    const result = await pool.query(
      `SELECT * FROM prendas WHERE user_id = $1 
       AND (tipo = ANY($2) OR temporada = 'todo el año' OR temporada = $3)
       LIMIT 10`,
      [user_id, tiposRecomendados, clima.clasificacion === 'muy_frio' || clima.clasificacion === 'frio' ? 'invierno' : 'verano']
    )

    const prendas = result.rows
    const outfit = {}
    const tiposBase = ['top', 'bottom', 'outerwear', 'shoes']
    tiposBase.forEach(tipo => {
      const prenda = prendas.find(p => p.tipo === tipo)
      if (prenda) outfit[tipo] = prenda
    })

    res.json({
      clima,
      outfit_sugerido: outfit,
      total_prendas_encontradas: prendas.length,
      mensaje: Object.keys(outfit).length === 0
        ? 'No tienes prendas en tu inventario que coincidan con el clima de hoy'
        : `Outfit sugerido para ${clima.temperatura}°C en ${clima.ciudad}`
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
}

module.exports = climaController