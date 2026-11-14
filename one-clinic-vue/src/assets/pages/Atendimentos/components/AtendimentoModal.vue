<template>
  <Transition name="fade">
    <div class="modal-overlay" v-if="isOpen" @click.self="fechar">
      <Transition name="scale">
        <div class="modal-container" v-if="isOpen && atendimento">
          <header class="modal-header">
            <div class="header-titles">
              <h3>Detalhes do Atendimento</h3>
              <p class="subtitle">{{ atendimento.cliente }}</p>
            </div>
            <button class="btn-close" aria-label="Fechar" @click="fechar">
              <i class="pi pi-times"></i>
            </button>
          </header>

          <div class="modal-body">
            <div class="status-linha">
              <span :class="['status-badge', `badge-${atendimento.status}`]">
                {{ formatarStatus(atendimento.status) }}
              </span>
              <span class="resultado-texto">
                Resultado: <strong>{{ rotuloResultado }}</strong>
              </span>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-rotulo">Cliente</span>
                <span class="info-valor">{{ atendimento.cliente }}</span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Telefone</span>
                <span class="info-valor">{{
                  atendimento.clienteTelefone || "Não informado"
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Procedimento</span>
                <span class="info-valor">{{ atendimento.servico }}</span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Profissional</span>
                <span class="info-valor">{{ atendimento.profissional }}</span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Data</span>
                <span class="info-valor">{{
                  formatarDataBR(atendimento.dataInicio)
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Horário</span>
                <span class="info-valor">
                  {{ atendimento.horaInicio }} às {{ atendimento.horaFim }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Duração do agendamento</span>
                <span class="info-valor">{{
                  formatarDuracao(atendimento.duracaoMinutos)
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Duração de referência</span>
                <span class="info-valor">{{
                  formatarDuracao(atendimento.servicoDuracaoMinutos)
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Valor do agendamento</span>
                <span class="info-valor">
                  {{ formatarMoeda(atendimento.valorCobrado) }}
                  <small class="info-extra">
                    {{
                      atendimento.precoAcordado !== null
                        ? "Valor específico deste agendamento"
                        : "Valor de referência do procedimento"
                    }}
                  </small>
                </span>
              </div>
              <div v-if="atendimento.precoAcordado !== null" class="info-item">
                <span class="info-rotulo">Valor de referência</span>
                <span class="info-valor">{{
                  formatarMoeda(atendimento.servicoPreco)
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Pacote</span>
                <span class="info-valor">
                  {{ atendimento.pacoteNome || "Agendamento avulso" }}
                  <small v-if="rotuloSessao" class="info-extra">{{ rotuloSessao }}</small>
                </span>
              </div>
            </div>

            <div v-if="atendimento.motivoCancelamento" class="bloco bloco-alerta">
              <span class="info-rotulo">Motivo do cancelamento</span>
              <p>{{ atendimento.motivoCancelamento }}</p>
            </div>

            <div v-if="atendimento.observacoes" class="bloco">
              <span class="info-rotulo">Observações</span>
              <p>{{ atendimento.observacoes }}</p>
            </div>

            <div v-if="registroFormatado" class="registro">
              <i class="pi pi-history"></i>
              Registrado em {{ registroFormatado }}
            </div>
          </div>

          <footer class="modal-footer">
            <div
              v-if="
                podeEncerrar &&
                (atendimento.concluivel ||
                  atendimento.faltaRegistravel ||
                  atendimento.editavel)
              "
              class="footer-extras"
            >
              <button
                v-if="atendimento.concluivel"
                type="button"
                class="btn-concluir"
                @click="$emit('concluir', atendimento)"
              >
                <i class="pi pi-check-circle"></i> Concluir atendimento
              </button>
              <button
                v-if="atendimento.faltaRegistravel"
                type="button"
                class="btn-falta"
                @click="$emit('falta', atendimento)"
              >
                <i class="pi pi-user-minus"></i>
                {{
                  atendimento.corrigeConcluido ? "Corrigir para falta" : "Registrar falta"
                }}
              </button>
              <button
                v-if="atendimento.editavel"
                type="button"
                class="btn-perigo"
                @click="$emit('cancelar', atendimento)"
              >
                <i class="pi pi-ban"></i> Cancelar
              </button>
            </div>

            <div class="footer-actions">
              <button type="button" class="btn-cancelar" @click="fechar">Fechar</button>
              <button
                v-if="podeEditar && (atendimento.editavel || atendimento.edicaoParcial)"
                type="button"
                class="btn-salvar"
                @click="$emit('editar', atendimento)"
              >
                <i class="pi pi-pencil"></i> Editar
              </button>
            </div>
          </footer>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from "vue";
import {
  FUSO_CLINICA,
  formatarDataBR,
  formatarDuracao,
  formatarMoeda,
  formatarStatus,
} from "@/utils/agendamentos";

const props = defineProps({
  isOpen: Boolean,
  atendimento: { type: Object, default: null },
  podeEditar: Boolean,
  podeEncerrar: Boolean,
});

const emit = defineEmits(["close", "editar", "cancelar", "falta", "concluir"]);

const rotulosResultado = {
  AGUARDANDO_RESULTADO: "Aguardando resultado",
  REALIZADO: "Realizado",
  FALTA: "Falta",
};

const rotulosSessao = {
  DISPONIVEL: "Sessão disponível",
  AGENDADA: "Sessão reservada",
  UTILIZADA: "Sessão utilizada",
  PERDIDA: "Sessão perdida",
  CANCELADA: "Sessão cancelada",
};

const rotuloResultado = computed(
  () => rotulosResultado[props.atendimento?.resultado] || "—"
);

const rotuloSessao = computed(
  () => rotulosSessao[props.atendimento?.sessaoPacoteStatus] || ""
);

const registroFormatado = computed(() => {
  const iso = props.atendimento?.criadoEm;

  if (!iso) return "";

  const data = new Date(iso);

  if (Number.isNaN(data.getTime())) return "";

  return data.toLocaleString("pt-BR", {
    timeZone: FUSO_CLINICA,
    dateStyle: "short",
    timeStyle: "short",
  });
});

const fechar = () => {
  emit("close");
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

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
  font-family: "Inter", sans-serif;
}
.modal-container {
  background-color: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 650px;
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
.header-titles h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}
.subtitle {
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
  font-size: 14px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.btn-close:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.05);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  overflow-y: auto;
  min-height: 0;
}
.status-linha {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
}
.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid transparent;
}
.badge-pendente {
  background-color: #fff7ed;
  color: #c2410c;
  border-color: #fed7aa;
}
.badge-confirmado {
  background-color: #f0f9ff;
  color: #0369a1;
  border-color: #bae6fd;
}
.badge-em_andamento {
  background-color: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}
.badge-aguardando {
  background-color: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}
.badge-concluido {
  background-color: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.badge-falta {
  background-color: #faf5ff;
  color: #7e22ce;
  border-color: #e9d5ff;
}
.badge-cancelado {
  background-color: #fff1f2;
  color: #be123c;
  border-color: #fecdd3;
}
.resultado-texto {
  font-size: 12px;
  color: #64748b;
}
.resultado-texto strong {
  color: #0f172a;
  font-weight: 600;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 24px;
  padding: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.info-rotulo {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.info-valor {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  overflow-wrap: anywhere;
}
.info-extra {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
}
.bloco {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background-color: #f8fafc;
}
.bloco p {
  margin: 0;
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
  white-space: pre-wrap;
}
.bloco-alerta {
  border-color: #fecdd3;
  background-color: #fff1f2;
}
.registro {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px dashed #e2e8f0;
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
  padding: 18px 24px;
}
.footer-extras,
.footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.footer-actions {
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
  font-family: inherit;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}
.btn-cancelar:hover {
  background-color: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}
.btn-salvar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--cor-primaria, #1ca4a7);
  color: #ffffff;
  border: none;
  padding: 0 22px;
  min-height: 44px;
  border-radius: 11px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.25);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-salvar:hover {
  background-color: #158a8d;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(28, 164, 167, 0.35);
}
.btn-perigo,
.btn-falta,
.btn-concluir {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: #ffffff;
  padding: 0 16px;
  height: 44px;
  border-radius: 11px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}
.btn-perigo {
  border: 1px solid #fecaca;
  color: #dc2626;
}
.btn-perigo:hover {
  background-color: #fef2f2;
  border-color: #fca5a5;
}
.btn-falta {
  border: 1px solid #e9d5ff;
  color: #7e22ce;
}
.btn-falta:hover {
  background-color: #faf5ff;
  border-color: #d8b4fe;
}
.btn-concluir {
  border: 1px solid #99f6e4;
  color: #0f766e;
}
.btn-concluir:hover {
  background-color: #f0fdfa;
  border-color: #5eead4;
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
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 640px) {
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
  .info-grid {
    grid-template-columns: 1fr;
    padding: 14px;
  }
  .modal-footer {
    padding: 16px 18px;
  }
  .footer-extras,
  .footer-actions {
    width: 100%;
  }
  .footer-extras button,
  .footer-actions button {
    flex: 1;
  }
}
</style>
