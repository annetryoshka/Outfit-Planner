require('dotenv').config(); 
const { createClient } = require('@supabase/supabase-js');

// 1. Extraemos las variables (ahora coinciden con tu .env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log("--- Chequeo de Conexión ---");
console.log("URL:", supabaseUrl);
console.log("¿Key detectada?:", supabaseKey ? "SÍ" : "NO");
console.log("---------------------------");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan credenciales en el .env. Revisa SUPABASE_URL y SUPABASE_KEY");
}

// 2. Creamos el cliente
const supabase = createClient(supabaseUrl, supabaseKey);

const uploadToStorage = async (imageBuffer, filename) => {
  try {
    const bucketName = 'ICONPROFILE'; 

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(`${filename}.png`, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Error en Storage:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`${filename}.png`);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error inesperado:', err);
    return null;
  }
};

module.exports = { uploadToStorage };