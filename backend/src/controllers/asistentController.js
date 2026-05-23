const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const asistenteController = {
  async chat(req, res) {
    try {
      const { mensaje, prendas } = req.body;

      if (!mensaje) {
        return res.status(400).json({ message: 'El mensaje es requerido' });
      }

      const contextoPrendas = prendas && prendas.length > 0 
        ? JSON.stringify(prendas, null, 2)
        : "El usuario no tiene prendas registradas en su clóset actualmente.";

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: mensaje,
        config: {
          systemInstruction: `Eres PinWand AI, un asistente de moda personal sofisticado y experto en estilismo. 
          Prioriza siempre sugerir prendas del inventario real del usuario:
          === INVENTARIO DEL CLÓSET DEL USUARIO ===
          ${contextoPrendas}
          ========================================`,
          temperature: 0.7,
        }
      });

      res.json({ respuesta: response.text });

    } catch (error) {
      console.error('Error en Gemini API:', error);
      res.status(500).json({ message: 'Error en el asistente', error: error.message });
    }
  }
};

module.exports = asistenteController;