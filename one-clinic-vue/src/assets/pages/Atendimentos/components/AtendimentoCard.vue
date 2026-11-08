<template>
  <div
    class="atendimento-card"
    :class="`card-${atendimento.status}`"
    role="button"
    tabindex="0"
    :aria-label="`Ver detalhes do atendimento de ${atendimento.cliente}`"
    @click="emitirAcao('detalhes')"
    @keydown.enter.self="emitirAcao('detalhes')"
    @keydown.space.self.prevent="emitirAcao('detalhes')"
  >
    <div class="card-header">
      <div class="header-datetime">
        <span class="date">
          <i class="pi pi-calendar"></i>
          {{ formatarDataBR(atendimento.dataInicio) }}
        </span>
        <span class="time-badge">
          <i class="pi pi-clock"></i>
          {{ atendimento.horaInicio }} – {{ atendimento.horaFim }}
        </span>
      </div>
      <div class="card-actions">
        <button
          v-if="podeEditar && atendimento.editavel"
          type="button"
          class="btn-icon btn-edit"
          title="Editar atendimento"
          aria-label="Editar atendimento"
          @click.stop="emitirAcao('editar')"
        >
          <i class="pi pi-pencil"></i>
        </button>
        <div class="menu-container">
          <button
            type="button"
            class="btn-icon btn-dots"
            aria-label="Mais ações do atendimento"
            @click.stop="toggleMenu"
          >
            <i class="pi pi-ellipsis-v"></i>
          </button>
          <div v-if="isMenuAberto" class="dropdown-menu" @click.stop>
            <button
              type="button"
              class="dropdown-item"
              @click.stop="emitirAcao('detalhes')"
            >
              <i class="pi pi-eye"></i> Ver detalhes
            </button>
            <template
              v-if="
                podeEncerrar && (atendimento.faltaRegistravel || atendimento.editavel)
              "
            >
              <div class="dropdown-divider"></div>
              <button
                v-if="atendimento.faltaRegistravel"
                type="button"
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
                type="button"
                class="dropdown-item"
                @click.stop="emitirAcao('cancelar')"
              >
                <i class="pi pi-ban" style="color: #be123c"></i> Cancelar
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="client-info">
      <div class="client-avatar">{{ gerarIniciais(atendimento.cliente) }}</div>
      <div class="client-details">
        <h3 class="client-name">{{ atendimento.cliente }}</h3>
        <span class="client-phone">
          <i class="pi pi-phone"></i>
          {{ atendimento.clienteTelefone || "Telefone não informado" }}
        </span>
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
      <div v-if="atendimento.valorCobrado !== null" class="footer-info text-right">
        <span class="info-label">
          {{
            atendimento.precoAcordado !== null
              ? "Valor do agendamento"
              : "Valor de referência"
          }}
        </span>
        <span class="info-value">{{ formatarMoeda(atendimento.valorCobrado) }}</span>
      </div>
    </div>
    <div class="card-datas">
      <span
        ><i class="pi pi-calendar-plus"></i> Criado em
        {{ formatarDataHora(atendimento.criadoEm) }}</span
      >
      <span
        ><i class="pi pi-refresh"></i> Atualizado em
        {{ formatarDataHora(atendimento.atualizadoEm) }}</span
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { formatarDataHora } from "@/utils/datas";
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
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
.atendimento-card {
  position: relative;
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.atendimento-card::before {
  content: "";
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 0;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background-color: transparent;
  transition: background-color 0.25s ease;
}
.atendimento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -4px rgba(28, 164, 167, 0.12);
  border-color: rgba(28, 164, 167, 0.4);
}
.atendimento-card:hover::before {
  background-color: var(--cor-primaria, #1ca4a7);
}
.atendimento-card:focus-visible {
  outline: 3px solid rgba(28, 164, 167, 0.35);
  outline-offset: 2px;
}
.card-cancelado,
.card-falta {
  opacity: 0.85;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.header-datetime {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 8px;
  min-width: 0;
  color: #475569;
  font-weight: 600;
  font-size: 12px;
}
.date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.date i {
  color: var(--cor-primaria, #1ca4a7);
  font-size: 12px;
}
.time-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 8px;
  background-color: #f1f5f9;
  font-size: 11px;
  white-space: nowrap;
}
.time-badge i {
  color: #64748b;
  font-size: 10px;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.btn-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-icon:hover {
  color: #334155;
  background-color: #f1f5f9;
}
.btn-edit {
  color: var(--cor-primaria, #1ca4a7);
  background-color: #f0fdfa;
  border-color: #ccfbf1;
}
.btn-edit:hover {
  color: #ffffff;
  background-color: var(--cor-primaria, #1ca4a7);
  border-color: var(--cor-primaria, #1ca4a7);
}
.btn-icon:focus-visible {
  outline: 3px solid rgba(28, 164, 167, 0.3);
  outline-offset: 1px;
}
.menu-container {
  position: relative;
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  min-width: 180px;
  padding: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.14);
  transform-origin: top right;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border: 0;
  border-radius: 10px;
  background: none;
  text-align: left;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dropdown-item:hover {
  background-color: #f0fdfa;
  color: var(--cor-primaria, #1ca4a7);
}
.dropdown-divider {
  height: 1px;
  margin: 4px 6px;
  background-color: #f1f5f9;
}
.client-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  margin-bottom: 12px;
}
.client-avatar {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0fdfa;
  color: #0f766e;
  border: 1px solid #ccfbf1;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
}
.client-details {
  min-width: 0;
  flex: 1;
}
.client-name {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.client-phone {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
}
.service-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #475569;
  font-size: 12px;
}
.detail-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-row i {
  width: 14px;
  flex-shrink: 0;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
}
.font-semibold {
  font-weight: 600;
  color: #334155;
}
.card-divider {
  border: 0;
  border-top: 1px dashed #e2e8f0;
  margin: 0 0 12px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.footer-info {
  display: flex;
  flex-direction: column;
}
.text-right {
  align-items: flex-end;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
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
  background-color: #ecfdf5;
  color: #047857;
}
.badge-falta {
  background-color: #f3e8ff;
  color: #7e22ce;
}
.badge-cancelado {
  background-color: #fef2f2;
  color: #b91c1c;
}
.info-label {
  margin-bottom: 2px;
  font-size: 9px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.info-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--cor-primaria, #1ca4a7);
}
.card-datas {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
  font-size: 10px;
  font-weight: 500;
  color: #94a3b8;
}
.card-datas i {
  margin-right: 4px;
  font-size: 10px;
}
</style>
