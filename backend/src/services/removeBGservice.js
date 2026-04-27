const fetch = require('node-fetch');

const removeBG = async (imageUrl) => {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  const url = 'https://api.remove.bg/v1.0/removebg';

  try {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json'   
        },
        body: JSON.stringify({
            image_url: imageUrl,
            size: 'auto'
        })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error from remove.bg: ${errorData.errors[0].title}`);
    }
    const imageBuffer = await response.buffer();
    return imageBuffer;
  } catch (error) {
    console.error('Error en servicio de RemoveBGService:', error.message);
    return null;
  }
};

module.exports = { removeBG };