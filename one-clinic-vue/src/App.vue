<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLoader from '@/components/AppLoader.vue'

const router = useRouter()
const roteadorPronto = ref(false)

const marcarPronto = () => {
  roteadorPronto.value = true
}

router.isReady().then(marcarPronto, marcarPronto)
</script>

<template>
  <AppLoader
    v-if="!roteadorPronto"
    fullscreen
    size="lg"
    label="Carregando sua sessão..."
  />
  <router-view v-else />
</template>