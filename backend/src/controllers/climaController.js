const { getClima, getClimaPorCoordenadas } = require('../services/weatherService')
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

      const temporadaMap = {
        muy_frio: 'invierno',
        frio: 'invierno',
        templado: 'todo el año',
        calido: 'verano',
        caliente: 'verano'
      }

      const temporada = temporadaMap[clima.clasificacion]

      const result = await pool.query(
        `SELECT * FROM prendas 
         WHERE user_id = $1 
         AND (temporada = $2 OR temporada = 'todo el año' OR temporada IS NULL)`,
        [user_id, temporada]
      )

      const todasLasPrendas = result.rows
      const outfit = {}

      const mensajes = {
        muy_frio: `¡Hace ${clima.temperatura}°C en ${clima.ciudad}! Abrígate mucho 🧥`,
        frio: `Hace ${clima.temperatura}°C en ${clima.ciudad}, lleva algo de abrigo 🌬️`,
        templado: `Clima perfecto en ${clima.ciudad}, ${clima.temperatura}°C ☀️`,
        calido: `Hace ${clima.temperatura}°C en ${clima.ciudad}, vístete ligero 😎`,
        caliente: `¡Mucho calor en ${clima.ciudad}! ${clima.temperatura}°C 🌡️`
      }

      if (todasLasPrendas.length > 0) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Clima actual en ${clima.ciudad}: ${clima.temperatura}°C, Clasificación: ${clima.clasificacion}.`,
          config: {
            systemInstruction: `Eres el motor de estilismo de PinWand. Tu labor es armar el mejor outfit combinando prendas del clóset del usuario para el clima actual.
            Debes intentar seleccionar máximo un elemento de cada tipo ('top', 'bottom', 'outerwear', 'shoes') si están disponibles, buscando que los colores y texturas hagan armonía visual.

            INVENTARIO DE PRENDAS DISPONIBLES EN LA BASE DE DATOS:
            ${JSON.stringify(todasLasPrendas)}

            DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON con la siguiente estructura, sin textos extras ni markdown:
            {
              "idsSeleccionados": [1, 4, 7],
              "consejoEstilo": "Tu consejo de por qué combinan de forma linda estas prendas específicas."
            }`,
            responseMimeType: "application/json"
          }
        });

        const decisionIA = JSON.parse(response.text);
        
        todasLasPrendas.forEach(prenda => {
          if (decisionIA.idsSeleccionados.includes(prenda.id)) {
            outfit[prenda.tipo] = prenda;
          }
        });

        const tienePrendas = Object.keys(outfit).length > 0

        return res.json({
          clima,
          outfit_del_dia: outfit,
          mensaje: mensajes[clima.clasificacion],
          tiene_prendas: tienePrendas,
          consejo: decisionIA.consejoEstilo || `Outfit armado con ${Object.keys(outfit).length} prendas de tu inventario`
        });
      }


      res.json({
        clima,
        outfit_del_dia: {},
        mensaje: mensajes[clima.clasificacion],
        tiene_prendas: false,
        consejo: 'No tienes prendas en tu inventario para este clima, añade algunas!'
      })

    } catch (error) {
      console.error('Error al generar outfit inteligente:', error);
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = climaController