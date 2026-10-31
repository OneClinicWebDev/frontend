<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="fechar">
      <Transition name="scale">
        <div v-if="isOpen && agendamento" class="modal-container" role="dialog" aria-modal="true">
          <header class="modal-header" :class="modo">
            <div>
              <h3>{{ titulo }}</h3>
              <p class="header-subtitle">{{ subtitulo }}</p>
            </div>
            <button type="button" class="btn-close" aria-label="Fechar" @click="fechar">
              <i class="pi pi-times"></i>
            </button>
          </header>

          <form class="modal-form" novalidate @submit.prevent="confirmar">
            <div class="modal-body">
              <div class="resumo">
                <div class="resumo-linha">
                  <i class="pi pi-user"></i>
                  <strong>{{ agendamento.cliente }}</strong>
                </div>
                <div class="resumo-linha">
                  <i class="pi pi-tag"></i>
                  <span>{{ agendamento.servico }} • {{ agendamento.profissional }}</span>
                </div>
                <div class="resumo-linha">
                  <i class="pi pi-calendar"></i>
                  <span>
                    {{ formatarDataBR(agendamento.dataInicio) }} •
                    {{ agendamento.horaInicio }} às {{ agendamento.horaFim }}
                  </span>
                </div>
                <div v-if="agendamento.pacoteNome" class="resumo-linha">
                  <i class="pi pi-box"></i>
                  <span>Pacote: {{ agendamento.pacoteNome }}</span>
                </div>
              </div>

              <div v-if="erro" class="alerta-erro" role="alert">
                <i class="pi pi-exclamation-circle"></i>
                <span>{{ erro }}</span>
              </div>

              <template v-if="modo === 'cancelar'">
                <div class="form-group">
                  <label for="motivo-cancelamento">
                    Motivo do cancelamento <span class="required-asterisk">*</span>
                  </label>
                  <input
                    id="motivo-cancelamento"
                    v-model="motivo"
                    type="text"
                    class="form-control"
                    :class="{ 'input-invalid': foiValidado && !motivoValido }"
                    maxlength="50"
                    placeholder="Ex.: Cliente solicitou remarcação"
                    autocomplete="off"
                  />
                  <div class="campo-rodape">
                    <span v-if="foiValidado && !motivoValido" class="error-feedback">
                      Informe o motivo do cancelamento.
                    </span>
                    <span class="contador">{{ motivo.length }}/50</span>
                  </div>
                </div>

                <p class="nota">
                  O agendamento permanece no histórico com o status Cancelado. Se
                  houver pacote vinculado, o sistema aplica as regras do pacote.
                </p>
              </template>

              <template v-else>
                <div v-if="exigeDecisao" class="form-group">
                  <label>
                    O que fazer com a sessão do pacote?
                    <span class="required-asterisk">*</span>
                  </label>

                  <div class="opcoes-decisao">
                    <label
                      class="opcao"
                      :class="{ ativa: decisao === 'PRESERVAR' }"
                    >
                      <input v-model="decisao" type="radio" value="PRESERVAR" />
                      <span class="opcao-texto">
                        <strong>Preservar sessão</strong>
                        <small>A sessão volta a ficar disponível no pacote.</small>
                      </span>
                    </label>

                    <label class="opcao" :class="{ ativa: decisao === 'PERDER' }">
                      <input v-model="decisao" type="radio" value="PERDER" />
                      <span class="opcao-texto">
                        <strong>Perder sessão</strong>
                        <small>A sessão é registrada como perdida.</small>
                      </span>
                    </label>
                  </div>

                  <span v-if="foiValidado && !decisaoValida" class="error-feedback">
                    Escolha preservar ou perder a sessão.
                  </span>
                </div>

                <div v-if="exigeDecisao || corrigindoConcluido" class="form-group">
                  <label for="justificativa-falta">
                    Justificativa
                    <span v-if="corrigindoConcluido" class="required-asterisk">*</span>
                  </label>
                  <textarea
                    id="justificativa-falta"
                    v-model="justificativa"
                    class="form-control textarea"
                    :class="{ 'input-invalid': foiValidado && !justificativaValida }"
                    rows="3"
                    :placeholder="
                      corrigindoConcluido
                        ? 'Explique por que o resultado está sendo corrigido.'
                        : 'Opcional: explique a decisão tomada.'
                    "
                  ></textarea>
                  <span v-if="foiValidado && !justificativaValida" class="error-feedback">
                    Informe a justificativa da correção.
                  </span>
                </div>

                <p v-if="corrigindoConcluido" class="nota">
                  Este atendimento já foi concluído. A correção altera o resultado
                  para Falta e fica registrada na auditoria do sistema.
                </p>
                <p v-else class="nota">
                  A falta encerra o agendamento com o resultado Falta. Esta ação
                  não pode ser desfeita pela tela.
                </p>
              </template>
            </div>

            <footer class="modal-footer">
              <button type="button" class="btn-voltar" @click="fechar">Voltar</button>
              <button
                type="submit"
                :class="['btn-confirmar', modo]"
                :disabled="processando"
              >
                <i :class="processando ? 'pi pi-spin pi-spinner' : iconeConfirmar"></i>
                {{ processando ? "Processando..." : rotuloConfirmar }}
              </button>
            </footer>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { formatarDataBR } from "@/utils/agendamentos";

const props = defineProps({
  isOpen: Boolean,
  modo: { type: String, default: "cancelar" },
  agendamento: { type: Object, default: null },
  processando: Boolean,
  erro: { type: String, default: "" },
});

const emit = defineEmits(["close", "confirmar"]);

