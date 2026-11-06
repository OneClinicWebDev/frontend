import { defineStore } from 'pinia'
import api, { registrarSincronizacaoAuth } from '@/services/api'

const CHAVE_CACHE_SESSAO = 'oneclinic_sessao'
const VERSAO_CACHE_SESSAO = 1
const INTERVALO_REVALIDACAO_MS = 10 * 60 * 1000

let sessaoEmAndamento = null

const obterErro = (error, mensagemPadrao) => {
  const data = error.response?.data

  if (typeof data?.detail === 'string') {
    return data.detail
  }

  if (typeof data?.non_field_errors?.[0] === 'string') {
    return data.non_field_errors[0]
  }

  if (data && typeof data === 'object') {
    const primeiraMensagem = Object.values(data)
      .flat(Infinity)
      .find((valor) => typeof valor === 'string')

    if (primeiraMensagem) {
      return primeiraMensagem
    }
  }

  return mensagemPadrao
}

const removerCacheSessao = () => {
  try {
    localStorage.removeItem(CHAVE_CACHE_SESSAO)
  } catch {
    return
  }
}

const lerCacheSessao = () => {
  try {
    const bruto = localStorage.getItem(CHAVE_CACHE_SESSAO)

    if (!bruto) {
      return null
    }

    const cache = JSON.parse(bruto)

    if (
      !cache ||
      cache.versao !== VERSAO_CACHE_SESSAO ||
      !cache.usuario ||
      typeof cache.usuario !== 'object' ||
      !Array.isArray(cache.vinculos)
    ) {
      return null
    }

    return cache
  } catch {
    return null
  }
}

const gravarCacheSessao = (usuario, vinculos) => {
  try {
    if (!localStorage.getItem('access_token') || !usuario) {
      localStorage.removeItem(CHAVE_CACHE_SESSAO)
      return
    }

    localStorage.setItem(
      CHAVE_CACHE_SESSAO,
      JSON.stringify({
        versao: VERSAO_CACHE_SESSAO,
        usuario,
        vinculos: Array.isArray(vinculos) ? vinculos : [],
      }),
    )
  } catch {
    return
  }
}

const carregarEstadoInicial = () => {
  const token = localStorage.getItem('access_token') || null

  if (!token) {
    removerCacheSessao()
  }

  const cache = token ? lerCacheSessao() : null

  return {
    token,
    refreshToken: localStorage.getItem('refresh_token') || null,
    usuario: cache ? cache.usuario : null,
    vinculos: cache ? cache.vinculos : [],
    clinicaAtivaId: localStorage.getItem('clinica_ativa_id') || null,
    carregandoSessao: false,
    validadaEm: 0,
  }
}

