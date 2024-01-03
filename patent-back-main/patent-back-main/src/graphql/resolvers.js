const { stringify } = require('querystring')
const axios = require('axios')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
var ObjectId = require('mongodb').ObjectId



/* -------------------------------------------------------------------------- */
/*                                 Gerar token                                */
/* -------------------------------------------------------------------------- */
function generateToken (params = {}) {
  return jwt.sign(
    params,
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )
}

/* -------------------------------------------------------------------------- */
/*                                Validar token                               */
/* -------------------------------------------------------------------------- */
function validateToken (ctx) {
  const authHeader = ctx.request.headers.authorization;

  if (!authHeader)
    throw new Error('No token provided!')

  const parts = authHeader.split(' ');

  if (parts.length !== 2)
    throw new Error('Token error!')

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme))
    throw new Error('Token malformatted!')

  let id

  jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
    if (err) throw new Error('Token invalid!')
    id = decode.id
  })

  return id
}

/* -------------------------------------------------------------------------- */
/*                                 Token cnpj                                 */
/* -------------------------------------------------------------------------- */
function tokenCnpj () {

    const data = stringify({
        'grant_type': 'client_credentials'
    })

    return axios.post('https://gateway.apiserpro.serpro.gov.br/token?grand_type=client_credential', 
        data,
        {
            headers: {
                'Content-Type': '#################',
                'Authorization': '###################' 
            }
        }
    )
    .then((response) => {
        return response.data
    })
    .catch((err) => {
        return err
    })
}

/* -------------------------------------------------------------------------- */
/*                                  Token ops                                 */
/* -------------------------------------------------------------------------- */
function tokenOps () {

    const data = stringify({
        'grant_type': 'client_credentials'
    })

    return axios.post('https://ops.epo.org/3.2/auth/accesstoken', 
        data,
        {
            headers: {
                'Content-Type': '############',
                'Authorization': '####################' 
            }
        }
    )
    .then((response) => {
        return response.data
    })
    .catch((err) => {
        return err
    })
}

/* -------------------------------------------------------------------------- */
/*                              Detalhes patente                              */
/* -------------------------------------------------------------------------- */
async function detailsPatente (el){

    const data = el['exchange-document']

    const applicationReferenceCountry = data['bibliographic-data']["application-reference"]["document-id"][0].country.$
    const applicationReferenceDocNumber = data['bibliographic-data']["application-reference"]["document-id"][0]['doc-number'].$
    const applicationReferenceKind = data['bibliographic-data']["application-reference"]["document-id"][0].kind.$

    const applicationReference = `${applicationReferenceCountry}${applicationReferenceDocNumber}${applicationReferenceKind}`
    
    const inventors = data['bibliographic-data'].parties.inventors && data['bibliographic-data'].parties.inventors.inventor[0] ? data['bibliographic-data'].parties.inventors.inventor[0]["inventor-name"].name.$ : null

    const applicant = data['bibliographic-data'].parties.applicants && data['bibliographic-data'].parties.applicants.applicant && data['bibliographic-data'].parties.applicants.applicant[0] ? data['bibliographic-data'].parties.applicants.applicant[0]['applicant-name'].name.$ : null

    const inventionTitle = data['bibliographic-data']["invention-title"].$ ? data['bibliographic-data']["invention-title"].$ : data['bibliographic-data']["invention-title"][0].$

    const docId = data['bibliographic-data']['publication-reference']['document-id'].map((item) => {
        return {
            'documentIdType': item['@document-id-type'] || null,
            country: item.country && item.country.$ ? item.country.$ : null,
            'docNumber': item['doc-number'] && item['doc-number'].$ ? item['doc-number'].$ : null,
            kind: item.kind && item.kind.$ ? item.kind.$ : null,
            date: item.date && item.date.$ ? item.date.$ : null
        }
    })


    return {
        applicationReference: applicationReference ? applicationReference : null,
        inventor: inventors ? inventors : null,
        applicant: applicant ? applicant : null,
        country: data['@country'] ? data['@country'] : null,
        docNumber: data['@doc-number'] ? data['@doc-number'] : null,
        kind: data['@kind'] ? data['@kind'] : null,
        bibliographicData: {
            documentId: docId ? docId : null
        },
        abstract: {
            lang: data.abstract && data.abstract['@lang'] ? data.abstract['@lang'] : null,
            p: data.abstract && data.abstract.p && data.abstract.p.$ ? data.abstract.p.$ : null
        },
        inventionTitle: inventionTitle ? inventionTitle : null,
        link: `https://worldwide.espacenet.com/patent/search?q=pn%3D${data['@country']}${data['@doc-number']}${data['@kind']}`
    }
}


