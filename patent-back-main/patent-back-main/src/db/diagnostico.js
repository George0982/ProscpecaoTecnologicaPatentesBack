import mongoose from 'mongoose'

const DiagnosticoSchema = new mongoose.Schema({
    ni: {
        type: Number,
        required: true
    },
    oferta: {
        type: Object,
        required: false
    },
    plataforma: {
        type: Object,
        required: false
    },
    capturaValor: {
        type: Object,
        required: false
    },
    cadeiaSuprimentos: {
        type: Object,
        required: false
    }
})

export default mongoose.model('Diagnostico', DiagnosticoSchema)
