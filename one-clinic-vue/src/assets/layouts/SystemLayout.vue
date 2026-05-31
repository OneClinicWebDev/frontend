<template>
  <div class="system-layout">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from './Components/Sidebar.vue'
</script>

<style>
.system-layout { display: flex; min-height: 100vh; background: #F3F4F6; }
.main-content { flex: 1; padding: 2rem; overflow-y: auto; }
</style>