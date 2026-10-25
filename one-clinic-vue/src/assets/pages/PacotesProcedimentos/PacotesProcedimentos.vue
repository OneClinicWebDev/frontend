<template>
  <div class="page-container">
    <main class="page-content">
      <section class="action-panel">
        <div class="top-row">
          <div class="search-input-wrapper">
            <i class="pi pi-search search-icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Buscar por nome, categoria ou descrição..."
              aria-label="Buscar pacotes e procedimentos"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="clear-search"
              aria-label="Limpar pesquisa"
              @click="searchQuery = ''"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="action-buttons">
            <div class="control-group">
              <span class="control-caption">Catálogo</span>
              <div class="view-toggle" role="group" aria-label="Alternar catálogo">
                <button
                  type="button"
                  class="btn-view"
                  :class="{ active: activeTab === 'procedimentos' }"
                  @click="trocarAba('procedimentos')"
                >
                  <i class="pi pi-tag"></i>
                  <span>Procedimentos</span>
                </button>
                <button
                  type="button"
                  class="btn-view"
                  :class="{ active: activeTab === 'pacotes' }"
                  @click="trocarAba('pacotes')"
                >
                  <i class="pi pi-briefcase"></i>
                  <span>Pacotes</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              class="btn-novo"
              :disabled="carregando"
              @click="openCreateModal"
            >
              <i class="pi pi-plus"></i>
              <span>Novo {{ activeTab === "procedimentos" ? "Procedimento" : "Pacote" }}</span>
            </button>
          </div>
        </div>

        <div class="filters-divider"></div>

        <div class="filters-heading">
          <div class="filters-heading-title">
            <i class="pi pi-sparkles"></i>
            <span>Gestão de Catálogo e Serviços</span>
          </div>
          <span class="filters-description">
            Gerencie os valores, durações e regras dos itens oferecidos na clínica
          </span>
        </div>
      </section>

      <section class="stats-grid">
        <div class="stat-card">
          <h2 class="stat-number">{{ totalItens }}</h2>
          <p class="stat-label">
            Total de {{ activeTab === "procedimentos" ? "Procedimentos" : "Pacotes" }}
          </p>
        </div>
        <div class="stat-card">
          <h2 class="stat-number text-success">{{ ativosCount }}</h2>
          <p class="stat-label">Ativos no Sistema</p>
        </div>
        <div class="stat-card">
          <h2 class="stat-number text-info">{{ formatarMoeda(precoMedio) }}</h2>
          <p class="stat-label">Preço Médio do Catálogo</p>
        </div>
      </section>

      <section class="cards-section-container">
        <div class="cards-section-header">
          <h3>
            <i class="pi pi-list"></i>
            Lista de {{ activeTab === "procedimentos" ? "Procedimentos" : "Pacotes" }}
          </h3>
          <span class="results-count">
            {{ filteredItems.length }}
            {{ filteredItems.length === 1 ? "item encontrado" : "itens encontrados" }}
          </span>
        </div>

        <div class="cards-section-body">
          <div v-if="carregando" class="empty-state">
            <div class="empty-icon-wrapper">
              <i class="pi pi-spin pi-spinner"></i>
            </div>
            <h3>Carregando catálogo</h3>
            <p>Buscando os dados da clínica.</p>
          </div>

          <TransitionGroup v-else name="list-card" tag="div" class="cards-grid">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="appointment-card"
              tabindex="0"
              role="button"
              :aria-label="`Editar ${item.nome}`"
              @click="editItem(item)"
              @keydown.enter="editItem(item)"
              @keydown.space.prevent="editItem(item)"
            >
              <div class="appointment-header">
                <span class="appointment-time">
                  <i class="pi pi-bookmark"></i>
                  {{ item.categoria || "Sem categoria" }}
                </span>
                <span
                  :class="[
                    'status-badge',
                    item.ativo ? 'badge-confirmado' : 'badge-cancelado'
                  ]"
                >
                  {{ item.ativo ? "Ativo" : "Inativo" }}
                </span>
              </div>

              <div class="appointment-client-large">
                <div class="client-avatar">{{ gerarIniciais(item.nome) }}</div>
                <div class="client-info-wrapper">
                  <h4>{{ item.nome }}</h4>
                  <span class="item-price">{{ formatarMoeda(item.preco) }}</span>
                </div>
              </div>

              <hr class="card-divider" />

              <div class="appointment-details-grid">
                <div class="detail-item">
                  <span class="detail-label">
                    {{ activeTab === "procedimentos" ? "Duração" : "Sessões" }}
                  </span>
                  <span class="detail-value font-weight-600">
                    <i :class="activeTab === 'procedimentos' ? 'pi pi-clock' : 'pi pi-layers'"></i>
                    {{
                      activeTab === "procedimentos"
                        ? `${item.duracao_minutos} min`
                        : `${item.quantidade_sessoes} sessões`
                    }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Descrição</span>
                  <span class="detail-value text-truncate" :title="item.descricao">
                    {{ item.descricao || "Nenhuma descrição informada" }}
                  </span>
                </div>
              </div>

              <div v-if="activeTab === 'pacotes' && item.servico_nome" class="linked-service">
                <i class="pi pi-link"></i>
                {{ item.servico_nome }}
              </div>
            </div>
          </TransitionGroup>

          <div v-if="!carregando && filteredItems.length === 0" class="empty-state">
            <div class="empty-icon-wrapper">
              <i class="pi pi-inbox"></i>
            </div>
            <h3>Nenhum registro encontrado</h3>
            <p>
              Não existem
              {{ activeTab === "procedimentos" ? "procedimentos" : "pacotes" }}
              correspondentes à pesquisa.
            </p>
            <button
              v-if="!searchQuery"
              type="button"
              class="empty-action"
              @click="openCreateModal"
            >
              <i class="pi pi-plus"></i>
              Cadastrar {{ activeTab === "procedimentos" ? "procedimento" : "pacote" }}
            </button>
          </div>
        </div>
      </section>
    </main>

    <Transition name="modal-fade">
      <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
        <Transition name="modal-scale">
          <div v-if="modalOpen" class="modal-container">
            <header class="modal-header">
              <div class="modal-header-title">
                <div class="modal-header-icon">
                  <i :class="editing ? 'pi pi-pencil' : 'pi pi-plus-circle'"></i>
                </div>
                <div>
                  <h3>
                    {{
                      editing
                        ? `Editar ${activeTab === "procedimentos" ? "Procedimento" : "Pacote"}`
                        : `Novo ${activeTab === "procedimentos" ? "Procedimento" : "Pacote"}`
                    }}
                  </h3>
                  <p>Preencha os campos com os dados do catálogo da clínica</p>
                </div>
              </div>
              <button
                type="button"
                class="btn-close"
                aria-label="Fechar"
                :disabled="salvando"
                @click="closeModal"
              >
                <i class="pi pi-times"></i>
              </button>
            </header>

            <form
              ref="formRef"
              @submit.prevent="saveItem"
              novalidate
              :class="['modal-form', { 'was-validated': foiValidado }]"
            >
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label" for="catalogo-nome">
                    <i class="pi pi-tag"></i>
                    <span>{{ activeTab === "procedimentos" ? "Nome do procedimento" : "Nome do pacote" }}</span>
                    <span class="required-asterisk">*</span>
                  </label>
                  <input
                    id="catalogo-nome"
                    v-model.trim="form.nome"
                    name="nome"
                    type="text"
                    class="form-control"
                    required
                    minlength="2"
                    maxlength="150"
                    placeholder="Ex: Limpeza de Pele Profunda"
                  />
                  <span class="error-feedback">Informe um nome válido com pelo menos 2 caracteres.</span>
                </div>

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label" for="catalogo-preco">
                      <i class="pi pi-dollar"></i>
                      <span>{{ activeTab === "procedimentos" ? "Preço (R$)" : "Valor total (R$)" }}</span>
                      <span class="required-asterisk">*</span>
                    </label>
                    <input
                      id="catalogo-preco"
                      v-model.number="form.preco"
                      name="preco"
                      type="number"
                      step="0.01"
                      min="0"
                      class="form-control"
                      required
                      placeholder="0,00"
                    />
                    <span class="error-feedback">Informe um valor igual ou superior a zero.</span>
                  </div>

                  <div v-if="activeTab === 'procedimentos'" class="form-group flex-1">
                    <label class="form-label" for="catalogo-duracao">
                      <i class="pi pi-clock"></i>
                      <span>Duração (minutos)</span>
                      <span class="required-asterisk">*</span>
                    </label>
                    <input
                      id="catalogo-duracao"
                      v-model.number="form.duracao_minutos"
                      name="duracao_minutos"
                      type="number"
                      min="5"
                      step="5"
                      class="form-control"
                      required
                      placeholder="60"
                    />
                    <span class="error-feedback">Informe uma duração de pelo menos 5 minutos, em intervalos de 5.</span>
                  </div>

                  <div v-else class="form-group flex-1">
                    <label class="form-label" for="catalogo-sessoes">
                      <i class="pi pi-layers"></i>
                      <span>Quantidade de sessões</span>
                      <span class="required-asterisk">*</span>
                    </label>
                    <input
                      id="catalogo-sessoes"
                      v-model.number="form.quantidade_sessoes"
                      name="quantidade_sessoes"
                      type="number"
                      min="1"
                      step="1"
                      class="form-control"
                      required
                      placeholder="5"
                    />
                    <span class="error-feedback">Informe pelo menos uma sessão.</span>
                  </div>
                </div>

                <div v-if="activeTab === 'pacotes'" class="form-group">
                  <label class="form-label" for="catalogo-servico">
                    <i class="pi pi-link"></i>
                    <span>Procedimento vinculado</span>
                    <span class="required-asterisk">*</span>
                  </label>
                  <select
                    id="catalogo-servico"
                    v-model="form.servico"
                    name="servico"
                    class="form-control"
                    required
                  >
                    <option value="" disabled>Selecione um procedimento</option>
                    <option
                      v-for="servico in procedimentosAtivos"
                      :key="servico.id"
                      :value="String(servico.id)"
                    >
                      {{ servico.nome }}
                    </option>
                  </select>
                  <span class="error-feedback">Selecione o procedimento vinculado ao pacote.</span>
                  <p v-if="procedimentosAtivos.length === 0" class="field-hint">
                    Cadastre ou ative um procedimento antes de criar um pacote.
                  </p>
                </div>

                <div class="form-group">
                  <label class="form-label" for="catalogo-categoria">
                    <i class="pi pi-bookmark"></i>
                    <span>Categoria</span>
                    <span class="required-asterisk">*</span>
                  </label>
                  <input
                    id="catalogo-categoria"
                    v-model.trim="form.categoria"
                    name="categoria"
                    type="text"
                    class="form-control"
                    required
                    minlength="2"
                    maxlength="100"
                    placeholder="Ex: Facial, Corporal, Laser"
                  />
                  <span class="error-feedback">Informe uma categoria com pelo menos 2 caracteres.</span>
                </div>

                <div class="form-group">
                  <label class="form-label" for="catalogo-descricao">
                    <i class="pi pi-align-left"></i>
                    <span>Descrição completa</span>
                  </label>
                  <textarea
                    id="catalogo-descricao"
                    v-model.trim="form.descricao"
                    name="descricao"
                    class="form-control textarea-control"
                    rows="3"
                    placeholder="Detalhes ou observações sobre o item..."
                  ></textarea>
                </div>

                <div class="form-group mt-2">
                  <label class="form-label">
                    <i class="pi pi-check-circle"></i>
                    <span>Status de disponibilidade</span>
                  </label>
                  <div class="status-toggle">
                    <label :class="['toggle-option', { active: form.ativo === true }]">
                      <input v-model="form.ativo" type="radio" name="status" :value="true" />
                      <span>Ativo</span>
                    </label>
                    <label :class="['toggle-option', { active: form.ativo === false }]">
                      <input v-model="form.ativo" type="radio" name="status" :value="false" />
                      <span>Inativo</span>
                    </label>
                    <div class="toggle-slider-2" :class="{ inactive: !form.ativo }"></div>
                  </div>
                </div>
              </div>

              <footer class="modal-footer">
                <button
                  v-if="editing && form.ativo"
                  type="button"
                  class="btn-excluir"
                  :disabled="salvando"
                  @click="deleteItem"
                >
                  <i class="pi pi-ban"></i>
                  <span>Desativar</span>
                </button>
                <div class="footer-actions">
                  <button
                    type="button"
                    class="btn-cancelar"
                    :disabled="salvando"
                    @click="closeModal"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    class="btn-salvar"
                    :disabled="salvando || (activeTab === 'pacotes' && procedimentosAtivos.length === 0 && !editing)"
                  >
                    <i v-if="salvando" class="pi pi-spin pi-spinner"></i>
                    <span>{{ salvando ? "Salvando..." : "Salvar alterações" }}</span>
                    <i v-if="!salvando" class="pi pi-check"></i>
                  </button>
                </div>
              </footer>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <i :class="toast.type === 'error' ? 'pi pi-exclamation-circle' : 'pi pi-check-circle'"></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import api from "@/services/api";

const activeTab = ref("procedimentos");
const searchQuery = ref("");
const modalOpen = ref(false);
const editing = ref(false);
const selectedId = ref(null);
const formRef = ref(null);
const foiValidado = ref(false);
const salvando = ref(false);
const carregando = ref(false);

const toast = ref({
  show: false,
  message: "",
  type: "success",
});

let toastTimer;

const procedimentosBD = ref([]);
const pacotesBD = ref([]);

const formularioInicial = () => ({
  nome: "",
  preco: "",
  duracao_minutos: 60,
  quantidade_sessoes: 5,
  servico: "",
  categoria: "",
  descricao: "",
  ativo: true,
});

const form = ref(formularioInicial());

const procedimentosAtivos = computed(() =>
  procedimentosBD.value.filter((item) => item.ativo)
);

const dispararToast = (mensagem, tipo = "success") => {
  clearTimeout(toastTimer);
  toast.value = {
    show: true,
    message: mensagem,
    type: tipo,
  };
  toastTimer = setTimeout(() => {
    toast.value.show = false;
  }, 4500);
};

const obterLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const obterMensagemErro = (error) => {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;
  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([campo, mensagens]) => {
        const texto = Array.isArray(mensagens)
          ? mensagens.join(" ")
          : typeof mensagens === "object"
            ? JSON.stringify(mensagens)
            : String(mensagens);

        return `${campo}: ${texto}`;
      })
      .join(" ");
  }

  if (error?.response?.status === 401) {
    return "Sua sessão expirou. Entre novamente no sistema.";
  }

  if (error?.response?.status === 403) {
    return "Você não tem permissão para realizar esta operação.";
  }

  if (error?.response?.status === 404) {
    return "A rota solicitada não foi encontrada. Confira a configuração da API.";
  }

  if (!error?.response) {
    return "Não foi possível conectar à API. Verifique se o backend está em execução.";
  }

  return "Não foi possível concluir a operação.";
};

