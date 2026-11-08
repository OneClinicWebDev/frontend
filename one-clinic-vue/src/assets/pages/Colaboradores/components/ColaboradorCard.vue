<template>
  <article class="collaborator-card" @dblclick="emitirDblClick">
    <div class="card-header">
      <div class="collaborator-info-main">
        <div class="collaborator-avatar">{{ colaborador.iniciais }}</div>
        <div class="collaborator-name-status">
          <h3 class="collaborator-name">{{ colaborador.nome }}</h3>
          <span :class="['status-badge', getBadgeClass(colaborador.status)]">
            {{ formatStatus(colaborador.status) }}
          </span>
        </div>
      </div>
      <div class="menu-container">
        <button
          class="btn-dots"
          type="button"
          aria-label="Ações do colaborador"
          @click.stop="toggleMenu"
        >
          <i class="pi pi-ellipsis-v"></i>
        </button>
        <Transition name="menu">
          <div v-if="isMenuAberto" class="dropdown-menu" @click.stop>
            <button class="dropdown-item" type="button" @click="emitirAcao('detalhes')">
              <i class="pi pi-eye"></i>
              Ver detalhes
            </button>
            <button class="dropdown-item" type="button" @click="emitirAcao('editar')">
              <i class="pi pi-pencil"></i>
              Editar
            </button>
            <div class="dropdown-divider"></div>
            <button
              :class="[
                'dropdown-item',
                colaborador.status === 'ativo' ? 'item-danger' : 'item-success',
              ]"
              type="button"
              @click="emitirAcao('toggle-status')"
            >
              <i
                :class="[
                  'pi',
                  colaborador.status === 'ativo' ? 'pi-ban' : 'pi-check-circle',
                ]"
              ></i>
              {{ colaborador.status === "ativo" ? "Desativar" : "Reativar" }}
            </button>
          </div>
        </Transition>
      </div>
    </div>
    <div class="collaborator-contact">
      <div class="contact-row">
        <i class="pi pi-id-card"></i>
        <span class="font-semibold">{{ colaborador.funcao }}</span>
      </div>
      <div v-if="colaborador.roleNome === 'PROFISSIONAL'" class="contact-row">
        <i class="pi pi-calendar"></i>
        <span>
          {{
            colaborador.pode_editar_agenda
              ? "Permissão para editar agenda habilitada"
              : "Edição de agenda não habilitada"
          }}
        </span>
      </div>
      <div
        v-if="
          colaborador.roleNome === 'PROFISSIONAL' &&
          Array.isArray(colaborador.especialidades) &&
          colaborador.especialidades.length > 0
        "
        class="contact-row tags-row"
      >
        <i class="pi pi-tags"></i>
        <div class="tags-wrapper">
          <span
            v-for="esp in colaborador.especialidades"
            :key="esp"
            class="badge-especialidade"
          >
            {{ esp }}
          </span>
        </div>
      </div>
      <div v-if="colaborador.roleNome === 'ADMIN'" class="contact-row">
        <i class="pi pi-shield"></i>
        <span>Perfil administrativo da clínica</span>
      </div>
      <div v-if="colaborador.roleNome === 'SECRETARIO'" class="contact-row">
        <i class="pi pi-briefcase"></i>
        <span>Perfil operacional da clínica</span>
      </div>
    </div>
    <hr class="card-divider" />
    <div class="card-footer">
      <div class="footer-infos">
        <div class="footer-info">
          <span class="info-label">Situação</span>
          <span
            :class="[
              'info-value',
              colaborador.status === 'ativo' ? 'value-active' : 'value-inactive',
            ]"
          >
            {{ colaborador.status === "ativo" ? "Vínculo ativo" : "Vínculo inativo" }}
          </span>
        </div>
        <div class="footer-info">
          <span class="info-label">Cadastrado em</span>
          <span class="info-value value-date">{{ dataCriacao }}</span>
        </div>
        <div class="footer-info">
          <span class="info-label">Atualizado em</span>
          <span class="info-value value-date">{{ dataAtualizacao }}</span>
        </div>
      </div>
      <button class="btn-details" type="button" @click.stop="emitirAcao('detalhes')">
        Detalhes
        <i class="pi pi-arrow-up-right"></i>
      </button>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { formatarDataHora } from "@/utils/datas";
