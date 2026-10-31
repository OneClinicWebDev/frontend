<template>
  <div class="atendimento-card" :class="`card-${atendimento.status}`" @dblclick="emitirAcao('detalhes')">
    <div class="card-header">
      <div class="header-datetime">
        <i class="pi pi-calendar"></i>
        <span class="date">{{ formatarDataBR(atendimento.dataInicio) }}</span>
        <span class="time-badge">
          <i class="pi pi-clock"></i>
          {{ atendimento.horaInicio }} – {{ atendimento.horaFim }}
        </span>
      </div>

      <div class="menu-container">
        <button
          class="btn-dots"
          aria-label="Ações do atendimento"
          @click.stop="toggleMenu"
        >
          <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="dropdown-menu" v-if="isMenuAberto">
          <button class="dropdown-item" @click.stop="emitirAcao('detalhes')">
            <i class="pi pi-eye"></i> Ver detalhes
          </button>
          <button
            v-if="podeEditar && atendimento.editavel"
            class="dropdown-item"
            @click.stop="emitirAcao('editar')"
          >
            <i class="pi pi-pencil"></i> Editar
          </button>

          <template
            v-if="podeEncerrar && (atendimento.faltaRegistravel || atendimento.editavel)"
          >
            <div class="dropdown-divider"></div>

            <button
              v-if="atendimento.faltaRegistravel"
              class="dropdown-item"
              @click.stop="emitirAcao('falta')"
            >
              <i class="pi pi-user-minus" style="color: #7e22ce"></i>
              {{ atendimento.corrigeConcluido ? "Corrigir para falta" : "Registrar falta" }}
            </button>
            <button
              v-if="atendimento.editavel"
              class="dropdown-item"
              @click.stop="emitirAcao('cancelar')"
            >
              <i class="pi pi-ban" style="color: #be123c"></i> Cancelar
            </button>
          </template>
        </div>
      </div>
    </div>

    <div class="client-info">
      <div class="client-avatar">{{ gerarIniciais(atendimento.cliente) }}</div>
      <div class="client-details">
        <h3 class="client-name">{{ atendimento.cliente }}</h3>
        <span class="client-phone"
          ><i class="pi pi-phone"></i>
          {{ atendimento.clienteTelefone || "Telefone não informado" }}</span
        >
      </div>
    </div>

    <div class="service-details">
      <div class="detail-row">
        <i class="pi pi-file"></i>
        <span class="font-semibold">{{ atendimento.servico }}</span>
      </div>
      <div class="detail-row">
        <i class="pi pi-user-plus"></i>
        <span>{{ atendimento.profissional }}</span>
      </div>
      <div class="detail-row">
        <i class="pi pi-stopwatch"></i>
        <span>{{ formatarDuracao(atendimento.duracaoMinutos) }}</span>
      </div>
      <div v-if="atendimento.pacoteNome" class="detail-row">
        <i class="pi pi-box"></i>
        <span>{{ atendimento.pacoteNome }}</span>
      </div>
    </div>

    <hr class="card-divider" />

    <div class="card-footer">
      <div class="footer-info">
        <span :class="['status-badge', `badge-${atendimento.status}`]">
          {{ formatarStatus(atendimento.status) }}
        </span>
      </div>
      <div class="footer-info text-right" v-if="atendimento.valorCobrado !== null">
        <span class="info-label">
          {{ atendimento.precoAcordado !== null ? "Valor do agendamento" : "Valor de referência" }}
        </span>
        <span class="info-value text-sm">{{ formatarMoeda(atendimento.valorCobrado) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  formatarDataBR,
  formatarDuracao,
  formatarMoeda,
  formatarStatus,
  gerarIniciais,
} from "@/utils/agendamentos";

const props = defineProps({
  atendimento: { type: Object, required: true },
  podeEditar: Boolean,
  podeEncerrar: Boolean,
});

const emit = defineEmits(["detalhes", "editar", "cancelar", "falta"]);
const isMenuAberto = ref(false);

const toggleMenu = () => {
  isMenuAberto.value = !isMenuAberto.value;
};

const fecharMenu = () => {
  isMenuAberto.value = false;
};

const emitirAcao = (acao) => {
  emit(acao, props.atendimento);
  fecharMenu();
};

onMounted(() => window.addEventListener("click", fecharMenu));
onUnmounted(() => window.removeEventListener("click", fecharMenu));
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.atendimento-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  font-family: "Inter", sans-serif;
}
.atendimento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
  border-color: #d1d5db;
}
.atendimento-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: transparent;
  transition: all 0.3s ease;
}
.atendimento-card:hover::before {
  background-color: #1ca4a7;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.header-datetime {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-weight: 600;
  font-size: 0.85rem;
}
.header-datetime i {
  color: #1ca4a7;
}
.time-badge {
  background-color: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.time-badge i {
  color: #6b7280;
  font-size: 0.75rem;
}
.client-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}
.client-avatar {
  width: 40px;
  height: 40px;
  background-color: #e0f2f1;
  color: #00796b;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}
.client-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.15rem 0;
}
.client-phone {
  font-size: 0.8rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.service-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 8px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-size: 0.85rem;
}
.font-semibold {
  font-weight: 600;
  color: #1f2937;
}
.detail-row i {
  color: #9ca3af;
  font-size: 0.9rem;
  width: 14px;
  text-align: center;
}
.card-divider {
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 0 0 1rem 0;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.badge-pendente {
  background-color: #ffedd5;
  color: #c2410c;
}
.badge-confirmado {
  background-color: #e0f2fe;
  color: #0369a1;
}
.badge-em_andamento {
  background-color: #fef3c7;
  color: #92400e;
}
.badge-aguardando {
  background-color: #f1f5f9;
  color: #475569;
}
.badge-concluido {
  background-color: #def7ec;
  color: #03543f;
}
.badge-falta {
  background-color: #f3e8ff;
  color: #7e22ce;
}
.badge-cancelado {
  background-color: #ffe4e6;
  color: #be123c;
}
.card-cancelado,
.card-falta {
  opacity: 0.85;
}

.footer-info {
  display: flex;
  flex-direction: column;
}
.text-right {
  align-items: flex-end;
}
.info-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.15rem;
}
.info-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1f2937;
}

.menu-container {
  position: relative;
}
.btn-dots {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}
.btn-dots:hover {
  color: #1f2937;
  background-color: #f9fafb;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 160px;
  z-index: 10;
  transform-origin: top right;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dropdown-item:hover {
  background-color: #f9fafb;
  color: #1ca4a7;
}
.dropdown-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 0.25rem 0;
}
</style>