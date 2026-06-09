const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

const asistenteController = {
  async chat(req, res, next) {
    try {
      const { mensaje, prendas } = req.body;
      console.log("[PinWand] Petición recibida. Mensaje:", mensaje);

      if (!mensaje) {
        return res.status(400).json({ message: 'El mensaje es requerido' });
      }

      const contextoPrendas = prendas && prendas.length > 0 
        ? JSON.stringify(prendas, null, 2)
        : "El usuario no tiene prendas registradas en su clóset actualmente.";

      const systemInstruction = `Eres PinWand AI, un asistente de moda personal sofisticado y experto en estilismo. Por favor, genera la respuesta utilizando únicamente texto plano. No utilices formato Markdown (evita usar asteriscos **, hashtags ###, o guiones para listas). Para separar las ideas y las secciones, utiliza saltos de línea dobles (\n\n) y escribe los títulos en mayúsculas de forma clara."
Prioriza siempre sugerir prendas del inventario real del usuario:
=== INVENTARIO DEL CLÓSET DEL USUARIO ===
${contextoPrendas}
========================================`;

      console.log("[PinWand] Llamando a la API de Google Gemini...");

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: [
          { role: 'user', parts: [{ text: mensaje }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      console.log("[PinWand] ¡Respuesta recibida con éxito!");
      
      const respuestaIA = response.text || 
                          response.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "Lo siento, no pude generar una respuesta.";

      console.log("[PinWand] Enviando respuesta al frontend...");


      return res.json({ respuesta: respuestaIA });

    } catch (error) {
      console.error('[PinWand] Error capturado en el controlador:', error);
      next(error);
    }
  }
};

module.exports = asistenteController;