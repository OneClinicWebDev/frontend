<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="fechar">
      <Transition name="scale" appear>
        <section
          v-if="isOpen"
          class="modal-container"
          role="dialog"
          aria-modal="true"
          :aria-label="tituloModal"
        >
          <header class="modal-header">
            <div class="modal-heading">
              <span class="modal-eyebrow">GESTÃO DA EQUIPE</span>
              <h3>{{ tituloModal }}</h3>
              <p>{{ subtituloModal }}</p>
            </div>
            <button class="btn-close" type="button" aria-label="Fechar modal" @click="fechar">
              <i class="pi pi-times"></i>
            </button>
          </header>
          <form class="modal-form" @submit.prevent="salvar">
            <div class="section-heading">
              <span class="section-icon">
                <i class="pi pi-user"></i>
              </span>
              <div>
                <h4>Dados do colaborador</h4>
                <p>Identificação e vínculo com a clínica</p>
              </div>
            </div>
            <div class="form-group">
              <label for="colaborador-nome">Nome completo</label>
              <input
                id="colaborador-nome"
                v-model.trim="form.nome"
                type="text"
                required
                minlength="3"
                maxlength="255"
                autocomplete="name"
                :disabled="isDetalhes || isEdicao || usuarioExistente"
                placeholder="Ex.: Carlos Mendes"
              />
              <span v-if="isEdicao" class="field-hint">
                O nome pertence à identidade global do usuário e não é alterado nesta tela.
              </span>
            </div>
            <div v-if="isCriacao" class="form-group">
              <label for="colaborador-cpf">CPF</label>
              <input
                id="colaborador-cpf"
                :value="exibicaoCpf"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                required
                maxlength="14"
                :disabled="isDetalhes"
                placeholder="000.000.000-00"
                @input="processarCpf"
              />
              <span class="field-hint">
                Se o CPF já existir, será utilizado o usuário correspondente.
              </span>
            </div>
            <div v-if="isEdicao || isDetalhes" class="identity-notice">
              <i class="pi pi-lock"></i>
              <p>
                CPF e demais dados pessoais não são retornados pelo endpoint de colaboradores.
                A identidade global não pode ser alterada por este formulário.
              </p>
            </div>
            <div class="section-divider"></div>
            <div class="section-heading">
              <span class="section-icon">
                <i class="pi pi-shield"></i>
              </span>
              <div>
                <h4>Função e permissões</h4>
                <p>Defina o papel deste vínculo na clínica</p>
              </div>
            </div>
            <div class="form-group">
              <label for="colaborador-funcao">Função</label>
              <select
                id="colaborador-funcao"
                v-model="form.roleId"
                required
                :disabled="isDetalhes"
              >
                <option value="" disabled>Selecione uma função</option>
                <option :value="String(ROLES.ADMIN)">Administrador</option>
                <option :value="String(ROLES.SECRETARIO)">Secretário(a)</option>
                <option :value="String(ROLES.PROFISSIONAL)">Profissional</option>
              </select>
            </div>
            <Transition name="field">
              <div v-if="isProfissional" class="form-group">
                <label>Especialidades</label>
                <div class="tags-builder-container">
                  <div class="tags-list" v-if="form.especialidades.length > 0">
                    <span
                      v-for="(esp, index) in form.especialidades"
                      :key="index"
                      class="tag-pill"
                    >
                      {{ esp }}
                      <button
                        v-if="!isDetalhes"
                        type="button"
                        class="tag-remove"
                        @click="removerEspecialidade(index)"
                      >
                        <i class="pi pi-times"></i>
                      </button>
                    </span>
                  </div>
                  <div v-if="isDetalhes && form.especialidades.length === 0" class="no-tags">
                    Nenhuma especialidade associada.
                  </div>
                  <div v-if="!isDetalhes" class="tag-input-row">
                    <input
                      v-model="novaEspecialidade"
                      type="text"
                      list="tags-suggestions"
                      placeholder="Ex: Massoterapeuta..."
                      @keydown.enter.prevent="adicionarEspecialidade"
                    />
                    <datalist id="tags-suggestions">
                      <option v-for="tag in tagsDisponiveisFiltradas" :key="tag" :value="tag"></option>
                    </datalist>
                    <button type="button" class="btn-add-tag" @click="adicionarEspecialidade">
                      <i class="pi pi-plus"></i> Adicionar
                    </button>
                  </div>
                  <div v-if="!isDetalhes && tagsDisponiveisFiltradas.length > 0" class="quick-tags">
                    <span class="hint">Adicionar rápido:</span>
                    <button 
                      v-for="tag in tagsDisponiveisFiltradas" 
                      :key="tag" 
                      type="button" 
                      class="quick-tag-btn" 
                      @click="adicionarEspecialidadePronta(tag)"
                    >
                      + {{ tag }}
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
            <Transition name="field">
              <div v-if="isProfissional" class="permission-card">
                <div class="permission-icon">
                  <i class="pi pi-calendar"></i>
                </div>
                <div class="permission-content">
                  <strong>Editar agenda</strong>
                  <p>
                    Permite editar a agenda conforme as regras de autonomia configuradas pela clínica.
                  </p>
                </div>
                <label class="switch" aria-label="Permitir edição da agenda">
                  <input
                    v-model="form.pode_editar_agenda"
                    type="checkbox"
                    :disabled="isDetalhes"
                  />
                  <span class="switch-track"></span>
                </label>
              </div>
            </Transition>
            <div v-if="!isCriacao" class="status-panel">
              <div class="status-panel-icon">
                <i :class="ativo ? 'pi pi-check-circle' : 'pi pi-pause-circle'"></i>
              </div>
              <div class="status-panel-content">
                <strong>Estado do vínculo</strong>
                <p>
                  {{ ativo
                    ? 'Este colaborador está ativo nesta clínica.'
                    : 'Este colaborador está inativo nesta clínica.' }}
                </p>
              </div>
              <span :class="['status-pill', ativo ? 'status-active' : 'status-inactive']">
                {{ ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            <div v-if="isDetalhes" class="details-summary">
              <div class="summary-item">
                <span>Função</span>
                <strong>{{ funcaoAtual }}</strong>
              </div>
              <div class="summary-item">
                <span>Edição de agenda</span>
                <strong>{{ form.pode_editar_agenda ? 'Habilitada' : 'Não habilitada' }}</strong>
              </div>
              <div class="summary-item">
                <span>Identificador do vínculo</span>
                <strong class="identifier-value">{{ colaboradorEdicao?.id || 'Indisponível' }}</strong>
              </div>
            </div>
            <footer class="modal-footer">
              <button class="btn-cancelar" type="button" @click="fechar">
                {{ isDetalhes ? 'Fechar' : 'Cancelar' }}
              </button>
              <button v-if="!isDetalhes" class="btn-salvar" type="submit">
                <i :class="isEdicao ? 'pi pi-check' : 'pi pi-plus'"></i>
                {{ isEdicao ? 'Salvar alterações' : 'Cadastrar colaborador' }}
              </button>
            </footer>
          </form>
        </section>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import api from "@/services/api.js";

const ROLES = {
  ADMIN: 1,
  SECRETARIO: 2,
  PROFISSIONAL: 3,
};

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: "criar",
  },
  colaboradorEdicao: {
    type: Object,
    default: null,
  },
  tagsDisponiveis: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["close", "save"]);

