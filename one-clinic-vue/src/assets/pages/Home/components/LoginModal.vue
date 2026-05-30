<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '../Home.js'

const emit = defineEmits(['close'])
const router = useRouter()

const cpf = ref('')
const senha = ref('')

const handleLogin = () => {
  emit('close')
  router.push('/app/dashboard')
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <button class="close-btn" @click="$emit('close')">
        <i class="pi pi-times"></i>
      </button>

      <div class="modal-header">
        <h2>Acesse sua conta</h2>
        <p>Preencha seus dados para entrar no sistema</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="cpf">CPF</label>
          <input
            type="text"
            id="cpf"
            v-model="cpf"
            placeholder="000.000.000-00"
            required
          />
        </div>

        <div class="input-group">
          <label for="senha">Senha</label>
          <input
            type="password"
            id="senha"
            v-model="senha"
            placeholder="Sua senha"
            required
          />
        </div>

        <div class="modal-actions">
          <Button type="submit" label="Entrar" class="btn-primary w-full" />
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(4, 31, 46, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-card {
  background: var(--branco);
  border-radius: 1.5rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 25px 50px rgba(11, 48, 66, 0.3);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: var(--cor-secundaria);
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: var(--cor-primaria);
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  color: var(--cor-escura);
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.modal-header p {
  color: var(--cor-secundaria);
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  color: var(--cor-secundaria);
  font-size: 0.9rem;
}

.input-group input {
  padding: 0.875rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  font-family: inherit;
}

.input-group input:focus {
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.15);
}

.modal-actions {
  margin-top: 0.5rem;
}

.w-full {
  width: 100%;
}
</style>