export default {
  Query: {

    /* -------------------------------------------------------------------------- */
    /*                              Usuario detalhes                              */
    /* -------------------------------------------------------------------------- */
    async me (_, args, ctx) {
        const id = validateToken(ctx)

        const Company = await ctx.models.Company.findOne({ "user._id" : ObjectId(id)})
        const User = await ctx.models.User.findById(id)
        
        return {
            email: User.email,
            firstName: User.firstName,
            lastName: User.lastName,
            phone: User.phone,
            createdAt: User.createdAt,
            company: Company ? {
                ni: Company.ni,
                cnaePrincipal: Company.cnaePrincipal,
                tipoEstabelecimento: Company.tipoEstabelecimento,
                nomeEmpresarial: Company.nomeEmpresarial,
                nomeFantasia: Company.nomeFantasia,
                correioEletronico: Company.correioEletronico,
                capitalSocial: Company.capitalSocial,
                porte: Company.porte,
                situacaoEspecial: Company.situacaoEspecial,
                dataSituacaoEspecial: Company.dataSituacaoEspecial,
                dataAbertura: Company.dataAbertura
            } : null
        }
    },

    /* -------------------------------------------------------------------------- */
    /*                             Lista diagnosticos                             */
    /* -------------------------------------------------------------------------- */
    listDiagnosticos: async (parent, args, ctx) => {
        validateToken(ctx)

        /* --------------------------------- Oferta --------------------------------- */
        const oferta = [
            "A empresa agrega periodicamente novos produtos ou serviços?",
            "Existe um núcleo responsável por discutir periodicamente o desenvolvimento de oferta para o mercado?",
            "A avaliação das ofertas é feita de forma sistêmica?"
        ]
       
       /* ------------------------------- Plataforma ------------------------------- */
       const plataforma = [
            "A operação é analisada periodicamente, buscando padronizar os meios e materiais?",
            "A empresa tem ofertas enquadrada com uso de plataforma em algum produto ou serviço?",
            "A empresa usa alguma forma sistêmica de controle em plataforma?"
       ]
       
       /* ---------------------------- Captura de Valor ---------------------------- */
       const capturaValor = [
            "Possui produtos ou serviços que tiveram o resultado financeiro substancialmente superior por resultar da capacidade de criação da empresa?",
            "Gera receita com a adoção de ideias que são agregadas às ofertas e promovem ampliação sistêmica dos valores captados?",
            "Busca meios de criação de novas receitas por meio de inovação?"
       ]
       
       /* -------------------------- Cadeia de Suprimentos ------------------------- */
       const cadeiaSuprimentos = [
            "A empresa possui cadastro e controle de fornecedores? Existe interação sistêmica com os fornecedores?",
            "A empresa terceiriza produtos, serviços ou processos no cotidiano da empresa?",
            "A empresa mantém um canal aberto de sugestões e captação de novos fornecedores de produtos, serviços e soluções?"
       ]

        return {
            oferta,
            plataforma,
            capturaValor,
            cadeiaSuprimentos
        };
    },

    diagnostico: async (parent, args, ctx) => {
        const id = validateToken(ctx)

        const Company = await ctx.models.Company.findOne({ "user._id" : ObjectId(id)}).ni

        const Diagnostico  = await ctx.models.Diagnostico.findOne({ Company })

        return Diagnostico
    },

    /* -------------------------------------------------------------------------- */
    /*                               empresa                                      */
    /* -------------------------------------------------------------------------- */
    company: async (parent, args, ctx) => {
        const id = validateToken(ctx)


        const Company = await ctx.models.Company.findOne({ "user._id" : ObjectId(id)})

        return Company;
    },

    /* -------------------------------------------------------------------------- */
    /*                                Search Serpro                               */
    /* -------------------------------------------------------------------------- */
    companySerpro: async (parent, { ni }, ctx) => {

        const token = await tokenCnpj()

        const id = validateToken(ctx)

        const CompanyUser = await ctx.models.Company.findOne({ "user._id" : ObjectId(id)})
  
        if (CompanyUser) {
            throw new Error('Usuário possui CNPJ cadastrado. Não é possivel realizar pesquisa');
        }

        //- Validar quantidade
        const niQtd = ni.split('.').join("").replace('-', '').replace('/', '')

        if (niQtd.length > 14 || niQtd.length < 14) {
            throw new Error('CNPJ Inválido, é necessário 14 dígitos');
        }

        return axios.get(`https://gateway.apiserpro.serpro.gov.br/consulta-cnpj-df/v2/empresa/${niQtd}`, {
            headers: {
                'Accept': '#########',
                'Authorization': `##############`
            }
        })
        .then((resp) => {
            return resp.data
        })
        .catch((err) => {
            throw new Error(`CNPJ ${ni} inválido`);
        })
    },

    /* -------------------------------------------------------------------------- */
    /*                            Lista de patente ops                            */
    /* -------------------------------------------------------------------------- */
    listPatentOps: async (parent, args, ctx) => {
        validateToken(ctx)
        
        const token = await tokenOps()

        const resp = await axios.get(`http://ops.epo.org/rest-services/published-data/search/biblio`, {
            params: {
                q: args.q,
                range: args.range
            },
            headers: {
                'Accept': '#########',
                'Authorization': `##############`
            }
        }).catch((err) => {
            // console.log(xmlParser.toJson(err.response.data.fault.message));
            return null
        })


        if(resp && resp.data && resp.data['ops:world-patent-data'] && resp.data['ops:world-patent-data']['ops:biblio-search']) {    
            const total = resp.data['ops:world-patent-data']['ops:biblio-search']['@total-result-count'] 
            const data = resp.data['ops:world-patent-data']['ops:biblio-search']['ops:search-result']['exchange-documents']
        
            const patents = await Promise.all(data.map(async (el) => {
                return await detailsPatente(el)
            }))

            return {
                total: total > 2000 ? 2000 : total,
                list: patents
            }
        } else {
            return null
        }
    }
  },

  Mutation: {

    /* -------------------------------------------------------------------------- */
    /*                                   signup                                   */
    /* -------------------------------------------------------------------------- */
    async signup (_, { email, password, firstName, lastName, phone }, { models }) {
        const userVerify = await models.User.findOne({ email })
        
        if (userVerify) {
            throw new Error('E-mail já existe')
        }

        const user = await models.User.create({
            email,
            password: await bcrypt.hash(password, #####),
            firstName,
            lastName,
            phone
        })

        return generateToken({ id: user.id })
    },

    /* -------------------------------------------------------------------------- */
    /*                                    login                                   */
    /* -------------------------------------------------------------------------- */
    async login (_, { email, password }, ctx) {
        const user = await ctx.models.User.findOne({ email })
        if (!user) {
          throw new Error('Nenhum usuário com esse e-mail')
        }
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
          throw new Error('Senha incorreta')
        }
        
        const token = generateToken({ id: user.id })

        const Company = await ctx.models.Company.findOne({ "user._id" : ObjectId(user.id)})

        const Diagnostico = await ctx.models.Diagnostico.findOne({ "ni" : Company.ni})
        
        return {
            token: token,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            company: Company ? true : false,
            diagnostico: Diagnostico ? true : false
        }
    },

    /* -------------------------------------------------------------------------- */
    /*                                Criar company                               */
    /* -------------------------------------------------------------------------- */
    createCompany: async (parent, { 
        ni,
        cnaePrincipal,
        tipoEstabelecimento,
        nomeEmpresarial,
        nomeFantasia,
        correioEletronico,
        capitalSocial,
        porte,
        situacaoEspecial,
        dataSituacaoEspecial,
        dataAbertura
    }, ctx) => {
        const id = validateToken(ctx)
        const user = await ctx.models.User.findById(id)

        const CompanyUser = await ctx.models.Company.findOne({ "user._id" : ObjectId(id)})
        const Company = await ctx.models.Company.findOne({ ni })
  
        if (CompanyUser) {
            throw new Error('Usuário possui CNPJ cadastrado.');
        }

        if (Company) {
            throw new Error('CNPJ já vinculado a uma empresa.');
        }
  
        // save company
        const newCompany = await ctx.models.Company.create({
            user: {
                ...user
            },
            ni,
            cnaePrincipal,
            tipoEstabelecimento,
            nomeEmpresarial,
            nomeFantasia,
            correioEletronico,
            capitalSocial,
            porte,
            situacaoEspecial,
            dataSituacaoEspecial,
            dataAbertura
        })

        return newCompany
  
      },

      /* -------------------------------------------------------------------------- */
      /*                              Criar Diagnostico                             */
      /* -------------------------------------------------------------------------- */
      createDiagnostico: async (parent, { 
        oferta,
        plataforma,
        capturaValor,
        cadeiaSuprimentos
    }, ctx) => {
        const id = validateToken(ctx)

        const Company = await ctx.models.Company.findOne({ "user._id" : ObjectId(id)})

        const Ni = await ctx.models.Diagnostico.findOne({ "ni" : Company.ni})

        if (Ni) {
            throw new Error('Empresa já possui diagnóstico cadastrado.');
        }

  
        const Diagnostico = await ctx.models.Diagnostico.create({
            ni: Company.ni,
            oferta,
            plataforma,
            capturaValor,
            cadeiaSuprimentos
        })

        return Diagnostico
  
      }
  }
}