const form = ref({
  id: null,
  nome: "",
  cpf: "",
  roleId: "",
  pode_editar_agenda: false,
  especialidades: []
});

const exibicaoCpf = ref("");
const novaEspecialidade = ref("");
const usuarioExistente = ref(false);

const isDetalhes = computed(() => props.mode === "detalhes");
const isEdicao = computed(() => props.mode === "editar");
const isCriacao = computed(() => props.mode === "criar");

const isProfissional = computed(
  () => Number(form.value.roleId) === ROLES.PROFISSIONAL,
);

const ativo = computed(() => Boolean(props.colaboradorEdicao?.ativo));

const tagsDisponiveisFiltradas = computed(() => {
  const currentTags = form.value.especialidades || [];
  return props.tagsDisponiveis.filter(tag => !currentTags.includes(tag));
});

const funcaoAtual = computed(() => {
  const funcoes = {
    [ROLES.ADMIN]: "Administrador",
    [ROLES.SECRETARIO]: "Secretário(a)",
    [ROLES.PROFISSIONAL]: "Profissional",
  };
  return funcoes[Number(form.value.roleId)] || "Não definida";
});

const tituloModal = computed(() => {
  if (isDetalhes.value) return "Detalhes do colaborador";
  if (isEdicao.value) return "Editar colaborador";
  return "Novo colaborador";
});

