import { createRouter, createWebHistory } from 'vue-router'
import Home from '../assets/pages/Home/Home.vue'
import SystemLayout from '../assets/layouts/SystemLayout.vue'
import Dashboard from '../assets/pages/Dashboard/Dashboard.vue'

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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router