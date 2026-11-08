<template>
  <div class="page-container">
    <main class="page-content">
      <div class="action-panel">
        <div class="top-row">
          <div class="search-input-wrapper">
            <i class="pi pi-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              :placeholder="placeholderBusca"
              class="search-input"
            />
          </div>
          <button class="btn-novo" @click="abrirModalCriacao" :disabled="carregando">
            <i class="pi pi-plus"></i> Novo Cliente
          </button>
        </div>
        <div class="filters-row">
          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-filter"></i> Buscar em:</span>
            <div class="chips-container">
              <button
                v-for="campo in camposBusca"
                :key="campo.value"
                :class="['chip', { active: camposAtivos.includes(campo.value) }]"
                @click="toggleCampo(campo.value)"
              >
                {{ campo.label }}
              </button>
            </div>
          </div>
          <div class="divider"></div>
          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-check-circle"></i> Cadastro:</span>
            <div class="chips-container">
              <button
                v-for="status in statusBusca"
                :key="status.value"
                :class="['chip chip-status', { active: filtroStatus === status.value }]"
                @click="filtroStatus = status.value"
              >
                {{ status.label }}
              </button>
            </div>
          </div>
          <button class="btn-limpar" @click="limparFiltros" v-if="temFiltroAtivo">
            <i class="pi pi-filter-slash"></i> Limpar
          </button>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">{{ totalClientes }}</span>
          <span class="stat-label">Total de Clientes</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ clientesAtivos }}</span>
          <span class="stat-label">Clientes Ativos</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ clientesInativos }}</span>
          <span class="stat-label">Clientes Inativos</span>
        </div>
      </div>
      <div v-if="carregando" class="empty-state">
        <i class="pi pi-spin pi-spinner empty-icon"></i>
        <p>Carregando clientes...</p>
      </div>
      <TransitionGroup v-else name="list" tag="div" class="clients-grid">
        <ClientCard
          v-for="cliente in clientesFiltrados"
          :key="cliente.id"
          :cliente="cliente"
          @detalhes="abrirModalDetalhes"
          @editar="abrirModalEdicao"
          @toggle-status="alternarStatus"
        />
      </TransitionGroup>
      <div v-if="!carregando && clientesFiltrados.length === 0" class="empty-state">
        <i class="pi pi-users empty-icon"></i>
        <p>Nenhum cliente encontrado com os filtros atuais.</p>
      </div>
    </main>
    <ClientModal
      :is-open="isModalOpen"
      :mode="modalMode"
      :cliente-edicao="clienteSelecionado"
      @close="fecharModal"
      @save="salvarCliente"
      @notify="receberNotificacaoModal"
    />
    <Transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <i
          :class="['pi', toast.type === 'error' ? 'pi-times-circle' : 'pi-check-circle']"
        ></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/services/api";
