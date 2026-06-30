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
          Estamos construindo recursos avançados para o controle financeiro da sua clínica. 
          Em breve, você terá acesso a fluxos de caixa, relatórios de faturamento e gestão de pagamentos.
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
import { useRouter } from 'vue-router'

const router = useRouter()

const voltarParaDashboard = () => {
  if (router) {
    router.push('/app/dashboard')
  } else {
    window.history.back()
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
}

.page-content {
  padding: 2rem;
  flex-grow: 1;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.development-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 4rem 3rem;
  max-width: 550px;
  width: 100%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.development-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #1ca4a7, #0d7f82);
}

.icon-wrapper {
  margin-bottom: 2rem;
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
  font-size: 5.5rem;
  color: #E0F2F1;
  animation: spin 10s linear infinite;
}

.inner-icon {
  position: absolute;
  background-color: #1CA4A7;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px rgba(28, 164, 167, 0.3);
}

.inner-icon i {
  color: #ffffff;
  font-size: 1.5rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.badge-container {
  margin-bottom: 1.5rem;
}

.status-badge {
  background-color: #FEF3C7;
  color: #92400E;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #FDE68A;
}

.description {
  font-size: 1rem;
  line-height: 1.6;
  color: #6b7280;
  margin: 0 0 2.5rem 0;
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
  gap: 0.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 0.85rem 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-voltar:hover {
  background-color: #e5e7eb;
  color: #1f2937;
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