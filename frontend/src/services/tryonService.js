import api from './api'

const tryonService = {
    async obtenerMisPruebas() {
        const res = await api.get('/tryon')
        return res.data
    }, 

    async obtenerPorId(id) {
        const res = await api.get(`/tryon/${id}`)
        return res.data
    },

    async crearPrueba(prenda_id, personFile) {
        const formData = new FormData();
        formData.append('prenda_id', prenda_id);
        formData.append('person', personFile);

        const res = await api.post('/tryon', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return res.data
    },

    async eliminar(id) {
        const res = await api.delete(`/tryon/${id}`)
        return res.data
    }
}

export default tryonService