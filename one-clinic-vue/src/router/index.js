import { createRouter, createWebHistory } from 'vue-router'
import Home from '../assets/pages/Home/Home.vue'
import { useAuthStore } from '@/store/auth'

const carregadores = {
  SystemLayout: () => import('../assets/layouts/SystemLayout.vue'),
  Dashboard: () => import('../assets/pages/Dashboard/Dashboard.vue'),
  Agenda: () => import('../assets/pages/Agenda/Agenda.vue'),
  Atendimentos: () => import('../assets/pages/Atendimentos/Atendimentos.vue'),
  Clientes: () => import('../assets/pages/Clientes/Clientes.vue'),
  Estoque: () => import('../assets/pages/Estoque/Estoque.vue'),
  Financeiro: () => import('../assets/pages/Financeiro/Financeiro.vue'),
  Colaboradores: () => import('../assets/pages/Colaboradores/Colaboradores.vue'),
  PacotesProcedimentos: () =>
    import('../assets/pages/PacotesProcedimentos/PacotesProcedimentos.vue'),
  ConfiguracoesClinica: () =>
    import('../assets/pages/Configuracoes/ConfiguracoesClinica.vue'),
  MeuPerfil: () => import('../assets/pages/Perfil/MeuPerfil.vue'),
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/app',
    component: carregadores.SystemLayout,
    meta: { requiresAuth: true },
    redirect: { name: 'Dashboard' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: carregadores.Dashboard,
        meta: { title: 'Dashboard' },
      },
      {
        path: 'agenda',
        name: 'Agenda',
        component: carregadores.Agenda,
        meta: { title: 'Agenda' },
      },
      {
        path: 'atendimentos',
        name: 'Atendimentos',
        component: carregadores.Atendimentos,
        meta: { title: 'Atendimentos' },
      },
      {
        path: 'clientes',
        name: 'Clientes',
        component: carregadores.Clientes,
        meta: { title: 'Clientes', roles: ['ADMIN', 'SECRETARIO'] },
      },
      {
        path: 'estoque',
        name: 'Estoque',
        component: carregadores.Estoque,
        meta: { title: 'Estoque', roles: ['ADMIN', 'SECRETARIO'] },
      },
      {
        path: 'financeiro',
        name: 'Financeiro',
        component: carregadores.Financeiro,
        meta: { title: 'Financeiro', roles: ['ADMIN'] },
      },
      {
        path: 'colaboradores',
        name: 'Colaboradores',
        component: carregadores.Colaboradores,
        meta: { title: 'Colaboradores', roles: ['ADMIN', 'SECRETARIO'] },
      },
      {
        path: 'pacotes-procedimentos',
        name: 'Pacotes/Procedimentos',
        component: carregadores.PacotesProcedimentos,
        meta: { title: 'Pacotes/Procedimentos', roles: ['ADMIN', 'SECRETARIO'] },
      },
      {
        path: 'configuracoes-clinica',
        name: 'Configurações da Clínica',
        component: carregadores.ConfiguracoesClinica,
        meta: { title: 'Configurações da Clínica', roles: ['ADMIN'] },
      },
      {
        path: 'meu-perfil',
        name: 'Meu Perfil',
        component: carregadores.MeuPerfil,
        meta: { title: 'Meu Perfil' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Home' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const CHAVE_RECARGA_CHUNK = 'oneclinic_recarga_chunk'

const ehErroDeChunk = (erro) =>
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i.test(
    String(erro?.message || erro),
  )

const rotaExigeAutenticacao = (rota) =>
  rota.matched.some((record) => record.meta.requiresAuth)

const avaliarAcesso = (rota, authStore) => {
  if (!rotaExigeAutenticacao(rota)) {
    return true
  }

  if (!authStore.autenticado || !authStore.usuario) {
    return { name: 'Home' }
  }

  if (authStore.vinculos.length === 0) {
    return { name: 'Home' }
  }

  if (authStore.precisaSelecionarClinica || !authStore.clinicaAtiva) {
    return { name: 'Home' }
  }

  const papeisPermitidos = rota.matched
    .map((record) => record.meta.roles)
    .filter(Boolean)
    .pop()

  if (papeisPermitidos && !papeisPermitidos.includes(authStore.role)) {
    return { name: 'Dashboard' }
  }

  return true
}

const revalidarEmSegundoPlano = (authStore) => {
  authStore.restaurarSessao().then(async () => {
    if (!authStore.token) {
      return
    }

    const rotaAtual = router.currentRoute.value

    if (!rotaExigeAutenticacao(rotaAtual)) {
      return
    }

    if (authStore.vinculos.length === 0) {
      await authStore.logout()
      router.replace({ name: 'Home' })
      return
    }

    const destino = avaliarAcesso(rotaAtual, authStore)

    if (destino !== true) {
      router.replace(destino)
    }
  })
}

let paginasPrecarregadas = false

const precarregarPaginas = () => {
  if (paginasPrecarregadas) {
    return
  }

  paginasPrecarregadas = true

  const iniciar = () => {
    Object.values(carregadores).forEach((carregar) => {
      carregar().catch(() => {})
    })
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(iniciar, { timeout: 5000 })
  } else {
    window.setTimeout(iniciar, 3000)
  }
}

router.beforeEach(async (to) => {
  document.title = to.meta.title
    ? `${to.meta.title} | OneClinic`
    : 'OneClinic'

  const authStore = useAuthStore()
  const exigeAutenticacao = rotaExigeAutenticacao(to)

  if (authStore.token && !authStore.usuario) {
    if (exigeAutenticacao) {
      const sessaoValida = await authStore.restaurarSessao()

      if (!sessaoValida) {
        return { name: 'Home' }
      }
    } else {
      authStore.restaurarSessao()
    }
  } else if (authStore.token && authStore.precisaRevalidar()) {
    revalidarEmSegundoPlano(authStore)
  }

  if (
    exigeAutenticacao &&
    authStore.autenticado &&
    authStore.usuario &&
    authStore.vinculos.length === 0
  ) {
    await authStore.logout()
    return { name: 'Home' }
  }

  return avaliarAcesso(to, authStore)
})

router.afterEach((to) => {
  try {
    sessionStorage.removeItem(CHAVE_RECARGA_CHUNK)
  } catch {
    return
  }

  if (rotaExigeAutenticacao(to) && useAuthStore().autenticado) {
    precarregarPaginas()
  }
})

router.onError((erro, destino) => {
  if (!ehErroDeChunk(erro)) {
    return
  }

  try {
    if (sessionStorage.getItem(CHAVE_RECARGA_CHUNK) === destino.fullPath) {
      return
    }

    sessionStorage.setItem(CHAVE_RECARGA_CHUNK, destino.fullPath)
  } catch {
    return
  }

  window.location.assign(destino.fullPath)
})

export default router