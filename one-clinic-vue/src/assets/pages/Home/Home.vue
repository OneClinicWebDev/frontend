<script setup>
import './Home.css'
import HomeHeader from './components/HomeHeader.vue'
import HomeHero from './components/HomeHero.vue'
import HomeFeatures from './components/HomeFeatures.vue'
import HomeBenefits from './components/HomeBenefits.vue'
import HomeCTA from './components/HomeCTA.vue'
import HomeFooter from './components/HomeFooter.vue'
</script>

<template>
  <div class="app">
    <HomeHeader />
    <HomeHero />
    <HomeFeatures />
    <HomeBenefits />
    <HomeCTA />
    <HomeFooter />
  </div>
</template>