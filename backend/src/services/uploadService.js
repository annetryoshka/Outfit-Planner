const {createClient} = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const uploadToStorage = async (imageBuffer, filename, bucketName, userId, mimetype) => {
  try {
    const extensionMap = {
      'image/jpeg': 'jpg',
      'image/jpg':  'jpg',
      'image/png':  'png',
      'image/jfif': 'jpg',
    };
    const extension = extensionMap[mimetype] || 'png';
    const filePath = `${userId}/${filename}.${extension}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, imageBuffer, {
        contentType: mimetype,
        upsert: true
      });

    if (error) {
      console.error(`Error al subir imagen a ${bucketName}:`, error.message);
      return null;
    }
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;

  } catch (err) {
    console.error('Error inesperado en uploadToStorage:', err.message);
    return null;
  }
};

const deleteFromStorage = async (imageUrl, bucketName) => {
  try {
    const urlParts = imageUrl.split(`/object/public/${bucketName}/`);
    if (!urlParts[1]) {
      console.error('No se pudo extraer el path de la URL');
      return false;
    }
    const filePath = decodeURIComponent(urlParts[1]);

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error(`Error al eliminar imagen de ${bucketName}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error inesperado en deleteFromStorage:', err.message);
    return false;
  }
};

module.exports = { uploadToStorage, deleteFromStorage };