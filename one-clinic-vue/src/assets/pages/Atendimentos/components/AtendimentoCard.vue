<template>
  <div
    class="atendimento-card"
    :class="`card-${atendimento.status}`"
    @dblclick="emitirAcao('detalhes')"
  >
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
            v-if="podeEditar && (atendimento.editavel || atendimento.edicaoParcial)"
            class="dropdown-item"
            @click.stop="emitirAcao('editar')"
          >
            <i class="pi pi-pencil"></i> Editar
          </button>

          <template
            v-if="
              podeEncerrar &&
              (atendimento.concluivel ||
                atendimento.faltaRegistravel ||
                atendimento.editavel)
            "
          >
            <div class="dropdown-divider"></div>

            <button
              v-if="atendimento.concluivel"
              class="dropdown-item"
              @click.stop="emitirAcao('concluir')"
            >
              <i class="pi pi-check-circle" style="color: #0f766e"></i> Concluir
              atendimento
            </button>

            <button
              v-if="atendimento.faltaRegistravel"
              class="dropdown-item"
              @click.stop="emitirAcao('falta')"
            >
              <i class="pi pi-user-minus" style="color: #7e22ce"></i>
              {{
                atendimento.corrigeConcluido ? "Corrigir para falta" : "Registrar falta"
              }}
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
          {{
            atendimento.precoAcordado !== null
              ? "Valor do agendamento"
              : "Valor de referência"
          }}
        </span>
        <span class="info-value text-sm">{{
          formatarMoeda(atendimento.valorCobrado)
        }}</span>
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

const emit = defineEmits(["detalhes", "editar", "cancelar", "falta", "concluir"]);
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
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  min-width: 0;
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
}
.atendimento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -4px rgba(28, 164, 167, 0.12);
  border-color: rgba(28, 164, 167, 0.4);
}
.atendimento-card::before {
  content: "";
  position: absolute;
  top: 16px;
  bottom: 16px;
  left: 0;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background-color: transparent;
  transition: all 0.3s ease;
}
.atendimento-card:hover::before {
  background-color: var(--cor-primaria, #1ca4a7);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.header-datetime {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  min-width: 0;
}
.header-datetime i {
  color: var(--cor-primaria, #1ca4a7);
}
.time-badge {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 3px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0;
}
.time-badge i {
  color: #64748b;
  font-size: 11px;
}
.client-info {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  min-width: 0;
}
.client-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}
.client-details {
  min-width: 0;
  flex: 1;
}
.client-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.client-phone {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}
.service-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
  padding: 12px;
  border-radius: 12px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  min-width: 0;
}
.font-semibold {
  font-weight: 600;
  color: #0f172a;
}
.detail-row i {
  color: #94a3b8;
  font-size: 13px;
  width: 14px;
  text-align: center;
}
.card-divider {
  border: 0;
  border-top: 1px dashed #e2e8f0;
  margin: 0 0 16px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  border: 1px solid transparent;
}
.badge-pendente {
  background-color: #fff7ed;
  color: #c2410c;
  border-color: #fed7aa;
}
.badge-confirmado {
  background-color: #f0f9ff;
  color: #0369a1;
  border-color: #bae6fd;
}
.badge-em_andamento {
  background-color: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}
.badge-aguardando {
  background-color: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}
.badge-concluido {
  background-color: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.badge-falta {
  background-color: #faf5ff;
  color: #7e22ce;
  border-color: #e9d5ff;
}
.badge-cancelado {
  background-color: #fff1f2;
  color: #be123c;
  border-color: #fecdd3;
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
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 2px;
}
.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.menu-container {
  position: relative;
}
.btn-dots {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}
.btn-dots:hover {
  color: #0f172a;
  background-color: #f1f5f9;
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 12px 30px -6px rgba(15, 23, 42, 0.18);
  padding: 6px;
  min-width: 180px;
  z-index: 10;
  transform-origin: top right;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  text-align: left;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dropdown-item:hover {
  background-color: #f8fafc;
  color: var(--cor-primaria, #1ca4a7);
}
.dropdown-divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 4px 0;
}
</style>
