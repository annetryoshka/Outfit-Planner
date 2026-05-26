const TryOn = require('../models/TryOn')
const Outfit = require('../models/Outfit')
const Prenda = require('../models/Prenda')
const { uploadToStorage, deleteFromStorage } = require('../services/uploadService')
const { tryOnOutfit } = require('../services/tryonService')

const tryonController = {
    async obtenerMisPruebas(req, res) {
        try {
            const pruebas = await TryOn.findByUser(req.usuario.id)
            res.json(pruebas)
        } catch (error) {
            res.status(500).json({ message:'Error al obtener el historial de pruebas', error: error.message })
        }
    },

    async obtenerPorId(req, res) {
        try {
            const prueba = await TryOn.findById(req.params.id)
            if (!prueba) return res.status(404).json({ message: 'Prueba no encontrada' })
            res.json(prueba)
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener la prueba', error: error.message })
        }
    },

    async eliminar (req, res) {
        try {
            const prueba = await TryOn.findById(req.params.id)
            if (!prueba) return res.status(404).json({ message: 'Prueba no encontrada' });

            if (prueba.imagen_url) {
                await deleteFromStorage(prueba.imagen_url, 'resultados_tryon');
            }
            await TryOn.delete(req.params.id, req.usuario.id)
            res.json({ message: 'Prueba de try-on eliminada' })

        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar la prueba', error: error.message })
        }
    },

    async crearPrueba(req, res) {
        try {
            const { prenda_id } = req.body;
            const personFile = req.file;

            if (!prenda_id) return res.status(400).json({ message: 'Falta el ID de la prenda' });
            if (!personFile) return res.status(400).json({ message: 'Falta la imagen de la persona' });

            const prenda = await Prenda.findById(prenda_id);
            if (!prenda)return res.status(404).json({ message: "La prenda especificada no existe" });

            console.log(`Iniciando prueba para la prenda: ${prenda.nombre}`);

            const tipoLimpio = prenda.tipo?.trim().toLowerCase();
            const categoriaLimpia = prenda.categoria?.trim().toLowerCase();

            if (tipoLimpio === 'calzado' || tipoLimpio === 'accesorio') {
                return res.status(400).json({ 
                    message: `El tipo de prenda '${prenda.tipo}' no es compatible con la prueba virtual de IA.` 
                });
            }
            let segmentationType = 0; // Por defecto: 0 = Upper Body

            if (categoriaLimpia === 'vestido' || categoriaLimpia === 'enterizo' || categoriaLimpia === 'conjunto') {
                segmentationType = 2; // 2 = Full Body 
            } else if (tipoLimpio === 'inferior' || categoriaLimpia === 'pantalon' || categoriaLimpia === 'falda' || categoriaLimpia === 'shorts') {
                segmentationType = 1; // 1 = Lower Body 
            }

            console.log(`Iniciando prueba LightX para: ${prenda.nombre}. Tipo: ${prenda.tipo}, Categoría: ${prenda.categoria} -> SegmentationType asignado: ${segmentationType}`);

            const responseGarment = await fetch(prenda.imagen_url);
            if (!responseGarment.ok) throw new Error("No se pudo descargar la prenda desde Supabase Storage");
            
            const garmentBuffer = Buffer.from(await responseGarment.arrayBuffer());
            const garmentMime = responseGarment.headers.get('content-type') || 'image/jpeg';

            //Llamar al servicio pasándole los dos buffers con sus mimetypes reales y el tipo
            const urlResultadoLightX = await tryOnOutfit(
                personFile.buffer, 
                personFile.mimetype, 
                garmentBuffer, 
                garmentMime, 
                segmentationType
            );

            //Descargar el JPEG final de los servidores de LightX
            const responseFinal = await fetch(urlResultadoLightX);
            const bufferResultado = Buffer.from(await responseFinal.arrayBuffer());
            
            //Subir el resultado final al bucket 
            const nombreArchivo = `try_${req.usuario.id}_${Date.now()}`;
            const urlFinal = await uploadToStorage(bufferResultado, nombreArchivo, 'resultados_tryon', req.usuario.id, 'image/jpeg');

            //Guardar el registro 
            const pruebaGuardada = await TryOn.create({
                user_id: req.usuario.id,
                outfit_id: null, // Queda null por ser prenda individual
                imagen_url: urlFinal, 
                configuracion_prendas: {
                prenda_id: prenda_id,
                tipo_prenda: prenda.tipo
                }
            });

            res.status(200).json({ message: 'Prueba de try-on procesada exitosamente', pruebaGuardada });

        }catch (error) {
            console.error("ERROR DETALLADO EN PROCESAR_PRUEBA:", error);
            res.status(500).json({ message: 'Error al procesar la prueba', error: error.message })
        }
    }
}

module.exports = tryonController