export const useAuthStore = defineStore('auth', {
  state: carregarEstadoInicial,

  getters: {
    autenticado: (state) => Boolean(state.token),

    clinicaAtiva: (state) =>
      state.vinculos.find(
        (vinculo) =>
          String(vinculo.clinica_id) === String(state.clinicaAtivaId),
      ) || null,

    precisaSelecionarClinica: (state) => {
      if (state.vinculos.length <= 1) {
        return false
      }

      return !state.vinculos.some(
        (vinculo) =>
          String(vinculo.clinica_id) === String(state.clinicaAtivaId),
      )
    },

    isAdmin() {
      return this.clinicaAtiva?.role === 'ADMIN'
    },

    role() {
      return this.clinicaAtiva?.role || ''
    },

    colaboradorId() {
      return this.clinicaAtiva?.colaborador_id
        ? String(this.clinicaAtiva.colaborador_id)
        : ''
    },

    podeGerenciar() {
      return ['ADMIN', 'SECRETARIO'].includes(this.role)
    },
  },

  actions: {
    salvarTokens(access, refresh) {
      this.token = access || null
      this.refreshToken = refresh || null

      if (this.token) {
        localStorage.setItem('access_token', this.token)
      } else {
        localStorage.removeItem('access_token')
      }

      if (this.refreshToken) {
        localStorage.setItem('refresh_token', this.refreshToken)
      } else {
        localStorage.removeItem('refresh_token')
      }
    },

    persistirSessao() {
      gravarCacheSessao(this.usuario, this.vinculos)
    },

    precisaRevalidar() {
      return (
        Boolean(this.token) &&
        Date.now() - this.validadaEm > INTERVALO_REVALIDACAO_MS
      )
    },

    definirVinculos(vinculos = []) {
      this.vinculos = Array.isArray(vinculos) ? vinculos : []

      const clinicaSalvaContinuaValida = this.vinculos.some(
        (vinculo) =>
          String(vinculo.clinica_id) === String(this.clinicaAtivaId),
      )

      if (!clinicaSalvaContinuaValida) {
        this.clinicaAtivaId = null
        localStorage.removeItem('clinica_ativa_id')
      }

      if (this.vinculos.length === 1) {
        this.setClinicaAtiva(this.vinculos[0].clinica_id)
      }
    },

    async login(cpf, password) {
      const cpfLimpo = String(cpf || '').replace(/\D/g, '')

      try {
        const response = await api.post('/api/auth/login/', {
          cpf: cpfLimpo,
          password,
        })

        const dados = response.data

        this.clinicaAtivaId = null
        localStorage.removeItem('clinica_ativa_id')

        this.salvarTokens(dados.access, dados.refresh)
        this.usuario = dados.usuario || null
        this.definirVinculos(dados.vinculos || [])
        this.validadaEm = Date.now()
        this.persistirSessao()

        return dados
      } catch (error) {
        throw new Error(
          obterErro(
            error,
            'Não foi possível entrar. Verifique suas credenciais.',
          ),
          { cause: error },
        )
      }
    },

    async restaurarSessao() {
      this.token = localStorage.getItem('access_token') || this.token
      this.refreshToken =
        localStorage.getItem('refresh_token') || this.refreshToken

      if (!this.token) {
        return false
      }

      if (sessaoEmAndamento) {
        return sessaoEmAndamento
      }

      this.carregandoSessao = true

      sessaoEmAndamento = (async () => {
        try {
          const response = await api.get('/api/auth/me/')
          const dados = response.data

          this.usuario = dados.usuario || null
          this.definirVinculos(dados.vinculos || [])
          this.validadaEm = Date.now()
          this.persistirSessao()

          return true
        } catch (error) {
          if (!localStorage.getItem('access_token')) {
            this.limparSessao()
            return false
          }

          const status = error.response?.status
          const falhaTransitoria = !error.response || status >= 500

          if (this.usuario && falhaTransitoria) {
            this.validadaEm = Date.now()
            return true
          }

          return false
        } finally {
          this.carregandoSessao = false
          sessaoEmAndamento = null
        }
      })()

      return sessaoEmAndamento
    },

    atualizarUsuario(dados = {}) {
      this.usuario = {
        ...(this.usuario || {}),
        nome: dados.nome_completo ?? this.usuario?.nome ?? '',
        data_nascimento:
          dados.data_nascimento ?? this.usuario?.data_nascimento ?? '',
        telefone: dados.telefone ?? this.usuario?.telefone ?? '',
      }

      this.persistirSessao()
    },

    atualizarClinicaAtiva(dados = {}) {
      this.vinculos = this.vinculos.map((vinculo) =>
        String(vinculo.clinica_id) === String(this.clinicaAtivaId)
          ? {
              ...vinculo,
              clinica_nome: dados.nome_fantasia ?? vinculo.clinica_nome,
              profissionais_podem_editar_agenda:
                dados.profissionais_podem_editar_agenda ??
                vinculo.profissionais_podem_editar_agenda,
            }
          : vinculo,
      )

      this.persistirSessao()
    },

    setClinicaAtiva(clinicaId) {
      const vinculo = this.vinculos.find(
        (item) => String(item.clinica_id) === String(clinicaId),
      )

      if (!vinculo) {
        throw new Error('Você não possui vínculo ativo com essa clínica.')
      }

      this.clinicaAtivaId = String(vinculo.clinica_id)
      localStorage.setItem('clinica_ativa_id', this.clinicaAtivaId)

      return vinculo
    },

    async criarClinica(dados) {
      const payload = {
        ...dados,
        cpf: String(dados.cpf || '').replace(/\D/g, ''),
        cnpj: String(dados.cnpj || '').replace(/\D/g, ''),
        telefone: String(dados.telefone || '').replace(/\D/g, ''),
        profissionais_podem_editar_agenda: Boolean(
          dados.profissionais_podem_editar_agenda,
        ),
      }

      try {
        const response = await api.post(
          '/api/auth/criar-clinica/',
          payload,
        )

        return response.data
      } catch (error) {
        throw new Error(
          obterErro(
            error,
            'Não foi possível criar a clínica. Verifique os dados.',
          ),
          { cause: error },
        )
      }
    },

    limparSessao() {
      this.token = null
      this.refreshToken = null
      this.usuario = null
      this.vinculos = []
      this.clinicaAtivaId = null
      this.carregandoSessao = false
      this.validadaEm = 0

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('clinica_ativa_id')
      removerCacheSessao()
    },

    async logout() {
      const refresh =
        localStorage.getItem('refresh_token') || this.refreshToken
      const possuiSessao = Boolean(
        localStorage.getItem('access_token') || this.token,
      )

      try {
        if (possuiSessao && refresh) {
          await api.post('/api/auth/logout/', { refresh })
        }
      } catch {
      } finally {
        this.limparSessao()
      }
    },
  },
})

registrarSincronizacaoAuth({
  sincronizarToken(access) {
    const auth = useAuthStore()
    auth.token = access
  },

  limparStore() {
    const auth = useAuthStore()
    auth.limparSessao()
  },
})