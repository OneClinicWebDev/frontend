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
                <span class="info-valor">{{ atendimento.clienteTelefone || "Não informado" }}</span>
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
                <span class="info-valor">{{ formatarDataBR(atendimento.dataInicio) }}</span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Horário</span>
                <span class="info-valor">
                  {{ atendimento.horaInicio }} às {{ atendimento.horaFim }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Duração do agendamento</span>
                <span class="info-valor">{{ formatarDuracao(atendimento.duracaoMinutos) }}</span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Duração de referência</span>
                <span class="info-valor">{{ formatarDuracao(atendimento.servicoDuracaoMinutos) }}</span>
              </div>
              <div class="info-item">
                <span class="info-rotulo">Valor de referência</span>
                <span class="info-valor">{{ formatarMoeda(atendimento.servicoPreco) }}</span>
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
            <div v-if="podeEncerrar && atendimento.editavel" class="footer-extras">
              <button type="button" class="btn-falta" @click="$emit('falta', atendimento)">
                <i class="pi pi-user-minus"></i> Registrar falta
              </button>
              <button type="button" class="btn-perigo" @click="$emit('cancelar', atendimento)">
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
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(31, 41, 55, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  font-family: "Inter", sans-serif;
}
.modal-container {
  background-color: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 650px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: #1f2937;
  color: #ffffff;
}
.header-titles h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}
.subtitle {
  margin: 0.2rem 0 0 0;
  font-size: 0.85rem;
  color: #9ca3af;
}
.btn-close {
  background: none;
  border: none;
  color: #ffffff;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
  font-size: 1.2rem;
}
.btn-close:hover {
  opacity: 1;
  transform: scale(1.1);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}
.status-linha {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
}
.status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  background-color: #def7ec;
  color: #03543f;
}
.badge-falta {
  background-color: #f3e8ff;
  color: #7e22ce;
}
.badge-cancelado {
  background-color: #ffe4e6;
  color: #be123c;
}
.resultado-texto {
  font-size: 0.85rem;
  color: #6b7280;
}
.resultado-texto strong {
  color: #1f2937;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.5rem;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}
.info-rotulo {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.info-valor {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  overflow-wrap: anywhere;
}
.info-extra {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}
.bloco {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background-color: #f9fafb;
}
.bloco p {
  margin: 0;
  font-size: 0.9rem;
  color: #374151;
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
  gap: 0.5rem;
  font-size: 0.78rem;
  color: #9ca3af;
}
@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 1.5rem 1.25rem;
}
.footer-extras,
.footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.footer-actions {
  margin-left: auto;
}
.btn-cancelar {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn-cancelar:hover {
  background-color: #f9fafb;
  color: #1f2937;
}
.btn-salvar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #1ca4a7;
  color: #ffffff;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-salvar:hover {
  background-color: #158a8d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.2);
}
.btn-perigo,
.btn-falta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  padding: 0.8rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn-perigo {
  border: 1px solid #fecaca;
  color: #dc2626;
}
.btn-perigo:hover {
  background-color: #fef2f2;
}
.btn-falta {
  border: 1px solid #e9d5ff;
  color: #7e22ce;
}
.btn-falta:hover {
  background-color: #faf5ff;
}
@media (max-width: 600px) {
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
  transform: scale(0.95);
}
</style>