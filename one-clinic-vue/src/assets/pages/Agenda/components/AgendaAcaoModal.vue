<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="fechar">
      <Transition name="scale">
        <div
          v-if="isOpen && agendamento"
          class="modal-container"
          role="dialog"
          aria-modal="true"
        >
          <header class="modal-header" :class="modo">
            <div class="header-title">
              <div class="header-icon">
                <i :class="iconeConfirmar"></i>
              </div>
              <div>
                <h3>{{ titulo }}</h3>
                <p class="header-subtitle">{{ subtitulo }}</p>
              </div>
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
                <div class="resumo-datas">
                  <div class="resumo-data">
                    <span class="resumo-data-label">Criado em</span>
                    <span class="resumo-data-valor">{{
                      formatarDataHora(agendamento.criadoEm)
                    }}</span>
                  </div>
                  <div class="resumo-data">
                    <span class="resumo-data-label">Atualizado em</span>
                    <span class="resumo-data-valor">{{
                      formatarDataHora(agendamento.atualizadoEm)
                    }}</span>
                  </div>
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
                  O agendamento permanece no histórico com o status Cancelado. Se houver
                  pacote vinculado, o sistema aplica as regras do pacote.
                </p>
              </template>
              <template v-else>
                <div v-if="exigeDecisao" class="form-group">
                  <label>
                    O que fazer com a sessão do pacote?
                    <span class="required-asterisk">*</span>
                  </label>
                  <div class="opcoes-decisao">
                    <label class="opcao" :class="{ ativa: decisao === 'PRESERVAR' }">
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
                  Este atendimento já foi concluído. A correção altera o resultado para
                  Falta e fica registrada na auditoria do sistema.
                </p>
                <p v-else class="nota">
                  A falta encerra o agendamento com o resultado Falta. Esta ação não pode
                  ser desfeita pela tela.
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
import { formatarDataHora } from "@/utils/datas";

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

const decisaoValida = computed(() => ["PRESERVAR", "PERDER"].includes(decisao.value));

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
  padding: 16px;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  font-family: "Inter", sans-serif;
}
.modal-container {
  width: 100%;
  max-width: 540px;
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.3);
}
.modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #ffffff;
}
.modal-header.cancelar {
  background: linear-gradient(135deg, #7f1d1d, #991b1b);
}
.modal-header.falta {
  background: linear-gradient(135deg, #9a3412, #c2410c);
}
.header-title {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.header-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 18px;
}
.modal-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}
.header-subtitle {
  margin: 3px 0 0;
  color: #e2e8f0;
  font-size: 12px;
}
.btn-close {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}
.modal-form {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.modal-body {
  min-height: 0;
  padding: 22px 24px 6px;
  overflow-y: auto;
}
.resumo {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  color: #334155;
  font-size: 13px;
}
.resumo-linha {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.resumo-linha strong {
  font-weight: 600;
  color: #0f172a;
}
.resumo-linha i {
  color: #94a3b8;
  font-size: 13px;
}
.resumo-datas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px dashed #cbd5e1;
}
.resumo-data {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.resumo-data-label {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.resumo-data-valor {
  color: #334155;
  font-size: 12px;
  font-weight: 500;
}
.alerta-erro {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 18px;
  padding: 13px 16px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 13px;
  line-height: 1.45;
}
.alerta-erro i {
  margin-top: 2px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}
.form-group > label {
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}
.required-asterisk {
  color: #dc2626;
}
.form-control {
  display: block;
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  background: #f8fafc;
  color: #0f172a;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.form-control:hover {
  border-color: #94a3b8;
  background: #ffffff;
}
.form-control:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.form-control.input-invalid {
  border-color: #dc2626;
  background: #fef2f2;
}
.textarea {
  min-height: 88px;
  resize: vertical;
}
.campo-rodape {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.contador {
  margin-left: auto;
  color: #94a3b8;
  font-size: 12px;
}
.error-feedback {
  color: #dc2626;
  font-size: 12px;
}
.opcoes-decisao {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.opcao {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.opcao:hover {
  background: #ffffff;
  border-color: rgba(28, 164, 167, 0.4);
}
.opcao.ativa {
  border-color: var(--cor-primaria, #1ca4a7);
  background: #f0fdfa;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.opcao input {
  margin-top: 3px;
  accent-color: #1ca4a7;
}
.opcao-texto {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.opcao-texto strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
}
.opcao-texto small {
  color: #64748b;
  font-size: 12px;
  line-height: 1.35;
}
.nota {
  margin: 0 0 16px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}
.btn-voltar,
.btn-confirmar {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  border-radius: 11px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-voltar {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
}
.btn-voltar:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}
.btn-confirmar {
  border: 0;
  color: #ffffff;
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
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
@media (max-width: 560px) {
  .opcoes-decisao {
    grid-template-columns: 1fr;
  }
  .modal-footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }
  .modal-header,
  .modal-body {
    padding-left: 18px;
    padding-right: 18px;
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
