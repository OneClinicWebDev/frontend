const REGRAS = [
  { prefixo: '/api/agendamentos/', ttl: 15 * 1000 },
  { prefixo: '/api/clientes/', ttl: 2 * 60 * 1000 },
  { prefixo: '/api/colaboradores/', ttl: 2 * 60 * 1000 },
  { prefixo: '/api/pacotes/', ttl: 2 * 60 * 1000 },
  { prefixo: '/api/servicos/', ttl: 5 * 60 * 1000 },
  { prefixo: '/api/modelos-pacote/', ttl: 5 * 60 * 1000 },
  { prefixo: '/api/clinica/atual/', ttl: 5 * 60 * 1000 },
  { prefixo: '/api/auth/perfil/', ttl: 5 * 60 * 1000 },
]

const MAXIMO_ENTRADAS = 100

const entradas = new Map()
const emAndamento = new Map()
let geracao = 0

const clonar = (valor) => {
  if (valor === undefined || valor === null) {
    return valor
  }

  try {
    return structuredClone(valor)
  } catch {
    return JSON.parse(JSON.stringify(valor))
  }
}

const normalizarParametros = (params) => {
  if (!params) {
    return ''
  }

  if (typeof URLSearchParams !== 'undefined' && params instanceof URLSearchParams) {
    return params.toString()
  }

  if (typeof params !== 'object') {
    return String(params)
  }

  return JSON.stringify(
    Object.keys(params)
      .sort()
      .filter((chave) => params[chave] !== undefined && params[chave] !== null)
      .map((chave) => [chave, params[chave]]),
  )
}

const obterRegra = (url) => {
  const caminho = String(url || '').split('?')[0]

  return REGRAS.find((regra) => caminho.startsWith(regra.prefixo)) || null
}

const montarChave = (url, params) => {
  const clinica = localStorage.getItem('clinica_ativa_id') || ''

  return `${clinica}|${url}|${normalizarParametros(params)}`
}

const guardar = (chave, dados, ttl) => {
  entradas.delete(chave)
  entradas.set(chave, { dados, expiraEm: Date.now() + ttl })

  while (entradas.size > MAXIMO_ENTRADAS) {
    entradas.delete(entradas.keys().next().value)
  }
}

export const limparCacheHttp = () => {
  geracao += 1
  entradas.clear()
  emAndamento.clear()
}

export const envolverGetComCache = (instancia) => {
  const getOriginal = instancia.get.bind(instancia)

  instancia.get = (url, config = {}) => {
    const regra = obterRegra(url)

    if (!regra) {
      return getOriginal(url, config)
    }

    const chave = montarChave(url, config.params)
    const ignorarLeitura = config.cache === false

    if (!ignorarLeitura) {
      const entrada = entradas.get(chave)

      if (entrada && entrada.expiraEm > Date.now()) {
        return Promise.resolve({
          data: clonar(entrada.dados),
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: null,
          fromCache: true,
        })
      }

      if (entrada) {
        entradas.delete(chave)
      }

      const pendente = emAndamento.get(chave)

      if (pendente) {
        return pendente.then((resposta) => ({
          ...resposta,
          data: clonar(resposta.data),
        }))
      }
    }

    const geracaoInicial = geracao

    const requisicao = getOriginal(url, config)
      .then((resposta) => {
        if (geracaoInicial === geracao && resposta.status === 200) {
          guardar(chave, clonar(resposta.data), regra.ttl)
        }

        return resposta
      })
      .finally(() => {
        if (emAndamento.get(chave) === requisicao) {
          emAndamento.delete(chave)
        }
      })

    emAndamento.set(chave, requisicao)

    return requisicao
  }

  return instancia
}