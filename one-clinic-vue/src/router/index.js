import { createRouter, createWebHistory } from 'vue-router'
import Home from '../assets/pages/Home/Home.vue'
import SystemLayout from '../assets/layouts/SystemLayout.vue'
import Dashboard from '../assets/pages/Dashboard/Dashboard.vue'
import Agenda from '../assets/pages/Agenda/Agenda.vue'
import Atendimentos from '../assets/pages/Atendimentos/Atendimentos.vue'
import Clientes from '../assets/pages/Clientes/Clientes.vue'
import Estoque from '../assets/pages/Estoque/Estoque.vue'
import Financeiro from '../assets/pages/Financeiro/Financeiro.vue'
import Colaboradores from '../assets/pages/Colaboradores/Colaboradores.vue'
import PacotesProcedimentos from '../assets/pages/PacotesProcedimentos/PacotesProcedimentos.vue'
import ConfiguracoesClinica from '../assets/pages/Configuracoes/ConfiguracoesClinica.vue'
import MeuPerfil from '../assets/pages/Perfil/MeuPerfil.vue'
import { useAuthStore } from '@/store/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/app',
    component: SystemLayout,
    meta: { requiresAuth: true },
    redirect: { name: 'Dashboard' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Dashboard' },
      },
      {
        path: 'agenda',
        name: 'Agenda',
        component: Agenda,
        meta: { title: 'Agenda' },
      },
      {
        path: 'atendimentos',
        name: 'Atendimentos',
        component: Atendimentos,
        meta: { title: 'Atendimentos' },
      },
      {
        path: 'clientes',
        name: 'Clientes',
        component: Clientes,
        meta: { title: 'Clientes', roles: ['ADMIN', 'SECRETARIO'] },
      },
      {
        path: 'estoque',
        name: 'Estoque',
        component: Estoque,
        meta: { title: 'Estoque', roles: ['ADMIN', 'SECRETARIO'] },
      },
      {
        path: 'financeiro',
        name: 'Financeiro',
        component: Financeiro,
        meta: { title: 'Financeiro', roles: ['ADMIN'] },
      },
      {
        path: 'colaboradores',
        name: 'Colaboradores',
        component: Colaboradores,
        meta: { title: 'Colaboradores', roles: ['ADMIN', 'SECRETARIO'] },
      },
      {
        path: 'pacotes-procedimentos',
        name: 'Pacotes/Procedimentos',
        component: PacotesProcedimentos,
        meta: { title: 'Pacotes/Procedimentos', roles: ['ADMIN', 'SECRETARIO'] },
      },
      {
        path: 'configuracoes-clinica',
        name: 'Configurações da Clínica',
        component: ConfiguracoesClinica,
        meta: { title: 'Configurações da Clínica', roles: ['ADMIN'] },
      },
      {
        path: 'meu-perfil',
        name: 'Meu Perfil',
        component: MeuPerfil,
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

router.beforeEach(async (to) => {
  document.title = to.meta.title
    ? `${to.meta.title} | OneClinic`
    : 'OneClinic'

  const authStore = useAuthStore()
  const exigeAutenticacao = to.matched.some(
    (record) => record.meta.requiresAuth,
  )

  if (authStore.token && !authStore.usuario) {
    const sessaoValida = await authStore.restaurarSessao()

    if (!sessaoValida && exigeAutenticacao) {
      return { name: 'Home' }
    }
  }

  if (!exigeAutenticacao) {
    return true
  }

  if (!authStore.autenticado || !authStore.usuario) {
    return { name: 'Home' }
  }

  if (authStore.vinculos.length === 0) {
    await authStore.logout()
    return { name: 'Home' }
  }

  if (authStore.precisaSelecionarClinica || !authStore.clinicaAtiva) {
    return { name: 'Home' }
  }

  const papeisPermitidos = to.matched
    .map((record) => record.meta.roles)
    .filter(Boolean)
    .pop()

  if (papeisPermitidos && !papeisPermitidos.includes(authStore.role)) {
    return { name: 'Dashboard' }
  }

  return true
})

export default router