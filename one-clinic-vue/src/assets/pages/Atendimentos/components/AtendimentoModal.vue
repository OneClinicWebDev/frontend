<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="fechar">
      <Transition name="scale">
        <div v-if="isOpen && atendimento" class="modal-container">
          <header class="modal-header">
            <div class="header-title">
              <div class="header-icon">
                <i class="pi pi-eye"></i>
              </div>
              <div class="header-titles">
                <h3>Detalhes do Atendimento</h3>
                <p class="subtitle">{{ atendimento.cliente }}</p>
              </div>
            </div>
            <button type="button" class="btn-close" aria-label="Fechar" @click="fechar">
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
            <div class="registro">
              <span
                ><i class="pi pi-calendar-plus"></i> Criado em
                {{ formatarDataHora(atendimento.criadoEm) }}</span
              >
              <span
                ><i class="pi pi-refresh"></i> Atualizado em
                {{ formatarDataHora(atendimento.atualizadoEm) }}</span
              >
            </div>
          </div>
          <footer class="modal-footer">
            <div
              v-if="
                podeEncerrar && (atendimento.faltaRegistravel || atendimento.editavel)
              "
              class="footer-extras"
            >
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
                v-if="podeEditar && atendimento.editavel"
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
import { formatarDataHora } from "@/utils/datas";
import {
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

const emit = defineEmits(["close", "editar", "cancelar", "falta"]);

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

const fechar = () => {
  emit("close");
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  font-family: "Inter", sans-serif;
}
.modal-container {
  width: 100%;
  max-width: 640px;
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
}
.modal-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
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
  background: rgba(28, 164, 167, 0.2);
  color: var(--cor-primaria, #1ca4a7);
  font-size: 18px;
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
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-close:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.05);
}
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  overflow-y: auto;
}
.status-linha {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
}
.status-badge {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.badge-pendente {
  background-color: #ffedd5;
  color: #c2410c;
}
.badge-confirmado {
  background-color: #e0f2fe;
  color: #0369a1;
}
.badge-em_andamento {
  background-color: #fef3c7;
  color: #92400e;
}
.badge-aguardando {
  background-color: #f1f5f9;
  color: #475569;
}
.badge-concluido {
  background-color: #ecfdf5;
  color: #047857;
}
.badge-falta {
  background-color: #f3e8ff;
  color: #7e22ce;
}
.badge-cancelado {
  background-color: #fef2f2;
  color: #b91c1c;
}
.resultado-texto {
  font-size: 13px;
  color: #64748b;
}
.resultado-texto strong {
  color: #0f172a;
  font-weight: 600;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}
.info-rotulo {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.info-valor {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  overflow-wrap: anywhere;
}
.info-extra {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 400;
  color: #64748b;
}
.bloco {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
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
  border-color: #fecaca;
  background-color: #fef2f2;
}
.registro {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  padding-top: 14px;
  border-top: 1px dashed #e2e8f0;
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
}
.registro span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.modal-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
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
  height: 44px;
  padding: 0 20px;
  border: 1px solid #cbd5e1;
  border-radius: 11px;
  background: #ffffff;
  color: #475569;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
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
  gap: 8px;
  height: 44px;
  padding: 0 22px;
  border: 0;
  border-radius: 11px;
  background-color: var(--cor-primaria, #1ca4a7);
  color: #ffffff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.25);
  transition: all 0.25s ease;
}
.btn-salvar:hover {
  background-color: #158a8d;
  transform: translateY(-1px);
}
.btn-perigo,
.btn-falta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 18px;
  border-radius: 11px;
  background: #ffffff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
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
@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  .modal-header,
  .modal-body {
    padding: 18px;
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
    justify-content: center;
  }
}
</style>
