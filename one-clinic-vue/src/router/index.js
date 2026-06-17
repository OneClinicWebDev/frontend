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

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },

  {
    path: '/app',
    component: SystemLayout,

    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: 'Dashboard'
        }
      },

      {
        path: 'agenda',
        name: 'Agenda',
        component: Agenda,
        meta: {
          title: 'Agenda'
        }
      },

      {
        path: 'atendimentos',
        name: 'Atendimentos',
        component: Atendimentos,
        meta: {
          title: 'Atendimentos'
        }
      },

      {
        path: 'clientes',
        name: 'Clientes',
        component: Clientes,
        meta: {
          title: 'Clientes'
        }
      },

      {
        path: 'estoque',
        name: 'Estoque',
        component: Estoque,
        meta: {
          title: 'Estoque'
        }
      },

      {
        path: 'financeiro',
        name: 'Financeiro',
        component: Financeiro,
        meta: {
          title: 'Financeiro'
        }
      },

      {
        path: 'colaboradores',
        name: 'Colaboradores',
        component: Colaboradores,
        meta: {
          title: 'Colaboradores'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router