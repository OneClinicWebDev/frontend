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
              :class="['dropdown-item', colaborador.status === 'ativo' ? 'item-danger' : 'item-success']"
              type="button"
              @click="emitirAcao('toggle-status')"
            >
              <i :class="['pi', colaborador.status === 'ativo' ? 'pi-ban' : 'pi-check-circle']"></i>
              {{ colaborador.status === 'ativo' ? 'Desativar' : 'Reativar' }}
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
          {{ colaborador.pode_editar_agenda
            ? 'Permissão para editar agenda habilitada'
            : 'Edição de agenda não habilitada' }}
        </span>
      </div>
      <div v-if="colaborador.roleNome === 'PROFISSIONAL' && Array.isArray(colaborador.especialidades) && colaborador.especialidades.length > 0" class="contact-row tags-row">
        <i class="pi pi-tags"></i>
        <div class="tags-wrapper">
          <span v-for="esp in colaborador.especialidades" :key="esp" class="badge-especialidade">
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
      <div class="footer-info">
        <span class="info-label">Situação</span>
        <span :class="['info-value', colaborador.status === 'ativo' ? 'value-active' : 'value-inactive']">
          {{ colaborador.status === 'ativo' ? 'Vínculo ativo' : 'Vínculo inativo' }}
        </span>
      </div>
      <button class="btn-details" type="button" @click.stop="emitirAcao('detalhes')">
        Detalhes
        <i class="pi pi-arrow-up-right"></i>
      </button>
    </div>
  </article>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  colaborador: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["editar", "toggle-status", "detalhes"]);
const isMenuAberto = ref(false);

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
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.collaborator-card {
  min-width: 0;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 5%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
  font-family: "Inter", sans-serif;
}
.collaborator-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgb(0 0 0 / 12%);
  border-color: #cbd5e1;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.4rem;
}
.collaborator-info-main {
  display: flex;
  gap: 1rem;
  align-items: center;
  min-width: 0;
}
.collaborator-avatar {
  width: 50px;
  height: 50px;
  background-color: #f0fdfa;
  color: #1ca4a7;
  border: 1px solid #ccfbf1;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.collaborator-name-status {
  min-width: 0;
}
.collaborator-name {
  overflow-wrap: anywhere;
  font-size: 1.05rem;
  line-height: 1.45;
  font-weight: 700;
  color: #334155;
  margin: 0 0 0.45rem;
}
.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  display: inline-block;
}
.badge-ativo {
  background-color: #ecfdf5;
  color: #059669;
}
.badge-inativo {
  background-color: #f1f5f9;
  color: #64748b;
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
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: color 0.2s ease, background-color 0.2s ease;
}
.btn-dots:hover {
  color: #334155;
  background-color: #f1f5f9;
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 12%);
  padding: 0.45rem 0;
  min-width: 190px;
  z-index: 20;
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
  font-size: 0.88rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
  font-family: inherit;
}
.dropdown-item:hover {
  background-color: #f8fafc;
  color: #1ca4a7;
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
}
.dropdown-item.item-success {
  color: #059669;
}
.dropdown-item.item-success:hover {
  background: #ecfdf5;
}
.dropdown-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin: 0.3rem 0;
}
.collaborator-contact {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 1.5rem;
  min-height: 76px;
}
.contact-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.5;
}
.tags-row {
  align-items: flex-start;
}
.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.badge-especialidade {
  background-color: #f1f5f9;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
.contact-row i {
  color: #94a3b8;
  font-size: 1rem;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  margin-top: 0.15rem;
}
.font-semibold {
  font-weight: 600;
  color: #334155;
}
.card-divider {
  width: 100%;
  border: 0;
  border-top: 1px dashed #e2e8f0;
  margin: 0 0 1.2rem;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.75rem;
  margin-top: auto;
}
.footer-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}
.info-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.info-value {
  font-size: 0.85rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.value-active {
  color: #059669;
}
.value-inactive {
  color: #64748b;
}
.btn-details {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid #dbeafe;
  border-radius: 9px;
  background: #f8fafc;
  color: #0f766e;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}
.btn-details:hover {
  background: #f0fdfa;
  border-color: #99f6e4;
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
    padding: 1.1rem;
  }
  .collaborator-info-main {
    gap: 0.7rem;
  }
  .collaborator-avatar {
    width: 42px;
    height: 42px;
    font-size: 0.95rem;
  }
  .collaborator-name {
    font-size: 0.95rem;
  }
}
</style>