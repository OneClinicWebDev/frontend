<template>
  <div class="system-layout">
    <Sidebar />
    <div class="content-wrapper">
      <Header />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "./Components/Sidebar.vue";
import Header from "./Components/Header.vue";
</script>

<style scoped>
.system-layout {
  display: flex;
  min-height: 100vh;
  background: var(--cor-fundo, #f5f7fa);
  font-family: "Inter", sans-serif;
}
.content-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.main-content {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
  overflow-x: hidden;
}
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
}
</style>
