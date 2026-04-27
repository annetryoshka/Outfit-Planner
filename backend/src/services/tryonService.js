const {Client} = require('@gradio/client')
const { uploadToStorage } = require('./uploadService')

const tryOnOutfit = async (topGarmentUrl, lowerGarmentUrl = null) => {
  try {
    const app = await Client.connect('HumanAIGC/OutfitAnyone')
    const responseTop = await fetch(topUrl);
    const topBlob = await responseTop.blob();

    const responseBottom = await fetch(bottomUrl);
    const bottomBlob = await responseBottom.blob();

    const result = await client.predict("/get_tryon_result", {
            model_name: topBlob,
            garment1: topBlob, 
            garment2: bottomBlob,
        });

    const outputImage = result.data[0].url;

    const resIA = await fetch(outputImage);
    const buffer = Buffer.from(await resIA.arrayBuffer());
        
    const urlFinal = await uploadToStorage(buffer, `tryon_${Date.now()}`, 'resultados-tryon');

    return urlFinal;

  } catch (error) {
      console.error('Error in tryOnOutfit:', error.message);
      throw error;
  }
};

module.exports = { tryOnOutfit };
