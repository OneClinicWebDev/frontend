<template>
  <div class="client-card" @dblclick="emitirDblClick">
    <div class="card-header">
      <div class="client-info-main">
        <div class="client-avatar">{{ gerarIniciais(cliente.usuario_nome) }}</div>
        <div class="client-name-status">
          <h3 class="client-name">{{ cliente.usuario_nome }}</h3>
          <span :class="['status-badge', getBadgeClass(cliente.status_cadastro)]">
            {{ cliente.status_cadastro }}
          </span>
        </div>
      </div>
      <div class="menu-container">
        <button class="btn-dots" @click.stop="toggleMenu">
          <i class="pi pi-ellipsis-v"></i>
        </button>
        <div class="dropdown-menu" v-if="isMenuAberto">
          <button class="dropdown-item" @click.stop="emitirAcao('detalhes')">
            <i class="pi pi-eye"></i> Ver Perfil
          </button>
          <button class="dropdown-item" @click.stop="emitirAcao('editar')">
            <i class="pi pi-pencil"></i> Editar
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click.stop="emitirAcao('toggle-status')">
            <i
              :class="[
                'pi',
                cliente.status_cadastro === 'ATIVO' ? 'pi-ban' : 'pi-check-circle',
              ]"
            ></i>
            {{ cliente.status_cadastro === "ATIVO" ? "Desativar" : "Ativar" }}
          </button>
        </div>
      </div>
    </div>
    <div class="client-contact">
      <div class="contact-row">
        <i class="pi pi-phone"></i>
        <span class="font-semibold">{{ mascararTelefone(cliente.telefone) }}</span>
      </div>
      <div class="contact-row">
        <i class="pi pi-map-marker"></i>
        <span
          >CEP: {{ cliente.cep || "N/A" }} - Nº
          {{ cliente.numero_endereco || "S/N" }}</span
        >
      </div>
    </div>
    <hr class="card-divider" />
    <div class="card-footer">
      <div class="footer-info">
        <span class="info-label">Cadastrado em</span>
        <span class="info-value">{{ formatarDataHora(cliente.created_at) }}</span>
      </div>
      <div class="footer-info text-right">
        <span class="info-label">CPF</span>
        <span class="info-value text-sm">{{
          cliente.usuario_cpf || mascararCpf(cliente.cpf)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { formatarDataHora } from "@/utils/datas";
const props = defineProps({
  cliente: Object,
});
const emit = defineEmits(["editar", "toggle-status", "detalhes"]);
const isMenuAberto = ref(false);
const toggleMenu = () => {
  isMenuAberto.value = !isMenuAberto.value;
};
const fecharMenu = () => {
  isMenuAberto.value = false;
};
const emitirAcao = (acao) => {
  emit(acao, props.cliente);
  fecharMenu();
};
const emitirDblClick = () => {
  emit("detalhes", props.cliente);
};
const getBadgeClass = (status) => {
  if (status === "ATIVO") return "badge-ativo";
  return "badge-inativo";
};
const gerarIniciais = (nome) => {
  if (!nome) return "";
  return nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};
const mascararTelefone = (v) => {
  if (!v) return "N/A";
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  }
  return v;
};
const mascararCpf = (v) => {
  if (!v) return "N/A";
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return v;
};
onMounted(() => {
  window.addEventListener("click", fecharMenu);
});
onUnmounted(() => {
  window.removeEventListener("click", fecharMenu);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
.client-card {
  background: #fff;
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
.client-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -4px rgba(28, 164, 167, 0.12);
  border-color: rgba(28, 164, 167, 0.4);
}
.client-card::before {
  content: "";
  position: absolute;
  top: 16px;
  bottom: 16px;
  left: 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: transparent;
  transition: background 0.25s;
}
.client-card:hover::before {
  background: var(--cor-primaria, #1ca4a7);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}
.client-info-main {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}
.client-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}
.client-name-status {
  min-width: 0;
}
.client-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 6px;
  overflow-wrap: anywhere;
}
.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-block;
}
.badge-ativo {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.badge-inativo {
  background: #f1f5f9;
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
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-dots:hover {
  color: #334155;
  background: #f1f5f9;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.12);
  padding: 6px 0;
  min-width: 170px;
  z-index: 10;
  transform-origin: top right;
  animation: menu-pop 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes menu-pop {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.dropdown-item:hover {
  background: #f8fafc;
  color: var(--cor-primaria, #1ca4a7);
}
.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 0;
}
.client-contact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  padding: 12px 14px;
  border-radius: 12px;
}
.contact-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}
.font-semibold {
  font-weight: 600;
  color: #334155;
}
.contact-row i {
  color: #94a3b8;
  font-size: 14px;
  width: 16px;
  text-align: center;
}
.card-divider {
  border: 0;
  border-top: 1px dashed #e2e8f0;
  margin: 0 0 14px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.footer-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
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
}
.info-value {
  font-size: 12px;
  font-weight: 500;
  color: #334155;
}
.text-sm {
  font-size: 12px;
}
</style>
