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

const isLoginModalOpen = ref(false)

const openLogin = () => {
  isLoginModalOpen.value = true
}

const closeLogin = () => {
  isLoginModalOpen.value = false
}
</script>

<template>
  <div class="app">
    <HomeHeader @open-login="openLogin" />
    <HomeHero @open-login="openLogin" />
    <HomeFeatures />
    <HomeBenefits />
    <HomeCTA />
    <HomeFooter />

    <LoginModal v-if="isLoginModalOpen" @close="closeLogin" />
  </div>
</template>