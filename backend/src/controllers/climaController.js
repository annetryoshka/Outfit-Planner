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
    const user_id = req.usuario.id

    // Mapear clima a temporada
    const temporadaMap = {
      muy_frio: 'invierno',
      frio: 'invierno',
      templado: 'todo el año',
      calido: 'verano',
      caliente: 'verano'
    }

    const temporada = temporadaMap[clima.clasificacion]

    // Buscar prendas del usuario por tipo
    const tipos = ['top', 'bottom', 'outerwear', 'shoes']
    const outfit = {}

    for (const tipo of tipos) {
      const result = await pool.query(
        `SELECT * FROM prendas 
         WHERE user_id = $1 
         AND tipo = $2 
         AND (temporada = $3 OR temporada = 'todo el año' OR temporada IS NULL)
         ORDER BY RANDOM()
         LIMIT 1`,
        [user_id, tipo, temporada]
      )
      if (result.rows.length > 0) {
        outfit[tipo] = result.rows[0]
      }
    }

    // Mensaje según clima
    const mensajes = {
      muy_frio: `¡Hace ${clima.temperatura}°C en ${clima.ciudad}! Abrígate mucho 🧥`,
      frio: `Hace ${clima.temperatura}°C en ${clima.ciudad}, lleva algo de abrigo 🌬️`,
      templado: `Clima perfecto en ${clima.ciudad}, ${clima.temperatura}°C ☀️`,
      calido: `Hace ${clima.temperatura}°C en ${clima.ciudad}, vístete ligero 😎`,
      caliente: `¡Mucho calor en ${clima.ciudad}! ${clima.temperatura}°C 🌡️`
    }

    const tienePrendas = Object.keys(outfit).length > 0

    res.json({
      clima,
      outfit_del_dia: outfit,
      mensaje: mensajes[clima.clasificacion],
      tiene_prendas: tienePrendas,
      consejo: tienePrendas
        ? `Outfit armado con ${Object.keys(outfit).length} prendas de tu inventario`
        : 'No tienes prendas en tu inventario para este clima, añade algunas!'
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
}

module.exports = climaController