const {Client} = require('@gradio/client')
const LIGHTX_API_KEY = process.env.LIGHTX_API_KEY

// STEP 1 
const uploadToLightX = async (fileBuffer, mimeType) => {
  try {
    const requestUrl = 'https://api.lightxeditor.com/external/api/v2/uploadImageUrl';
    const registerResponse = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LIGHTX_API_KEY
      },
      body: JSON.stringify({
        uploadType: "imageUrl",
        size: fileBuffer.length, 
        contentType: mimeType
      })
    });

    if (!registerResponse.ok) throw new Error(`Error registrando imagen en LightX: ${registerResponse.status}`);
    const registerData = await registerResponse.json();
    
    const { uploadImage, imageUrl } = registerData.body;

    // Hacer el PUT binario obligatorio STEP 1.1
    const putResponse = await fetch(uploadImage, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: fileBuffer
    });

    if (!putResponse.ok) throw new Error(`Error en el PUT binario: ${putResponse.status}`);

    return imageUrl;
  } catch (error) {
    console.error("Error en uploadToLightX:", error.message);
    throw error;
  }
};

const tryOnOutfit = async (personBuffer, personMime, garmentBuffer, garmentMime, segmentationType) => {
  try {
    console.log("Subiendo imágenes obligatorias a los servidores de LightX...");
    const personLightXUrl = await uploadToLightX(personBuffer, personMime);
    const garmentLightXUrl = await uploadToLightX(garmentBuffer, garmentMime);

    // STEP 2: Crear la orden de Try-On
    console.log("Iniciando orden de Try-On en LightX...");
    const tryonUrl = 'https://api.lightxeditor.com/external/api/v2/aivirtualtryon';
    const tryonResponse = await fetch(tryonUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LIGHTX_API_KEY
      },
      body: JSON.stringify({
        imageUrl: personLightXUrl,
        outfitImageUrl: garmentLightXUrl,
        segmentationType: segmentationType // 0 = Superior, 1 = Inferior (Dinámico)
      })
    });

    if (!tryonResponse.ok) throw new Error(`Error al crear orden en LightX: ${tryonResponse.status}`);
    const tryonData = await tryonResponse.json();
    
    const { orderId } = tryonData.body;
    console.log(`Orden creada con ID: ${orderId}. Verificando estado...`);

    // STEP 2.1: Sistema de Check Status (Polling de hasta 5 intentos cada 3 segundos)
    const statusUrl = 'https://api.lightxeditor.com/external/api/v2/order-status';
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
      // Esperar 3 segundos obligatorios antes de preguntar
      await new Promise(resolve => setTimeout(resolve, 3000));
      retries++;
      console.log(`Intento de verificación #${retries}...`);

      const statusResponse = await fetch(statusUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LIGHTX_API_KEY
        },
        body: JSON.stringify({ orderId })
      });

      if (!statusResponse.ok) continue; // Si falla la red, reintentar
      const statusData = await statusResponse.json();
      const { status, output } = statusData.body;

      if (status === 'active') {
        console.log("¡Procesamiento exitoso en LightX!");
        return output; // Retorna la URL final del JPEG generado
      }

      if (status === 'failed') {
        throw new Error("La IA de LightX falló al procesar las prendas.");
      }
    }

    throw new Error("Se agotó el tiempo de espera (15s) de LightX sin respuesta activa.");

  } catch (error) {
    console.error('Error en servicio LightX:', error.message);
    throw error;
  }
};

module.exports = { tryOnOutfit };