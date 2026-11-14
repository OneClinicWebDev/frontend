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
            <button
              class="btn-close"
              type="button"
              aria-label="Fechar modal"
              @click="fechar"
            >
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
                O nome pertence à identidade global do usuário e não é alterado nesta
                tela.
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
                CPF e demais dados pessoais não são retornados pelo endpoint de
                colaboradores. A identidade global não pode ser alterada por este
                formulário.
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
                :disabled="isDetalhes || roleBloqueado"
              >
                <option value="" disabled>Selecione uma função</option>
                <option v-if="permiteRole(ROLES.ADMIN)" :value="String(ROLES.ADMIN)">
                  Administrador
                </option>
                <option
                  v-if="permiteRole(ROLES.SECRETARIO)"
                  :value="String(ROLES.SECRETARIO)"
                >
                  Secretário(a)
                </option>
                <option
                  v-if="permiteRole(ROLES.PROFISSIONAL)"
                  :value="String(ROLES.PROFISSIONAL)"
                >
                  Profissional
                </option>
              </select>
              <span v-if="roleBloqueado && !isDetalhes" class="field-hint">
                Somente administradores podem alterar o próprio papel.
              </span>
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
                  <div
                    v-if="isDetalhes && form.especialidades.length === 0"
                    class="no-tags"
                  >
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
                      <option
                        v-for="tag in tagsDisponiveisFiltradas"
                        :key="tag"
                        :value="tag"
                      ></option>
                    </datalist>
                    <button
                      type="button"
                      class="btn-add-tag"
                      @click="adicionarEspecialidade"
                    >
                      <i class="pi pi-plus"></i> Adicionar
                    </button>
                  </div>
                  <div
                    v-if="!isDetalhes && tagsDisponiveisFiltradas.length > 0"
                    class="quick-tags"
                  >
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
                    Permite editar a agenda conforme as regras de autonomia configuradas
                    pela clínica.
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
                  {{
                    ativo
                      ? "Este colaborador está ativo nesta clínica."
                      : "Este colaborador está inativo nesta clínica."
                  }}
                </p>
              </div>
              <span :class="['status-pill', ativo ? 'status-active' : 'status-inactive']">
                {{ ativo ? "Ativo" : "Inativo" }}
              </span>
            </div>
            <div v-if="isDetalhes" class="details-summary">
              <div class="summary-item">
                <span>Função</span>
                <strong>{{ funcaoAtual }}</strong>
              </div>
              <div class="summary-item">
                <span>Edição de agenda</span>
                <strong>{{
                  form.pode_editar_agenda ? "Habilitada" : "Não habilitada"
                }}</strong>
              </div>
              <div class="summary-item">
                <span>Identificador do vínculo</span>
                <strong class="identifier-value">{{
                  colaboradorEdicao?.id || "Indisponível"
                }}</strong>
              </div>
              <div class="summary-item">
                <span>Criado em</span>
                <strong>{{ formatarDataHora(colaboradorEdicao?.criadoEm) }}</strong>
              </div>
              <div class="summary-item">
                <span>Atualizado em</span>
                <strong>{{ formatarDataHora(colaboradorEdicao?.atualizadoEm) }}</strong>
              </div>
            </div>
            <footer class="modal-footer">
              <button class="btn-cancelar" type="button" @click="fechar">
                {{ isDetalhes ? "Fechar" : "Cancelar" }}
              </button>
              <button
                v-if="!isDetalhes"
                class="btn-salvar"
                type="submit"
                :disabled="salvando"
              >
                <i
                  :class="
                    salvando
                      ? 'pi pi-spin pi-spinner'
                      : isEdicao
                      ? 'pi pi-check'
                      : 'pi pi-plus'
                  "
                ></i>
                {{
                  salvando
                    ? "Salvando..."
                    : isEdicao
                    ? "Salvar alterações"
                    : "Cadastrar colaborador"
                }}
              </button>
            </footer>
          </form>
        </section>
      </Transition>
    </div>
  </Transition>