const props = defineProps({
  colaborador: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["editar", "toggle-status", "detalhes"]);
const isMenuAberto = ref(false);
const dataCriacao = computed(() => formatarDataHora(props.colaborador.criadoEm));
const dataAtualizacao = computed(() => formatarDataHora(props.colaborador.atualizadoEm));
function toggleMenu() {
  isMenuAberto.value = !isMenuAberto.value;
}
function fecharMenu() {
  isMenuAberto.value = false;
}
function emitirAcao(acao) {
  emit(acao, props.colaborador);
  fecharMenu();
}
function emitirDblClick() {
  emit("detalhes", props.colaborador);
}
function getBadgeClass(status) {
  return status === "ativo" ? "badge-ativo" : "badge-inativo";
}
function formatStatus(status) {
  return status === "ativo" ? "Ativo" : "Inativo";
}
onMounted(() => {
  window.addEventListener("click", fecharMenu);
});
onUnmounted(() => {
  window.removeEventListener("click", fecharMenu);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
.collaborator-card {
  min-width: 0;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  font-family: "Inter", sans-serif;
}
.collaborator-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -4px rgba(28, 164, 167, 0.12);
  border-color: rgba(28, 164, 167, 0.4);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}
.collaborator-info-main {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
}
.collaborator-avatar {
  width: 48px;
  height: 48px;
  background-color: #f0fdfa;
  color: var(--cor-primaria, #1ca4a7);
  border: 1px solid #ccfbf1;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
  flex-shrink: 0;
}
.collaborator-name-status {
  min-width: 0;
}
.collaborator-name {
  overflow-wrap: anywhere;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 6px;
}
.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  display: inline-block;
}
.badge-ativo {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.badge-inativo {
  background-color: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.menu-container {
  position: relative;
  flex-shrink: 0;
}
.btn-dots {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.25s ease;
}
.btn-dots:hover {
  color: #334155;
  background-color: #f1f5f9;
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.12);
  padding: 6px;
  min-width: 190px;
  z-index: 20;
  transform-origin: top right;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 10px;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.dropdown-item:hover {
  background-color: #f0fdfa;
  color: #0f766e;
}
.dropdown-item i {
  width: 16px;
  text-align: center;
}
.dropdown-item.item-danger {
  color: #dc2626;
}
.dropdown-item.item-danger:hover {
  background: #fef2f2;
  color: #b91c1c;
}
.dropdown-item.item-success {
  color: #047857;
}
.dropdown-item.item-success:hover {
  background: #ecfdf5;
}
.dropdown-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin: 4px 0;
}
.collaborator-contact {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  min-height: 76px;
}
.contact-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}
.tags-row {
  align-items: flex-start;
}
.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.badge-especialidade {
  background-color: #f0fdfa;
  color: #0f766e;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 8px;
  border: 1px solid #ccfbf1;
}
.contact-row i {
  color: #94a3b8;
  font-size: 14px;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  margin-top: 3px;
}
.font-semibold {
  font-weight: 600;
  color: #334155;
}
.card-divider {
  width: 100%;
  border: 0;
  border-top: 1px dashed #e2e8f0;
  margin: 0 0 16px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-top: auto;
}
.footer-infos {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  min-width: 0;
}
.footer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.info-label {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.info-value {
  font-size: 13px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.value-active {
  color: #047857;
}
.value-inactive {
  color: #64748b;
}
.value-date {
  color: #334155;
}
.btn-details {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid #ccfbf1;
  border-radius: 10px;
  background: #f0fdfa;
  color: #0f766e;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-details:hover {
  background: var(--cor-primaria, #1ca4a7);
  border-color: var(--cor-primaria, #1ca4a7);
  color: #fff;
  transform: translateY(-1px);
}
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}
@media (max-width: 380px) {
  .collaborator-card {
    padding: 16px;
  }
  .collaborator-info-main {
    gap: 10px;
  }
  .collaborator-avatar {
    width: 42px;
    height: 42px;
    font-size: 14px;
  }
  .collaborator-name {
    font-size: 14px;
  }
}
</style>
