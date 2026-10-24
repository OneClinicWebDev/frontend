
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

const rotasSemAutenticacao = [
  '/api/auth/login/',
  '/api/auth/criar-clinica/',
  '/api/token/',
]

api.interceptors.request.use(
  (config) => {
    const url = config.url || ''
    const rotaPublica = rotasSemAutenticacao.some((rota) =>
      url.includes(rota),
    )

    if (rotaPublica) {
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

let renovacaoEmAndamento = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestOriginal = error.config

    if (
      error.response?.status !== 401 ||
      !requestOriginal ||
      requestOriginal._retry ||
      requestOriginal.url?.includes('/api/auth/login/') ||
      requestOriginal.url?.includes('/api/auth/criar-clinica/') ||
      requestOriginal.url?.includes('/api/token/refresh/') ||
      requestOriginal.url?.includes('/api/auth/logout/')
    ) {
      return Promise.reject(error)
    }

    const refresh = localStorage.getItem('refresh_token')

    if (!refresh) {
      return Promise.reject(error)
    }

    requestOriginal._retry = true

    try {
      if (!renovacaoEmAndamento) {
        renovacaoEmAndamento = axios
          .post(
            `${api.defaults.baseURL}/api/token/refresh/`,
            { refresh },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .then((response) => {
            const novoAccess = response.data.access

            if (!novoAccess) {
              throw new Error('A API não retornou um novo access token.')
            }

            localStorage.setItem('access_token', novoAccess)

            return novoAccess
          })
          .finally(() => {
            renovacaoEmAndamento = null
          })
      }

      const novoAccess = await renovacaoEmAndamento

      requestOriginal.headers = requestOriginal.headers || {}
      requestOriginal.headers.Authorization = `Bearer ${novoAccess}`

      return api(requestOriginal)
    } catch (erroRenovacao) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('clinica_ativa_id')

      return Promise.reject(erroRenovacao)
    }
  },
)

export default api