const motivo = ref("");
const decisao = ref("");
const justificativa = ref("");
const foiValidado = ref(false);

const titulo = computed(() =>
  props.modo === "cancelar" ? "Cancelar agendamento" : "Registrar falta"
);

const subtitulo = computed(() =>
  props.modo === "cancelar"
    ? "Informe o motivo para manter o histórico do atendimento."
    : "Registre que o cliente não compareceu ao atendimento."
);

const rotuloConfirmar = computed(() =>
  props.modo === "cancelar" ? "Cancelar agendamento" : "Registrar falta"
);

const iconeConfirmar = computed(() =>
  props.modo === "cancelar" ? "pi pi-ban" : "pi pi-user-minus"
);

const corrigindoConcluido = computed(
  () => props.modo === "falta" && Boolean(props.agendamento?.corrigeConcluido)
);

const exigeDecisao = computed(
  () =>
    props.modo === "falta" &&
    (props.agendamento?.sessaoPacoteStatus === "AGENDADA" ||
      (corrigindoConcluido.value &&
        props.agendamento?.sessaoPacoteStatus === "UTILIZADA"))
);

const motivoValido = computed(() => motivo.value.trim().length > 0);
const justificativaValida = computed(
  () => !corrigindoConcluido.value || justificativa.value.trim().length > 0
);
const decisaoValida = computed(() =>
  ["PRESERVAR", "PERDER"].includes(decisao.value)
);

const fechar = () => {
  if (props.processando) return;
  emit("close");
};

const confirmar = () => {
  foiValidado.value = true;

  if (props.modo === "cancelar") {
    if (!motivoValido.value) return;

    emit("confirmar", { motivo: motivo.value.trim().slice(0, 50) });
    return;
  }

  if (!justificativaValida.value) return;

  if (exigeDecisao.value) {
    if (!decisaoValida.value) return;

    emit("confirmar", {
      decisao_sessao: decisao.value,
      justificativa: justificativa.value.trim(),
    });
    return;
  }

  if (corrigindoConcluido.value) {
    emit("confirmar", { justificativa: justificativa.value.trim() });
    return;
  }

  emit("confirmar", {});
};

watch(
  () => props.isOpen,
  (aberto) => {
    if (!aberto) return;

    motivo.value = "";
    decisao.value = "";
    justificativa.value = "";
    foiValidado.value = false;
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  background: rgba(4, 31, 46, 0.42);
  backdrop-filter: blur(5px);
  font-family: Inter, sans-serif;
}

.modal-container {
  width: 100%;
  max-width: 520px;
  max-height: calc(100dvh - 2rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e8edf2;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
}

.modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: #1f2937;
  color: #fff;
}

.modal-header.cancelar {
  background: #7f1d1d;
}

.modal-header.falta {
  background: #9a3412;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 0.35rem 0 0;
  color: #e2e8f0;
  font-size: 0.8rem;
}

.btn-close {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.18);
}

.modal-form {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.modal-body {
  min-height: 0;
  padding: 1.35rem 1.5rem 0.4rem;
  overflow-y: auto;
}

.resumo {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-bottom: 1.2rem;
  padding: 0.95rem 1.05rem;
  border: 1px solid #e7edf2;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  font-size: 0.85rem;
}

.resumo-linha {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.resumo-linha i {
  color: #64748b;
  font-size: 0.85rem;
}

.alerta-erro {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 1.1rem;
  padding: 0.85rem 1rem;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 0.84rem;
  line-height: 1.45;
}

.alerta-erro i {
  margin-top: 2px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.1rem;
}

.form-group > label {
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
}

.required-asterisk {
  color: #ef4444;
}

.form-control {
  display: block;
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  padding: 0.75rem 0.9rem;
  border: 1px solid #dfe6ee;
  border-radius: 10px;
  outline: none;
  background: #fff;
  color: #1f2937;
  font-family: inherit;
  font-size: 0.88rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  border-color: #1ca4a7;
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.12);
}

.form-control.input-invalid {
  border-color: #ef4444;
  background: #fffafa;
}

.textarea {
  min-height: 84px;
  resize: vertical;
}

.campo-rodape {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.contador {
  margin-left: auto;
  color: #94a3b8;
  font-size: 0.75rem;
}

.error-feedback {
  color: #dc2626;
  font-size: 0.75rem;
}

.opcoes-decisao {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.opcao {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid #dfe6ee;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.opcao:hover {
  background: #f8fafc;
}

.opcao.ativa {
  border-color: #1ca4a7;
  background: rgba(28, 164, 167, 0.06);
}

.opcao input {
  margin-top: 3px;
  accent-color: #15999c;
}

.opcao-texto {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.opcao-texto strong {
  color: #1f2937;
  font-size: 0.84rem;
}

.opcao-texto small {
  color: #64748b;
  font-size: 0.74rem;
  line-height: 1.35;
}

.nota {
  margin: 0 0 1rem;
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.1rem 1.5rem;
  border-top: 1px solid #e8edf2;
  background: #f8fafc;
}

.btn-voltar,
.btn-confirmar {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.1rem;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.btn-voltar {
  border: 1px solid #dfe6ee;
  background: #fff;
  color: #475569;
}

.btn-voltar:hover {
  background: #f1f5f9;
}

.btn-confirmar {
  border: 0;
  color: #fff;
}

.btn-confirmar.cancelar {
  background: #dc2626;
}

.btn-confirmar.cancelar:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-confirmar.falta {
  background: #ea580c;
}

.btn-confirmar.falta:hover:not(:disabled) {
  background: #c2410c;
}

.btn-confirmar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.22s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.97);
}

@media (max-width: 560px) {
  .opcoes-decisao {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>