const subtituloModal = computed(() => {
  if (isDetalhes.value) return "Consulte as informações deste vínculo.";
  if (isEdicao.value) return "Atualize a função e as permissões disponíveis.";
  return "Cadastre uma pessoa para integrar a equipe da clínica.";
});

function aplicarMascaraCpf(valor) {
  const numeros = String(valor || "").replace(/\D/g, "").slice(0, 11);
  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

async function verificarCpfUsuario(cpfLimpo) {
  if (cpfLimpo.length !== 11) {
    usuarioExistente.value = false;
    return;
  }
  try {
    const res = await api.get(`/api/usuarios/buscar/?cpf=${cpfLimpo}`);
    if (res.data && res.data.id) {
      usuarioExistente.value = true;
      form.value.nome = res.data.nome_completo;
    } else {
      usuarioExistente.value = false;
    }
  } catch {
    usuarioExistente.value = false;
  }
}

function processarCpf(event) {
  exibicaoCpf.value = aplicarMascaraCpf(event.target.value);
  form.value.cpf = exibicaoCpf.value.replace(/\D/g, "");
  if (form.value.cpf.length === 11) {
    verificarCpfUsuario(form.value.cpf);
  }
}

function adicionarEspecialidade() {
  const tag = novaEspecialidade.value.trim();
  if (tag && !form.value.especialidades.includes(tag)) {
    form.value.especialidades.push(tag);
  }
  novaEspecialidade.value = "";
}

function adicionarEspecialidadePronta(tag) {
  if (tag && !form.value.especialidades.includes(tag)) {
    form.value.especialidades.push(tag);
  }
}

function removerEspecialidade(index) {
  form.value.especialidades.splice(index, 1);
}

function carregarFormulario() {
  const colaborador = props.colaboradorEdicao;
  if (colaborador && !isCriacao.value) {
    form.value = {
      id: colaborador.id || null,
      nome: colaborador.nome || "",
      cpf: "",
      roleId: String(colaborador.roleId || ""),
      pode_editar_agenda: Boolean(colaborador.pode_editar_agenda),
      especialidades: Array.isArray(colaborador.especialidades) ? [...colaborador.especialidades] : []
    };
    exibicaoCpf.value = "";
    novaEspecialidade.value = "";
    return;
  }
  form.value = {
    id: null,
    nome: "",
    cpf: "",
    roleId: "",
    pode_editar_agenda: false,
    especialidades: []
  };
  exibicaoCpf.value = "";
  novaEspecialidade.value = "";
  usuarioExistente.value = false;
}

watch(
  () => [props.isOpen, props.mode, props.colaboradorEdicao],
  ([aberto]) => {
    if (aberto) carregarFormulario();
  },
  { immediate: true },
);

watch(
  () => form.value.roleId,
  (roleId) => {
    if (Number(roleId) !== ROLES.PROFISSIONAL) {
      form.value.pode_editar_agenda = false;
      form.value.especialidades = [];
    }
  },
);

function fechar() {
  emit("close");
}

function salvar() {
  if (isDetalhes.value) return;
  const nome = form.value.nome.trim();
  if (nome.length < 3) return;
  const roleId = Number(form.value.roleId);
  if (![ROLES.ADMIN, ROLES.SECRETARIO, ROLES.PROFISSIONAL].includes(roleId)) return;
  if (isCriacao.value && form.value.cpf.replace(/\D/g, "").length !== 11) return;
  
  const especialidadesPayload = roleId === ROLES.PROFISSIONAL ? form.value.especialidades : [];

  if (isCriacao.value) {
    emit("save", {
      nome,
      cpf: form.value.cpf.replace(/\D/g, ""),
      roleId,
      pode_editar_agenda: roleId === ROLES.PROFISSIONAL && form.value.pode_editar_agenda,
      especialidades: especialidadesPayload
    });
    return;
  }
  emit("save", {
    id: form.value.id,
    nome,
    roleId,
    pode_editar_agenda: roleId === ROLES.PROFISSIONAL && form.value.pode_editar_agenda,
    especialidades: especialidadesPayload
  });
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.modal-overlay {
  position: fixed;
  inset: 0;
  padding: 1rem;
  background-color: rgb(15 23 42 / 45%);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  font-family: "Inter", sans-serif;
}
.modal-container {
  background-color: #fff;
  border: 1px solid rgb(226 232 240 / 85%);
  border-radius: 18px;
  width: 100%;
  max-width: 650px;
  box-shadow: 0 25px 60px -15px rgb(15 23 42 / 30%);
  overflow: hidden;
  max-height: min(90vh, 900px);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 1.6rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f0fdfa 100%);
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
}
.modal-heading {
  min-width: 0;
}
.modal-eyebrow {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #0f999b;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.4;
  font-weight: 700;
  color: #1e293b;
}
.modal-header p {
  margin: 0.4rem 0 0;
  font-size: 0.84rem;
  line-height: 1.5;
  color: #64748b;
}
.btn-close {
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.btn-close:hover {
  background: #f1f5f9;
  color: #0f172a;
  transform: rotate(4deg);
}
.modal-form {
  padding: 1.5rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  overflow-y: auto;
}
.section-heading {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #f0fdfa;
  color: #0f999b;
  border: 1px solid #ccfbf1;
}
.section-heading h4 {
  margin: 0;
  color: #334155;
  font-size: 0.93rem;
  font-weight: 700;
}
.section-heading p {
  margin: 0.25rem 0 0;
  color: #94a3b8;
  font-size: 0.77rem;
  line-height: 1.45;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-size: 0.83rem;
  font-weight: 600;
  color: #475569;
}
.form-group input:not([type="checkbox"]),
.form-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 0.95rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  font-size: 0.92rem;
  color: #334155;
  transition: border-color 0.22s ease, background-color 0.22s ease, box-shadow 0.22s ease;
  background-color: #f8fafc;
  font-family: inherit;
}
.form-group input:focus:not([type="checkbox"]),
.form-group select:focus {
  border-color: #1ca4a7;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgb(28 164 167 / 11%);
}
.form-group input:disabled,
.form-group select:disabled {
  background-color: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
  border-color: #e2e8f0;
}
.field-hint {
  color: #94a3b8;
  font-size: 0.76rem;
  line-height: 1.5;
}
.identity-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
}
.identity-notice i {
  color: #0f999b;
  margin-top: 0.1rem;
}
.identity-notice p {
  margin: 0;
  font-size: 0.79rem;
  line-height: 1.55;
}
.section-divider {
  width: 100%;
  height: 1px;
  background: #e2e8f0;
  margin: 0.25rem 0;
}
.tags-builder-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background-color: #f8fafc;
}
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background-color: #1ca4a7;
  color: #fff;
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgb(28 164 167 / 20%);
}
.tag-remove {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
  width: 16px;
  height: 16px;
}
.tag-remove:hover {
  opacity: 1;
}
.no-tags {
  font-size: 0.8rem;
  color: #64748b;
  font-style: italic;
}
.tag-input-row {
  display: flex;
  gap: 0.5rem;
}
.tag-input-row input {
  flex: 1;
  padding: 0.7rem 0.9rem !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  background: #fff !important;
}
.btn-add-tag {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 1rem;
  background: #0f999b;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-add-tag:hover {
  background: #0d8385;
}
.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}
.quick-tags .hint {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  margin-right: 0.2rem;
}
.quick-tag-btn {
  background-color: #fff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-tag-btn:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  color: #0f999b;
}
.permission-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  background: linear-gradient(120deg, #f0fdfa 0%, #f8fafc 100%);
  border: 1px solid #ccfbf1;
  border-radius: 12px;
}
.permission-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: #0f999b;
  background: #fff;
  border: 1px solid #d1fae5;
}
.permission-content {
  flex: 1;
  min-width: 0;
}
.permission-content strong {
  color: #334155;
  font-size: 0.84rem;
}
.permission-content p {
  margin: 0.3rem 0 0;
  color: #64748b;
  font-size: 0.76rem;
  line-height: 1.5;
}
.switch {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  cursor: pointer;
}
.switch input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.switch-track {
  width: 44px;
  height: 25px;
  border-radius: 30px;
  background: #cbd5e1;
  transition: background-color 0.22s ease, box-shadow 0.22s ease;
}
.switch-track::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 15%);
  transition: transform 0.22s ease;
}
.switch input:checked + .switch-track {
  background: #1ca4a7;
}
.switch input:checked + .switch-track::after {
  transform: translateX(19px);
}
.switch input:focus-visible + .switch-track {
  box-shadow: 0 0 0 3px rgb(28 164 167 / 20%);
}
.switch input:disabled + .switch-track {
  opacity: 0.6;
  cursor: not-allowed;
}
.status-panel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.95rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}
.status-panel-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
}
.status-panel-content {
  flex: 1;
  min-width: 0;
}
.status-panel-content strong {
  color: #334155;
  font-size: 0.83rem;
}
.status-panel-content p {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.76rem;
  line-height: 1.45;
}
.status-pill {
  padding: 0.3rem 0.65rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
}
.status-active {
  background: #dcfce7;
  color: #15803d;
}
.status-inactive {
  background: #e2e8f0;
  color: #475569;
}
.details-summary {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}
.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.summary-item span {
  color: #94a3b8;
  font-size: 0.73rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.summary-item strong {
  color: #334155;
  font-size: 0.83rem;
  font-weight: 600;
}
.identifier-value {
  overflow-wrap: anywhere;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  color: #64748b !important;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.35rem;
  padding-top: 1.2rem;
  border-top: 1px solid #e2e8f0;
}
.btn-cancelar,
.btn-salvar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.15rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 600;
  transition: background-color 0.22s ease, color 0.22s ease, border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
  font-family: inherit;
}
.btn-cancelar {
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
}
.btn-cancelar:hover {
  background: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}
.btn-salvar {
  background-color: #1ca4a7;
  color: #fff;
  border: 1px solid #1ca4a7;
}
.btn-salvar:hover {
  background-color: #158a8d;
  border-color: #158a8d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(28 164 167 / 20%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.scale-enter-active,
.scale-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(8px);
}
.field-enter-active,
.field-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.field-enter-from,
.field-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
@media (max-width: 600px) {
  .modal-overlay {
    padding: 0.6rem;
    align-items: center;
  }
  .modal-container {
    max-height: 94vh;
    border-radius: 15px;
  }
  .modal-header {
    padding: 1.2rem;
  }
  .modal-form {
    padding: 1.2rem;
    gap: 1rem;
  }
  .permission-card {
    gap: 0.65rem;
    padding: 0.8rem;
  }
  .permission-icon {
    width: 34px;
    height: 34px;
  }
  .modal-footer {
    flex-direction: column-reverse;
  }
  .btn-cancelar,
  .btn-salvar {
    width: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .scale-enter-active,
  .scale-leave-active,
  .field-enter-active,
  .field-leave-active,
  .btn-close,
  .btn-cancelar,
  .btn-salvar {
    transition-duration: 0.01ms;
  }
}
</style>