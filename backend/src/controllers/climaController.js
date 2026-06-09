const { getClima, getClimaPorCoordenadas } = require('../services/weatherService')
const pool = require('../config/database')

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
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) throw new Error('GEMINI_API_KEY no configurada en .env')

      const { lat, lon } = req.query
      const clima = await getClimaPorCoordenadas(lat, lon)

      const user_id = req.usuario?.id || req.user?.id;
      if (!user_id) {
        return res.status(401).json({ message: 'Falta token de sesión.' });
      }

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
        let decisionIA;
        
        try {
          // 📡 Intento de conectar con Gemini
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    "role": "user", 
                    "parts": [{
                      "text": `Eres el motor de estilismo de PinWand. Tu labor es armar el MEJOR outfit completo posible combinando prendas del clóset del usuario para el clima actual.
                      INVENTARIO DE PRENDAS DISPONIBLES EN LA BASE DE DATOS (Usa estos IDs y tipos reales): ${JSON.stringify(todasLasPrendas)}
                      Clima actual en ${clima.ciudad}: ${clima.temperatura}°C, Clasificación: ${clima.clasificacion}.
                      REGLAS DE ESTILISMO OBLIGATORIAS:
                      1. Un outfit completo DEBE incluir idealmente: una prenda parte superior (tipo: "superior"), una prenda parte inferior (tipo: "inferior") y calzado (tipo: "calzado").
                      2. Como la clasificación es '${clima.clasificacion}', busca y agrega obligatoriamente una prenda de abrigo (tipo: "abrigo" o "exterior") si está disponible.
                      3. Selecciona como MÁXIMO un elemento de cada tipo.
                      REGLA ESTRICTA DE FORMATO: Debes responder ÚNICAMENTE con el objeto JSON puro sin markdown (\`\`\`json).
                      ESTRUCTURA REQUERIDA: {"idsSeleccionados": [1, 4], "consejoEstilo": "Tu consejo corto."}`
                    }]
                  }
                ],
                "generationConfig": { "responseMimeType": "application/json", "temperature": 0.1 }
              })
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Servidor sobrecargado');
          }
          
          const data = await response.json();
          let textoIA = data.candidates[0].content.parts[0].text;
          textoIA = textoIA.replace(/```json/ig, '').replace(/```/g, '').trim();
          decisionIA = JSON.parse(textoIA);

        } catch (geminiError) {
          // 🛡️ EL ESCUDO: Si Gemini está saturado o falla, el backend autogenera la respuesta sin caerse
          console.warn("⚠️ [PinWand Respaldo] Gemini fuera de servicio temporalmente. Armando outfit con algoritmo local.");
          
          const idsSugeridos = [];
          const tiposVistos = new Set();
          
          // Selecciona una prenda de cada tipo que tengas registrada
          todasLasPrendas.forEach(prenda => {
            if (!tiposVistos.has(prenda.tipo)) {
              idsSugeridos.push(prenda.id);
              tiposVistos.add(prenda.tipo);
            }
          });

          decisionIA = {
            idsSeleccionados: idsSugeridos,
            consejoEstilo: "Armamos este outfit equilibrado con tus prendas disponibles mientras el motor de Inteligencia Artificial se reestablece."
          };
        }

        // Procesamos las prendas resultantes (ya sea de Gemini o de nuestro plan de respaldo)
        todasLasPrendas.forEach(prenda => {
          if (decisionIA.idsSeleccionados && decisionIA.idsSeleccionados.includes(prenda.id)) {
            outfit[prenda.tipo] = prenda;
          }
        });
        
        const tienePrendas = Object.keys(outfit).length > 0;

        return res.json({
          clima,
          outfit_del_dia: outfit,
          mensaje: mensajes[clima.clasificacion],
          tiene_prendas: tienePrendas,
          consejo: decisionIA.consejoEstilo
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
      console.error('Error al generar outfit inteligente:', error)
      res.status(500).json({ message: error.message })
    }
  }
}

module.exports = climaController