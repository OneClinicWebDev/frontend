<template>
  <Transition name="fade">
    <div class="modal-overlay" v-if="isOpen" @click.self="fechar">
      <Transition name="scale">
        <div class="modal-container">
          <header class="modal-header">
            <h3>{{ tituloModal }}</h3>
            <button class="btn-close" @click="fechar">
              <i class="pi pi-times"></i>
            </button>
          </header>

          <form @submit.prevent="salvar" class="modal-form">
            <div class="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                v-model="form.nome"
                required
                minlength="3"
                :disabled="isDetalhes"
                placeholder="Ex: Ana Luiza Olichta"
              />
            </div>

            <div class="form-group">
              <label>CPF</label>
              <input
                type="text"
                v-model="exibicaoCpf"
                @input="processarCpf"
                required
                maxlength="14"
                :disabled="isDetalhes"
                placeholder="000.000.000-00"
              />
            </div>

            <div class="form-group">
              <label>E-mail</label>
              <input
                type="email"
                v-model="form.email"
                required
                :disabled="isDetalhes"
                placeholder="Ex: anaolichta@email.com"
              />
            </div>

            <div class="form-group">
              <label>Telefone</label>
              <input
                type="text"
                v-model="exibicaoTelefone"
                @input="processarTelefone"
                required
                maxlength="15"
                :disabled="isDetalhes"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label>Status Cadastro</label>
                <select v-model="form.status" :disabled="isDetalhes">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div class="form-group half-width">
                <label>Status Financeiro</label>
                <select v-model="form.statusFinanceiro" :disabled="isDetalhes">
                  <option value="Em dia">Em dia</option>
                  <option value="Em atraso">Em atraso</option>
                </select>
              </div>
            </div>

            <div class="form-group" v-if="mode !== 'criar'">
              <label>Criado em</label>
              <input type="text" v-model="form.criadoEm" disabled />
            </div>

            <footer class="modal-footer">
              <button type="button" class="btn-cancelar" @click="fechar">
                {{ isDetalhes ? "Fechar" : "Cancelar" }}
              </button>
              <button type="submit" class="btn-salvar" v-if="!isDetalhes">
                Confirmar
              </button>
            </footer>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  isOpen: Boolean,
  mode: String,
  clienteEdicao: Object,
});

const emit = defineEmits(["close", "save"]);

const form = ref({
  nome: "",
  cpf: "",
  email: "",
  telefone: "",
  status: "ativo",
  statusFinanceiro: "Em dia",
  criadoEm: "",
});

const exibicaoCpf = ref("");
const exibicaoTelefone = ref("");

const tituloModal = computed(() => {
  if (props.mode === "detalhes") return "Detalhes do Cliente";
  if (props.mode === "editar") return "Editar Cliente";
  return "Novo Cliente";
});

const isDetalhes = computed(() => props.mode === "detalhes");

const aplicarMascaraCpf = (v) => {
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return v;
};

const aplicarMascaraTelefone = (v) => {
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  }
  return v;
};

const processarCpf = (event) => {
  let num = event.target.value.replace(/\D/g, "").slice(0, 11);
  exibicaoCpf.value = aplicarMascaraCpf(num);
  form.value.cpf = exibicaoCpf.value;
};

const processarTelefone = (event) => {
  let num = event.target.value.replace(/\D/g, "").slice(0, 11);
  exibicaoTelefone.value = aplicarMascaraTelefone(num);
  form.value.telefone = exibicaoTelefone.value;
};

watch(
  () => props.isOpen,
  (aberto) => {
    if (aberto) {
      if (props.clienteEdicao && props.mode !== "criar") {
        form.value = { ...props.clienteEdicao };
        exibicaoCpf.value = props.clienteEdicao.cpf;
        exibicaoTelefone.value = props.clienteEdicao.telefone;
      } else {
        form.value = {
          nome: "",
          cpf: "",
          email: "",
          telefone: "",
          status: "ativo",
          statusFinanceiro: "Em dia",
          criadoEm: "",
        };
        exibicaoCpf.value = "";
        exibicaoTelefone.value = "";
      }
    }
  }
);

const fechar = () => {
  emit("close");
};

const salvar = () => {
  if (isDetalhes.value) return;
  emit("save", { ...form.value });
  fechar();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(4, 31, 46, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-container {
  background-color: var(--branco, #fff);
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: var(--cor-escura, #1f2937);
  color: var(--branco, #fff);
}
.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}
.btn-close {
  background: none;
  border: none;
  color: var(--branco, #fff);
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-close:hover {
  opacity: 1;
}
.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.form-row {
  display: flex;
  gap: 1rem;
}
.half-width {
  flex: 1;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cor-secundaria, #6b7280);
}
.form-group input,
.form-group select {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--cor-clara, #e5e7eb);
  border-radius: 6px;
  outline: none;
  font-size: 0.95rem;
  color: var(--cor-escura, #1f2937);
  transition: border-color 0.2s, background-color 0.2s;
}
.form-group input:focus,
.form-group select:focus {
  border-color: var(--cor-primaria, #1ca4a7);
}
.form-group input:disabled,
.form-group select:disabled {
  background-color: var(--cor-fundo, #f9fafb);
  color: var(--cor-secundaria, #9ca3af);
  cursor: not-allowed;
  border-color: rgba(0, 0, 0, 0.05);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.btn-cancelar {
  background: none;
  border: 1px solid var(--cor-clara, #e5e7eb);
  color: var(--cor-secundaria, #6b7280);
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-cancelar:hover {
  background-color: var(--cor-fundo, #f9fafb);
}
.btn-salvar {
  background-color: var(--cor-primaria, #1ca4a7);
  color: var(--branco, #fff);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s, transform 0.1s;
}
.btn-salvar:hover {
  opacity: 0.9;
  transform: translateY(-1px);
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
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.9);
}
</style>