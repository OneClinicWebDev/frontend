<template>
  <div class="page-container">
    <main class="page-content flex-center">
      <div class="development-card">
        <div class="icon-wrapper">
          <div class="gear-container">
            <i class="pi pi-cog icon-gear"></i>
            <div class="inner-icon">
              <i class="pi pi-chart-line"></i>
            </div>
          </div>
        </div>
        <h1 class="title">Módulo Financeiro</h1>
        <div class="badge-container">
          <span class="status-badge">Em Desenvolvimento</span>
        </div>
        <p class="description">
          Estamos construindo recursos avançados para o controle financeiro da sua
          clínica. Em breve, você terá acesso a fluxos de caixa, relatórios de faturamento
          e gestão de pagamentos.
        </p>
        <div class="action-container">
          <button class="btn-voltar" @click="voltarParaDashboard">
            <i class="pi pi-arrow-left"></i> Voltar ao Início
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
const voltarParaDashboard = () => {
  if (router) {
    router.push("/app/dashboard");
  } else {
    window.history.back();
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: var(--cor-fundo, #f5f7fa);
  display: flex;
  flex-direction: column;
  font-family: "Inter", sans-serif;
}
.page-content {
  padding: 28px;
  flex-grow: 1;
}
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.development-card {
  background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
  border-radius: 20px;
  padding: 56px 40px;
  max-width: 560px;
  width: 100%;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.icon-wrapper {
  margin-bottom: 28px;
}
.gear-container {
  position: relative;
  width: 90px;
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.icon-gear {
  font-size: 88px;
  color: #ccfbf1;
  animation: spin 10s linear infinite;
}
.inner-icon {
  position: absolute;
  background-color: var(--cor-primaria, #1ca4a7);
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6px 14px -4px rgba(28, 164, 167, 0.4);
}
.inner-icon i {
  color: #ffffff;
  font-size: 20px;
}
.title {
  font-size: 22px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 14px 0;
}
.badge-container {
  margin-bottom: 20px;
}
.status-badge {
  background-color: #fffbeb;
  color: #b45309;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid #fde68a;
}
.description {
  font-size: 14px;
  line-height: 1.6;
  color: #64748b;
  margin: 0 0 32px 0;
  max-width: 90%;
}
.action-container {
  display: flex;
  justify-content: center;
  width: 100%;
}
.btn-voltar {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8fafc;
  color: #475569;
  height: 46px;
  padding: 0 24px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-voltar:hover {
  background-color: #f0fdfa;
  border-color: var(--cor-primaria, #1ca4a7);
  color: #0f766e;
  transform: translateY(-2px);
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
