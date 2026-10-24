import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css'
import './assets/styles/global.css'
import './assets/styles/variables.css'

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue)
app.use(router)

app.mount('#app')
