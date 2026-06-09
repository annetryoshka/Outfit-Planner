const outfitInteligente = async (lat, lon) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/clima/outfit-inteligente?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {

    console.warn("[PinWand Shield] El backend falló o Gemini está saturado. Usando outfit de respaldo.");

    return {
      clima: { 
        temperatura: 13, 
        ciudad: 'La Paz', 
        condicion: 'Nublado', 
        clasificacion: 'frio' 
      },
      outfit_del_dia: {},
      mensaje: "Hace 13°C en La Paz, lleva algo de abrigo",
      tiene_prendas: false,
      consejo: 'Añade más prendas a tu armario virtual para generar combinaciones con IA.'
    };
  }
};