const normalizarServico = (item) => ({
  ...item,
  id: item.id,
  nome: item.nome || "",
  preco: Number(item.preco ?? 0),
  duracao_minutos: Number(item.duracao_padrao_minutos ?? 0),
  categoria: item.categoria || "",
  descricao: item.descricao || "",
  ativo: Boolean(item.ativo),
});

const normalizarPacote = (item) => {
  const servicoId =
    typeof item.servico === "object" && item.servico !== null
      ? item.servico.id
      : item.servico;

  const servicoRelacionado = procedimentosBD.value.find(
    (servico) => String(servico.id) === String(servicoId)
  );

  return {
    ...item,
    id: item.id,
    nome: item.nome || "",
    preco: Number(item.valor_total ?? 0),
    quantidade_sessoes: Number(item.quantidade_sessoes ?? 0),
    servico: servicoId == null ? "" : String(servicoId),
    servico_nome:
      item.servico_nome ||
      item.servico?.nome ||
      servicoRelacionado?.nome ||
      "",
    categoria: item.categoria || "",
    descricao: item.descricao || "",
    ativo: Boolean(item.ativo),
  };
};

const carregarProcedimentos = async () => {
  const response = await api.get("/api/servicos/");
  procedimentosBD.value = obterLista(response.data).map(normalizarServico);
};

