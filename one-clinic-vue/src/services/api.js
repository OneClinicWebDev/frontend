import axios from 'axios'
import { envolverGetComCache, limparCacheHttp } from '@/services/cacheHttp'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
})

envolverGetComCache(api)

const rotasSemAutenticacao = [
  '/api/auth/login/',
  '/api/auth/criar-clinica/',
  '/api/token/',
]

const metodosDeLeitura = ['get', 'head', 'options']

let renovacaoEmAndamento = null
let sincronizarToken = null
let limparStore = null

export { limparCacheHttp }

export const registrarSincronizacaoAuth = (callbacks) => {
  sincronizarToken = callbacks?.sincronizarToken || null
  limparStore = callbacks?.limparStore || null
}

const ehRotaSemAutenticacao = (url = '') =>
  rotasSemAutenticacao.some((rota) => url.includes(rota))

const ehEscrita = (config) =>
  !metodosDeLeitura.includes(String(config?.method || 'get').toLowerCase())

const limparAutenticacao = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('clinica_ativa_id')

  limparCacheHttp()

  if (limparStore) {
    limparStore()
  } else {
    window.dispatchEvent(new CustomEvent('sessao-expirada'))
  }
}

api.interceptors.request.use(
  (config) => {
    const url = config.url || ''

    if (ehRotaSemAutenticacao(url)) {
      delete config.headers.Authorization
      delete config.headers['X-Clinica-ID']
      return config
    }

    const token = localStorage.getItem('access_token')
    const clinicaId = localStorage.getItem('clinica_ativa_id')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (clinicaId) {
      config.headers['X-Clinica-ID'] = clinicaId
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => {
    if (ehEscrita(response.config)) {
      limparCacheHttp()
    }

    return response
  },
  async (error) => {
    const requestOriginal = error.config
    const url = requestOriginal?.url || ''

    if (ehEscrita(requestOriginal)) {
      limparCacheHttp()
    }

    if (
      error.response?.status !== 401 ||
      !requestOriginal ||
      requestOriginal._retry ||
      requestOriginal.skipAuthRefresh ||
      url.includes('/api/auth/login/') ||
      url.includes('/api/auth/criar-clinica/') ||
      url.includes('/api/token/refresh/') ||
      url.includes('/api/auth/logout/')
    ) {
      return Promise.reject(error)
    }

    const refresh = localStorage.getItem('refresh_token')

    if (!refresh) {
      limparAutenticacao()
      return Promise.reject(error)
    }

    requestOriginal._retry = true

    try {
      if (!renovacaoEmAndamento) {
        renovacaoEmAndamento = axios.post(
          `${api.defaults.baseURL}/api/token/refresh/`,
          { refresh },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ).then((response) => {
          const novoAccess = response.data?.access

          if (!novoAccess) {
            throw new Error('A API não retornou um novo access token.')
          }

          localStorage.setItem('access_token', novoAccess)

          if (sincronizarToken) {
            sincronizarToken(novoAccess)
          }

          return novoAccess
        }).finally(() => {
          renovacaoEmAndamento = null
        })
      }

      const novoAccess = await renovacaoEmAndamento

      requestOriginal.headers = requestOriginal.headers || {}
      requestOriginal.headers.Authorization = `Bearer ${novoAccess}`

      return api(requestOriginal)
    } catch (erroRenovacao) {
      limparAutenticacao()
      return Promise.reject(erroRenovacao)
    }
  },
)

export default api