import { createRouter, createWebHistory } from 'vue-router'

import Home from '../assets/pages/Home/Home.vue'
import SystemLayout from '../assets/layouts/SystemLayout.vue'
import Dashboard from '../assets/pages/Dashboard/Dashboard.vue'
import Agenda from '../assets/pages/Agenda/Agenda.vue'
import Atendimentos from '../assets/pages/Atendimentos/Atendimentos.vue'
import Clientes from '../assets/pages/Clientes/Clientes.vue'
import Estoque from '../assets/pages/Estoque/Estoque.vue'
import Financeiro from '../assets/pages/Financeiro/Financeiro.vue'
import Profissionais from '../assets/pages/Profissionais/Profissionais.vue'

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
        component: Dashboard 
      },
      { 
        path: 'agenda', 
        name: 'Agenda', 
        component: Agenda 
      },
      { 
        path: 'atendimentos', 
        name: 'Atendimentos', 
        component: Atendimentos 
      },
      { 
        path: 'clientes', 
        name: 'Clientes', 
        component: Clientes 
      },
      { 
        path: 'estoque', 
        name: 'Estoque', 
        component: Estoque 
      },
      { 
        path: 'financeiro', 
        name: 'Financeiro', 
        component: Financeiro 
      },
      { 
        path: 'profissionais', 
        name: 'Profissionais', 
        component: Profissionais 
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router