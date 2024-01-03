import mongoose from 'mongoose'

const CompanySchema = new mongoose.Schema({
    user: {
        type: Object,
        required: true
    },
    ni: {
        type: String,
        required: true
    },
    cnaePrincipal: {
        type: Object,
        required: false
    },
    tipoEstabelecimento: {
        type: String,
        required: false
    },
    nomeEmpresarial: {
        type: String,
        required: false
    },
    nomeFantasia: {
        type: String,
        required: false
    },
    correioEletronico: {
        type: String,
        required: false
    },
    capitalSocial: {
        type: String,
        required: false
    },
    porte: {
        type: String,
        required: false
    },
    situacaoEspecial: {
        type: String,
        required: false
    },
    dataSituacaoEspecial: {
        type: String,
        required: false
    },
    dataAbertura: {
        type: String,
        required: false
    }
})

export default mongoose.model('Company', CompanySchema)
