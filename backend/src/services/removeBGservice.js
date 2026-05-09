const fetch = require('node-fetch');
const FormData = require('form-data');

/**
 * @param {Buffer} imageBuffer - archivo de imagen en memoria
 */
const removeBG = async (imageBuffer) => {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  const url = 'https://api.remove.bg/v1.0/removebg';
  console.log("Tipo de imageBuffer:", typeof imageBuffer);
  console.log("Es Buffer?:", Buffer.isBuffer(imageBuffer));
  console.log("Tamaño:", imageBuffer?.length);

  try {
    const formData = new FormData();
    formData.append('image_file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
      knownLength: imageBuffer.length
    });
    formData.append('size', 'auto');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        ...formData.getHeaders()
      },
      body: formData
    });
    console.log("Status remove.bg:", response.status);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error from remove.bg: ${errorData.errors[0].title}`);
    }
    const imagenSinFondo = await response.buffer();
    return imagenSinFondo;
  } catch (error) {
    console.error('Error en servicio de RemoveBGService:', error.message);
    return null;
  }
};

module.exports = { removeBG };