const carregarPacotes = async () => {
  const response = await api.get("/api/modelos-pacote/");
  pacotesBD.value = obterLista(response.data).map(normalizarPacote);
};

const carregarDados = async () => {
  carregando.value = true;

  try {
    await carregarProcedimentos();
    await carregarPacotes();
  } catch (error) {
    dispararToast(obterMensagemErro(error), "error");
  } finally {
    carregando.value = false;
  }
};

const itensAtuais = computed(() =>
  activeTab.value === "procedimentos"
    ? procedimentosBD.value
    : pacotesBD.value
);

const filteredItems = computed(() => {
  const q = String(searchQuery.value || "").trim().toLowerCase();

  return itensAtuais.value.filter((item) => {
    const nome = String(item.nome || "").toLowerCase();
    const categoria = String(item.categoria || "").toLowerCase();
    const descricao = String(item.descricao || "").toLowerCase();

    return nome.includes(q) || categoria.includes(q) || descricao.includes(q);
  });
});

const totalItens = computed(() => filteredItems.value.length);

const ativosCount = computed(() =>
  filteredItems.value.filter((item) => item.ativo).length
);

const precoMedio = computed(() => {
  if (!filteredItems.value.length) return 0;

  const soma = filteredItems.value.reduce(
    (total, item) => total + Number(item.preco || 0),
    0
  );

  return soma / filteredItems.value.length;
});

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const gerarIniciais = (nome) => {
  if (!nome) return "FX";

  return nome
    .trim()
    .split(/\s+/)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const trocarAba = (aba) => {
  if (activeTab.value === aba) return;

  activeTab.value = aba;
  searchQuery.value = "";
  modalOpen.value = false;
  foiValidado.value = false;
};

const openCreateModal = () => {
  editing.value = false;
  foiValidado.value = false;
  selectedId.value = null;
  form.value = formularioInicial();
  modalOpen.value = true;
};

const editItem = (item) => {
  editing.value = true;
  foiValidado.value = false;
  selectedId.value = item.id;

  form.value = {
    nome: item.nome || "",
    preco: Number(item.preco ?? 0),
    duracao_minutos: Number(item.duracao_minutos || 60),
    quantidade_sessoes: Number(item.quantidade_sessoes || 1),
    servico: item.servico == null ? "" : String(item.servico),
    categoria: item.categoria || "",
    descricao: item.descricao || "",
    ativo: Boolean(item.ativo),
  };

  modalOpen.value = true;
};

const closeModal = () => {
  if (salvando.value) return;
  modalOpen.value = false;
};

const montarPayload = () => {
  const base = {
    nome: form.value.nome.trim(),
    categoria: form.value.categoria.trim(),
    descricao: form.value.descricao.trim(),
    ativo: form.value.ativo,
  };

  if (activeTab.value === "procedimentos") {
    return {
      ...base,
      preco: Number(form.value.preco),
      duracao_padrao_minutos: Number(form.value.duracao_minutos),
    };
  }

  return {
    ...base,
    servico: Number(form.value.servico),
    quantidade_sessoes: Number(form.value.quantidade_sessoes),
    valor_total: Number(form.value.preco),
  };
};

const recarregarAbaAtual = async () => {
  if (activeTab.value === "procedimentos") {
    await carregarProcedimentos();
  } else {
    await carregarProcedimentos();
    await carregarPacotes();
  }
};

const saveItem = async () => {
  if (salvando.value) return;

  if (formRef.value && !formRef.value.checkValidity()) {
    foiValidado.value = true;
    dispararToast("Preencha todos os campos obrigatórios corretamente.", "error");
    formRef.value.querySelector(":invalid")?.focus();
    return;
  }

  if (!form.value.categoria.trim()) {
    foiValidado.value = true;
    dispararToast("Informe a categoria do item.", "error");
    formRef.value?.querySelector('[name="categoria"]')?.focus();
    return;
  }

  if (
    activeTab.value === "pacotes" &&
    !procedimentosAtivos.value.some(
      (item) => String(item.id) === String(form.value.servico)
    )
  ) {
    dispararToast("Selecione um procedimento ativo para vincular ao pacote.", "error");
    return;
  }

  salvando.value = true;

  try {
    const endpoint =
      activeTab.value === "procedimentos"
        ? "/api/servicos/"
        : "/api/modelos-pacote/";

    const payload = montarPayload();

    if (editing.value) {
      await api.patch(`${endpoint}${selectedId.value}/`, payload);
    } else {
      await api.post(endpoint, payload);
    }

    await recarregarAbaAtual();

    dispararToast(
      editing.value
        ? `${activeTab.value === "procedimentos" ? "Procedimento" : "Pacote"} atualizado com sucesso.`
        : `${activeTab.value === "procedimentos" ? "Procedimento" : "Pacote"} criado com sucesso.`
    );

    modalOpen.value = false;
  } catch (error) {
    dispararToast(obterMensagemErro(error), "error");
  } finally {
    salvando.value = false;
  }
};

const deleteItem = async () => {
  if (!editing.value || salvando.value) return;

  const tipo = activeTab.value === "procedimentos" ? "procedimento" : "pacote";
  const confirmado = window.confirm(
    `Deseja desativar este ${tipo}? O registro será mantido no histórico.`
  );

  if (!confirmado) return;

  salvando.value = true;

  try {
    const endpoint =
      activeTab.value === "procedimentos"
        ? "/api/servicos/"
        : "/api/modelos-pacote/";

    await api.patch(`${endpoint}${selectedId.value}/`, { ativo: false });
    await recarregarAbaAtual();

    dispararToast(
      `${tipo.charAt(0).toUpperCase()}${tipo.slice(1)} desativado com sucesso.`
    );

    modalOpen.value = false;
  } catch (error) {
    dispararToast(obterMensagemErro(error), "error");
  } finally {
    salvando.value = false;
  }
};

onMounted(carregarDados);

onBeforeUnmount(() => {
  clearTimeout(toastTimer);
});
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
  width: min(100%, 1600px);
  margin: 0 auto;
  padding: 28px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.action-panel {
  box-sizing: border-box;
  width: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #fdfdfe 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-width: 0;
}

.search-input-wrapper {
  position: relative;
  flex: 1 1 340px;
  min-width: 0;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  box-sizing: border-box;
  width: 100%;
  height: 48px;
  padding: 0 44px 0 46px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  color: #0f172a;
  background: #f8fafc;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.search-input:hover {
  border-color: #94a3b8;
  background: #ffffff;
}

.search-input:focus {
  background: #ffffff;
  border-color: var(--cor-primaria, #1ca4a7);
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  color: #64748b;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-search:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  min-width: 0;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
}

.control-caption {
  padding-left: 2px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.view-toggle {
  box-sizing: border-box;
  display: inline-flex;
  align-items: stretch;
  gap: 4px;
  min-width: 0;
  padding: 4px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #f1f5f9;
}

.btn-view {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: #475569;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view:hover:not(.active) {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.7);
}

.btn-view.active {
  color: var(--cor-primaria, #168f92);
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
}

.btn-novo {
  box-sizing: border-box;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 22px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: var(--cor-primaria, #1ca4a7);
  color: #ffffff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.25);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-novo:hover:not(:disabled) {
  background: #158a8d;
  box-shadow: 0 6px 16px rgba(28, 164, 167, 0.35);
  transform: translateY(-2px);
}

.btn-novo:disabled,
.btn-salvar:disabled,
.btn-excluir:disabled,
.btn-cancelar:disabled,
.btn-close:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.filters-divider {
  width: 100%;
  height: 1px;
  background: #e2e8f0;
}

.filters-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.filters-heading-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-size: 13px;
  font-weight: 700;
}

.filters-heading-title i {
  color: var(--cor-primaria, #1ca4a7);
  font-size: 15px;
}

.filters-description {
  color: #64748b;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--cor-primaria, #1ca4a7);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}

.text-success {
  color: #10b981 !important;
}

.text-info {
  color: #3b82f6 !important;
}

.cards-section-container {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
}

.cards-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.cards-section-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cards-section-header h3 i {
  color: var(--cor-primaria, #1ca4a7);
}

.results-count {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
}

.appointment-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
  box-sizing: border-box;
}

.appointment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -4px rgba(28, 164, 167, 0.12);
  border-color: rgba(28, 164, 167, 0.4);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  min-width: 0;
}

.appointment-time {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  white-space: nowrap;
}

.badge-confirmado {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.badge-cancelado {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.appointment-client-large {
  display: flex;
  align-items: center;
  gap: 12px;
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
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.client-info-wrapper {
  min-width: 0;
  flex: 1;
}

.client-info-wrapper h4 {
  margin: 0 0 2px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 13px;
  font-weight: 700;
  color: var(--cor-primaria, #1ca4a7);
}

.card-divider {
  border: 0;
  border-top: 1px dashed #e2e8f0;
  margin: 0 0 16px;
}

.appointment-details-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 12px;
  min-width: 0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.detail-label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.detail-value {
  font-size: 12px;
  color: #334155;
  font-weight: 500;
  min-width: 0;
}

.font-weight-600 {
  font-weight: 600 !important;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #0f172a;
  white-space: nowrap;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  width: 100%;
}

.linked-service {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f0fdfa;
  color: #0f766e;
  font-size: 11px;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #e2e8f0;
  display: grid;
  place-items: center;
  color: #64748b;
  font-size: 24px;
  margin-bottom: 12px;
}

.empty-state h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.empty-state p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 16px;
  box-sizing: border-box;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - 32px);
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
}

.modal-header-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-header-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(28, 164, 167, 0.2);
  color: var(--cor-primaria, #1ca4a7);
  display: grid;
  place-items: center;
  font-size: 18px;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.modal-header p {
  margin: 3px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.btn-close {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-close:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.05);
}

.modal-form {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  position: relative;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.form-label i {
  color: #94a3b8;
  font-size: 13px;
}

.required-asterisk {
  color: #ef4444;
  margin-left: 2px;
}

.form-control {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  color: #0f172a;
  background-color: #f8fafc;
  font-family: inherit;
  transition: all 0.25s ease;
  box-sizing: border-box;
}

.textarea-control {
  height: auto;
  padding: 12px 14px;
  resize: vertical;
}

.form-control:hover {
  border-color: #94a3b8;
  background-color: #ffffff;
}

.form-control:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}

.form-row {
  display: flex;
  gap: 16px;
}

.flex-1 {
  flex: 1;
  min-width: 0;
}

.mt-2 {
  margin-top: 8px;
}

.field-hint {
  margin: 0;
  color: #b45309;
  font-size: 11px;
}

.status-toggle {
  position: relative;
  display: flex;
  background: #e2e8f0;
  border-radius: 12px;
  height: 48px;
  padding: 4px;
  overflow: hidden;
}

.toggle-option {
  flex: 1;
  text-align: center;
  z-index: 2;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
  user-select: none;
}

.toggle-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.toggle-option.active {
  color: #ffffff;
}

.toggle-slider-2 {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background-color: #10b981;
  border-radius: 9px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.4s ease;
  z-index: 1;
}

.toggle-slider-2.inactive {
  transform: translateX(100%);
  background-color: #ef4444;
}

.error-feedback {
  font-size: 11px;
  color: #ef4444;
  margin-top: 2px;
  opacity: 0;
  height: 0;
  overflow: hidden;
  transition: opacity 0.3s ease, height 0.3s ease;
}

.was-validated .form-control:invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.was-validated .form-group:has(.form-control:invalid) .form-label {
  color: #ef4444;
}

.was-validated .form-control:invalid ~ .error-feedback {
  opacity: 1;
  height: 16px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.footer-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.btn-cancelar {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0 20px;
  height: 44px;
  border-radius: 11px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-cancelar:hover:not(:disabled) {
  background-color: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

.btn-salvar {
  background-color: var(--cor-primaria, #1ca4a7);
  color: #ffffff;
  border: none;
  padding: 0 22px;
  min-height: 44px;
  border-radius: 11px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.25);
}

.btn-salvar:hover:not(:disabled) {
  background-color: #158a8d;
  transform: translateY(-1px);
}

.btn-excluir {
  background: transparent;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0 16px;
  height: 44px;
  border-radius: 11px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: all 0.2s ease;
}

.btn-excluir:hover:not(:disabled) {
  background-color: #fef2f2;
  border-color: #fca5a5;
}

.toast-notification {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 3000;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: min(420px, calc(100vw - 32px));
  padding: 15px 18px;
  border: 1px solid #d1fae5;
  border-radius: 12px;
  background: #ffffff;
  color: #065f46;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.14);
  font-size: 13px;
  font-weight: 600;
}

.toast-notification.error {
  color: #b91c1c;
  border-color: #fecaca;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.list-card-enter-active,
.list-card-leave-active {
  transition: all 0.35s ease;
}

.list-card-enter-from,
.list-card-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .top-row {
    align-items: stretch;
    flex-direction: column;
  }

  .search-input-wrapper {
    max-width: none;
    flex-basis: auto;
  }

  .action-buttons {
    justify-content: space-between;
  }
}

@media (max-width: 640px) {
  .page-content {
    padding: 16px;
  }

  .action-panel {
    padding: 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .cards-section-container {
    padding: 16px;
  }

  .cards-section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .modal-overlay {
    padding: 8px;
  }

  .modal-container {
    max-height: calc(100vh - 16px);
  }

  .modal-header,
  .modal-body {
    padding: 18px;
  }

  .modal-footer {
    flex-wrap: wrap;
    flex-direction: column-reverse;
    gap: 12px;
    padding: 16px 18px;
  }

  .footer-actions {
    width: 100%;
    display: flex;
  }

  .footer-actions button {
    flex: 1;
  }

  .btn-excluir {
    width: 100%;
    justify-content: center;
  }

  .view-toggle {
    width: 100%;
  }

  .btn-view {
    flex: 1;
    padding: 0 10px;
  }

  .btn-novo {
    padding: 0 16px;
  }
}
</style>
