require('dotenv').config(); 
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Función UNIFICADA: Sirve para ICONPROFILE y para prendas
 */
const uploadToStorage = async (imageBuffer, filename, bucketName = 'ICONPROFILE', userId = null, mimetype = 'image/png') => {
  try {
    const extensionMap = {
      'image/jpeg': 'jpg',
      'image/png':  'png',
      'image/jfif': 'jpg',
    };
    const extension = extensionMap[mimetype] || 'png';
    
    // Si hay userId lo mete en carpeta, si no, directo al bucket
    const filePath = userId ? `${userId}/${filename}.${extension}` : `${filename}.${extension}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, imageBuffer, {
        contentType: mimetype,
        upsert: true
      });

    if (error) {
      console.error(`Error en Storage (${bucketName}):`, error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error inesperado:', err.message);
    return null;
  }
};

const deleteFromStorage = async (imageUrl, bucketName) => {
  try {
    const urlParts = imageUrl.split(`/object/public/${bucketName}/`);
    const filePath = decodeURIComponent(urlParts[1]);
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);
    return !error;
  } catch (err) {
    return false;
  }
};

module.exports = { uploadToStorage, deleteFromStorage };