
<script setup>
import { ref } from 'vue'
import './Home.css'
import HomeHeader from './components/HomeHeader.vue'
import HomeHero from './components/HomeHero.vue'
import HomeFeatures from './components/HomeFeatures.vue'
import HomeBenefits from './components/HomeBenefits.vue'
import HomeCTA from './components/HomeCTA.vue'
import HomeFooter from './components/HomeFooter.vue'
import LoginModal from './components/LoginModal.vue'

const isLoginColaboradorOpen = ref(false)

const openColaborador = () => {
  isLoginColaboradorOpen.value = true
}

const openCliente = () => {
  window.alert(
    'Área do Cliente em desenvolvimento! Em breve você terá acesso ao seu prontuário.',
  )
}

const closeModals = () => {
  isLoginColaboradorOpen.value = false
}
</script>

<template>
  <div class="app">
    <HomeHeader
      @open-colaborador="openColaborador"
      @open-cliente="openCliente"
    />

    <HomeHero
      @open-colaborador="openColaborador"
      @open-cliente="openCliente"
    />

    <HomeFeatures />
    <HomeBenefits />
    <HomeCTA />
    <HomeFooter />

    <LoginModal
      v-if="isLoginColaboradorOpen"
      @close="closeModals"
    />
  </div>
</template>
