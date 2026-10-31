import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/store/auth'
import 'primeicons/primeicons.css'
import './assets/styles/global.css'
import './assets/styles/variables.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(PrimeVue)
app.use(router)

const authStore = useAuthStore(pinia)

const rotaExigeAutenticacao = () =>
  router.currentRoute.value.matched.some((record) => record.meta.requiresAuth)

watch(
  () => authStore.token,
  (token) => {
    if (!token && rotaExigeAutenticacao()) {
      router.replace({ name: 'Home' })
    }
  },
)

window.addEventListener('storage', (evento) => {
  if (evento.key === 'access_token' && !evento.newValue && authStore.token) {
    authStore.limparSessao()
  }

  if (evento.key === 'clinica_ativa_id' && evento.newValue !== authStore.clinicaAtivaId) {
    window.location.reload()
  }
})

app.mount('#app')