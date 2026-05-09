const multer = require('multer');
const path = require('path');
// memoryStorage guarda el archivo en RAM como Buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/jfif',
    'image/pjpeg',
    'application/octet-stream'
  ];

  // Si viene como octet-stream verificar por extensión del archivo
  if (file.mimetype === 'application/octet-stream') {
    const ext = path.extname(file.originalname).toLowerCase();
    const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.jfif'];

    if (extensionesPermitidas.includes(ext)) {
      // Corregir el mimetype manualmente
      file.mimetype = ext === '.jfif' ? 'image/jpeg' : `image/${ext.replace('.', '')}`;
      return cb(null, true);
    } else {
      return cb(new Error(`Extensión no permitida: ${ext}. Solo JPG, PNG o JFIF`), false);
    }
  }

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Formato no permitido: ${file.mimetype}. Solo se aceptan JPG, PNG o JFIF`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

module.exports = upload;