</template>
<script setup>
import { formatarDataHora } from "@/utils/datas";
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
    default: () => [],
  },
  salvando: {
    type: Boolean,
    default: false,
  },
  rolesPermitidos: {
    type: Array,
    default: () => [1, 2, 3],
  },
  roleBloqueado: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["close", "save"]);
const form = ref({
  id: null,
  nome: "",
  cpf: "",
  roleId: "",
  pode_editar_agenda: false,
  especialidades: [],
});
const exibicaoCpf = ref("");
const novaEspecialidade = ref("");
const usuarioExistente = ref(false);
const isDetalhes = computed(() => props.mode === "detalhes");
const isEdicao = computed(() => props.mode === "editar");
const isCriacao = computed(() => props.mode === "criar");
function permiteRole(id) {
  return props.rolesPermitidos.includes(id) || Number(form.value.roleId) === id;
}
const isProfissional = computed(() => Number(form.value.roleId) === ROLES.PROFISSIONAL);
const ativo = computed(() => Boolean(props.colaboradorEdicao?.ativo));
const tagsDisponiveisFiltradas = computed(() => {
  const currentTags = form.value.especialidades || [];
  return props.tagsDisponiveis.filter((tag) => !currentTags.includes(tag));
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
  const numeros = String(valor || "")
    .replace(/\D/g, "")
    .slice(0, 11);
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
function especialidadeJaExiste(tag) {
  const chave = tag.toLocaleLowerCase("pt-BR");
  return form.value.especialidades.some(
    (item) => String(item).trim().toLocaleLowerCase("pt-BR") === chave
  );
}
function adicionarEspecialidade() {
  const tag = novaEspecialidade.value.trim().replace(/\s+/g, " ");
  if (tag && !especialidadeJaExiste(tag)) {
    form.value.especialidades.push(tag);
  }
  novaEspecialidade.value = "";
}
function adicionarEspecialidadePronta(tag) {
  if (tag && !especialidadeJaExiste(tag)) {
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
      especialidades: Array.isArray(colaborador.especialidades)
        ? [...colaborador.especialidades]
        : [],
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
    especialidades: [],
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
  { immediate: true }
);
watch(
  () => form.value.roleId,
  (roleId) => {
    if (Number(roleId) !== ROLES.PROFISSIONAL) {
      form.value.pode_editar_agenda = false;
      form.value.especialidades = [];
    }
  }
);
function fechar() {
  emit("close");
}
function salvar() {
  if (isDetalhes.value || props.salvando) return;
  const nome = form.value.nome.trim();
  if (nome.length < 3) return;
  const roleId = Number(form.value.roleId);
  if (![ROLES.ADMIN, ROLES.SECRETARIO, ROLES.PROFISSIONAL].includes(roleId)) return;
  if (isCriacao.value && form.value.cpf.replace(/\D/g, "").length !== 11) return;
  const especialidadesPayload =
    roleId === ROLES.PROFISSIONAL ? form.value.especialidades : [];
  if (isCriacao.value) {
    emit("save", {
      nome,
      cpf: form.value.cpf.replace(/\D/g, ""),
      roleId,
      pode_editar_agenda: roleId === ROLES.PROFISSIONAL && form.value.pode_editar_agenda,
      especialidades: especialidadesPayload,
    });
    return;
  }
  emit("save", {
    id: form.value.id,
    nome,
    roleId,
    pode_editar_agenda: roleId === ROLES.PROFISSIONAL && form.value.pode_editar_agenda,
    especialidades: especialidadesPayload,
  });
}
</script>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
.modal-overlay {
  position: fixed;
  inset: 0;
  padding: 16px;
  box-sizing: border-box;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  font-family: "Inter", sans-serif;
}
.modal-container {
  background-color: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 650px;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  overflow: hidden;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #fff;
}
.modal-heading {
  min-width: 0;
}
.modal-eyebrow {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #2dd4bf;
}
.modal-header h3 {
  margin: 0;
  font-size: 17px;
  line-height: 1.4;
  font-weight: 600;
  color: #fff;
}
.modal-header p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #94a3b8;
}
.btn-close {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-close:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.05);
}
.modal-form {
  padding: 24px 24px 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  background: rgba(28, 164, 167, 0.12);
  color: var(--cor-primaria, #1ca4a7);
  border: 1px solid rgba(28, 164, 167, 0.2);
}
.section-heading h4 {
  margin: 0;
  color: #1e293b;
  font-size: 15px;
  font-weight: 600;
}
.section-heading p {
  margin: 3px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.45;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}
.form-group input:not([type="checkbox"]),
.form-group select {
  width: 100%;
  box-sizing: border-box;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  color: #0f172a;
  transition: all 0.25s ease;
  background-color: #f8fafc;
  font-family: inherit;
}
.form-group input:hover:not(:disabled):not([type="checkbox"]),
.form-group select:hover:not(:disabled) {
  border-color: #94a3b8;
  background-color: #fff;
}
.form-group input:focus:not([type="checkbox"]),
.form-group select:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.form-group input:disabled,
.form-group select:disabled {
  background-color: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
  border-color: #e2e8f0;
}
.field-hint {
  color: #b45309;
  font-size: 11px;
  line-height: 1.5;
}
.identity-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
}
.identity-notice i {
  color: var(--cor-primaria, #1ca4a7);
  margin-top: 0.1rem;
}
.identity-notice p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
}
.section-divider {
  width: 100%;
  height: 0;
  border-top: 1px dashed #e2e8f0;
  margin: 2px 0;
}
.tags-builder-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
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
  background-color: var(--cor-primaria, #1ca4a7);
  color: #fff;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(28, 164, 167, 0.25);
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
  padding: 0 14px !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 12px !important;
  background: #fff !important;
}
.btn-add-tag {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 16px;
  background: #0f999b;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.2);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-add-tag:hover {
  background: #0d8385;
  transform: translateY(-1px);
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
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
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
  padding: 16px;
  background: linear-gradient(120deg, #f0fdfa 0%, #f8fafc 100%);
  border: 1px solid #ccfbf1;
  border-radius: 14px;
}
.permission-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  color: #0f999b;
  background: #fff;
  border: 1px solid #99f6e4;
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
  transition: background-color 0.3s ease, box-shadow 0.25s ease;
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
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
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
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
}
.status-panel-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 12px;
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
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}
.status-active {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.status-inactive {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.details-summary {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}
.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-item + .summary-item {
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
}
.summary-item span {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.summary-item strong {
  color: #334155;
  font-size: 13px;
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
  gap: 12px;
  margin: 6px -24px 0;
  padding: 18px 24px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
  position: sticky;
  bottom: 0;
}
.btn-cancelar,
.btn-salvar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 22px;
  border-radius: 11px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}
.btn-cancelar {
  background: #fff;
  border: 1px solid #cbd5e1;
  color: #475569;
}
.btn-cancelar:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}
.btn-salvar {
  background-color: var(--cor-primaria, #1ca4a7);
  color: #fff;
  border: 1px solid transparent;
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.25);
}
.btn-salvar:hover {
  background-color: #158a8d;
  border-color: #158a8d;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(28, 164, 167, 0.35);
}
.btn-salvar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.scale-enter-active,
.scale-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
@media (max-width: 640px) {
  .modal-overlay {
    padding: 8px;
    align-items: center;
  }
  .modal-container {
    max-height: calc(100vh - 16px);
  }
  .modal-header {
    padding: 18px;
  }
  .modal-form {
    padding: 18px 18px 0;
    gap: 16px;
  }
  .modal-footer {
    margin: 6px -18px 0;
    padding: 16px 18px;
  }
  .tag-input-row {
    flex-direction: column;
  }
  .tag-input-row input,
  .btn-add-tag {
    min-height: 44px;
  }
  .btn-add-tag {
    justify-content: center;
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
