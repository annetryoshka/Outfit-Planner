const {createClient} = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const uploadToStorage = async (imageBuffer, filename) => {
  const { data, error } = await supabase.storage
    .from('prendas')
    .upload('${filename}.png', imageBuffer, {
        contentType: 'image/png',
        upsert : true
   }); 
   if (error) {
     console.error('Error uploading image:', error.message);
     return null;
   }
   const { data: publicUrl } = supabase.storage.from('prendas').getPublicUrl('${filename}.png');
   return publicUrl.publicUrl;
};

module.exports = { uploadToStorage };