import ClientCard from "./components/ClientCard.vue";
import ClientModal from "./components/ClientModal.vue";
const clientes = ref([]);
const carregando = ref(false);
const searchQuery = ref("");
const camposAtivos = ref(["nome"]);
const filtroStatus = ref("todos");
const isModalOpen = ref(false);
const modalMode = ref("criar");
const clienteSelecionado = ref(null);
const toast = ref({ show: false, message: "", type: "success" });
const camposBusca = [
  { label: "Nome", value: "nome" },
  { label: "CPF", value: "cpf" },
  { label: "Telefone", value: "telefone" },
];
const statusBusca = [
  { label: "Todos", value: "todos" },
  { label: "Ativos", value: "ATIVO" },
  { label: "Inativos", value: "INATIVO" },
];
const buscarClientes = async () => {
  carregando.value = true;
  try {
    const response = await api.get("/api/clientes/");
    clientes.value = response.data.results || response.data;
  } catch (error) {
    dispararToast("Erro ao carregar os clientes.", "error");
  } finally {
    carregando.value = false;
  }
};
onMounted(() => {
  buscarClientes();
});
const totalClientes = computed(() => clientes.value.length);
const clientesAtivos = computed(
  () => clientes.value.filter((c) => c.status_cadastro === "ATIVO").length
);
const clientesInativos = computed(
  () => clientes.value.filter((c) => c.status_cadastro === "INATIVO").length
);
const placeholderBusca = computed(() => {
  const campos = camposBusca
    .filter((c) => camposAtivos.value.includes(c.value))
    .map((c) => c.label);
  return `Buscar por ${campos.join(", ")}...`;
});
const temFiltroAtivo = computed(() => {
  return (
    searchQuery.value.length > 0 ||
    camposAtivos.value.length > 1 ||
    (camposAtivos.value.length === 1 && camposAtivos.value[0] !== "nome") ||
    filtroStatus.value !== "todos"
  );
});
const toggleCampo = (campo) => {
  const index = camposAtivos.value.indexOf(campo);
  if (index === -1) {
    camposAtivos.value.push(campo);
  } else {
    if (camposAtivos.value.length > 1) {
      camposAtivos.value.splice(index, 1);
    }
  }
};
const limparFiltros = () => {
  camposAtivos.value = ["nome"];
  filtroStatus.value = "todos";
  searchQuery.value = "";
};
const clientesFiltrados = computed(() => {
  let resultado = clientes.value;
  if (filtroStatus.value !== "todos") {
    resultado = resultado.filter((c) => c.status_cadastro === filtroStatus.value);
  }
  if (!searchQuery.value || camposAtivos.value.length === 0) {
    return resultado;
  }
  const queryLimpa = searchQuery.value.toLowerCase().replace(/\D/g, "");
  const queryNormal = searchQuery.value.toLowerCase();
  return resultado.filter((c) => {
    return camposAtivos.value.some((campo) => {
      if (campo === "cpf") {
        const valorLimpo = String(c.usuario_cpf || "").replace(/\D/g, "");
        return valorLimpo.includes(queryLimpa);
      }
      if (campo === "telefone") {
        const valorLimpo = String(c.telefone || "").replace(/\D/g, "");
        return valorLimpo.includes(queryLimpa);
      }
      if (campo === "nome") {
        const valor = String(c.usuario_nome || "").toLowerCase();
        return valor.includes(queryNormal);
      }
      return false;
    });
  });
});
const dispararToast = (mensagem, tipo = "success") => {
  toast.value = { show: true, message: mensagem, type: tipo };
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};
const receberNotificacaoModal = (evento) => {
  dispararToast(evento.message, evento.type);
};
const abrirModalCriacao = () => {
  modalMode.value = "criar";
  clienteSelecionado.value = null;
  isModalOpen.value = true;
};
const abrirModalEdicao = (cliente) => {
  modalMode.value = "editar";
  clienteSelecionado.value = cliente;
  isModalOpen.value = true;
};
const abrirModalDetalhes = (cliente) => {
  modalMode.value = "detalhes";
  clienteSelecionado.value = cliente;
  isModalOpen.value = true;
};
const fecharModal = () => {
  isModalOpen.value = false;
  clienteSelecionado.value = null;
};
const salvarCliente = async (dadosForm) => {
  const payload = {
    nome_completo: dadosForm.nome,
    cpf: dadosForm.cpf.replace(/\D/g, ""),
    telefone: dadosForm.telefone.replace(/\D/g, ""),
    cep: dadosForm.cep.replace(/\D/g, ""),
    numero_endereco: dadosForm.numero,
    status_cadastro: dadosForm.status_cadastro,
  };
  try {
    if (dadosForm.id) {
      await api.patch(`/api/clientes/${dadosForm.id}/`, payload);
      dispararToast(`Cliente atualizado com sucesso!`);
    } else {
      await api.post("/api/clientes/", payload);
      dispararToast(`Cliente cadastrado com sucesso!`);
    }
    fecharModal();
    buscarClientes();
  } catch (error) {
    const erroAPI = error.response?.data;
    const msg = erroAPI
      ? Object.values(erroAPI).flat()[0]
      : "Erro ao processar solicitação.";
    dispararToast(msg, "error");
  }
};
const alternarStatus = async (cliente) => {
  const novoStatus = cliente.status_cadastro === "ATIVO" ? "INATIVO" : "ATIVO";
  try {
    await api.patch(`/api/clientes/${cliente.id}/`, { status_cadastro: novoStatus });
    dispararToast(`Status do cliente atualizado para ${novoStatus}.`);
    buscarClientes();
  } catch (error) {
    dispararToast("Erro ao alterar o status do cliente.", "error");
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
.page-container {
  min-height: 100vh;
  background: var(--cor-fundo, #f5f7fa);
  display: flex;
  flex-direction: column;
  font-family: "Inter", sans-serif;
}
.page-content {
  padding: 28px;
  flex-grow: 1;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.action-panel {
  background: linear-gradient(180deg, #fff, #fcfdff);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.search-input-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 600px;
}
.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 15px;
}
.search-input {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 44px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}
.search-input::placeholder {
  color: #94a3b8;
}
.search-input:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.btn-novo {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--cor-primaria, #1ca4a7);
  color: #fff;
  height: 48px;
  padding: 0 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  font-family: inherit;
}
.btn-novo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-novo:hover:not(:disabled) {
  background: #158a8d;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(28, 164, 167, 0.3);
}
.filters-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}
.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 6px;
}
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  font-family: inherit;
}
.chip:hover {
  border-color: rgba(28, 164, 167, 0.4);
  color: #0f766e;
  background: #f0fdfa;
}
.chip.active {
  background: var(--cor-primaria, #1ca4a7);
  border-color: var(--cor-primaria, #1ca4a7);
  color: #fff;
}
.chip-status.active {
  background: #0f172a;
  border-color: #0f172a;
  color: #fff;
}
.divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
}
.btn-limpar {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 7px 14px;
  border-radius: 10px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-family: inherit;
}
.btn-limpar:hover {
  background: #fef2f2;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.stat-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -4px rgba(28, 164, 167, 0.12);
  border-color: rgba(28, 164, 167, 0.4);
}
.stat-number {
  font-size: 28px;
  font-weight: 500;
  color: #0f172a;
  line-height: 1.2;
}
.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px;
  color: #64748b;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  gap: 8px;
  grid-column: 1/-1;
  font-size: 14px;
}
.empty-state p {
  margin: 0;
}
.empty-icon {
  font-size: 40px;
  color: #94a3b8;
  margin-bottom: 8px;
}
.toast-notification {
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: #fff;
  color: #334155;
  padding: 14px 20px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.15);
  border: 1px solid #a7f3d0;
  font-size: 14px;
  font-weight: 500;
  z-index: 3000;
}
.toast-notification.error {
  border-color: #fecaca;
}
.toast-notification.error i {
  color: #dc2626;
}
.toast-notification i {
  color: #10b981;
  font-size: 18px;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(16px);
}
.list-leave-active {
  position: absolute;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
@media (max-width: 992px) {
  .filters-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .divider {
    display: none;
  }
  .btn-limpar {
    margin-left: 0;
  }
}
@media (max-width: 768px) {
  .page-content {
    padding: 16px;
    gap: 16px;
  }
  .top-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-wrapper {
    max-width: 100%;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .btn-novo {
    justify-content: center;
  }
  .btn-limpar {
    width: 100%;
    justify-content: center;
  }
}
</style>
