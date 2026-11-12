<template>
  <Transition name="fade">
    <div class="modal-overlay" v-if="isOpen" @click.self="fechar">
      <Transition name="scale">
        <div class="modal-container" v-if="isOpen">
          <header class="modal-header">
            <div class="header-titles">
              <h3>{{ tituloModal }}</h3>
              <p class="subtitle" v-if="isDetalhes">{{ form.nome }}</p>
            </div>
            <button class="btn-close" @click="fechar">
              <i class="pi pi-times"></i>
            </button>
          </header>
          <div class="modal-tabs" v-if="isDetalhes">
            <button
              :class="['tab-btn', { active: activeTab === 'cadastro' }]"
              @click="activeTab = 'cadastro'"
            >
              <i class="pi pi-user"></i> Cadastro
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'historico' }]"
              @click="activeTab = 'historico'"
            >
              <i class="pi pi-calendar"></i> Histórico
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'pacotes' }]"
              @click="activeTab = 'pacotes'"
            >
              <i class="pi pi-box"></i> Pacotes
            </button>
          </div>
          <form
            ref="formRef"
            @submit.prevent="salvar"
            novalidate
            :class="['modal-form', { 'was-validated': foiValidado }]"
          >
            <div class="form-content">
              <Transition name="fade-slide" mode="out-in">
                <div v-if="activeTab === 'cadastro'" class="tab-pane" key="cadastro">
                  <div class="form-row">
                    <div class="form-group flex-1">
                      <label
                        >Nome Completo <span class="required-asterisk">*</span></label
                      >
                      <input
                        type="text"
                        v-model="form.nome"
                        required
                        minlength="3"
                        pattern=".{3,}"
                        :disabled="isDetalhes"
                        placeholder="Ex: João da Silva"
                      />
                      <span class="error-feedback"
                        >Preencha o nome completo (mínimo 3 letras).</span
                      >
                    </div>
                    <div class="form-group flex-1">
                      <label>CPF <span class="required-asterisk">*</span></label>
                      <input
                        type="text"
                        v-model="exibicaoCpf"
                        @input="processarCpf"
                        required
                        pattern=".{14,14}"
                        maxlength="14"
                        :disabled="isDetalhes || mode === 'editar'"
                        placeholder="000.000.000-00"
                      />
                      <span class="error-feedback">O CPF deve conter os 11 números.</span>
                    </div>
                  </div>
                  <div class="form-row mt-3">
                    <div class="form-group flex-1">
                      <label>Telefone <span class="required-asterisk">*</span></label>
                      <input
                        type="text"
                        v-model="exibicaoTelefone"
                        @input="processarTelefone"
                        required
                        pattern=".{14,15}"
                        maxlength="15"
                        :disabled="isDetalhes"
                        placeholder="(00) 00000-0000"
                      />
                      <span class="error-feedback"
                        >O telefone deve conter o DDD e número válido.</span
                      >
                    </div>
                    <div class="form-group flex-1">
                      <label>CEP <span class="required-asterisk">*</span></label>
                      <input
                        type="text"
                        v-model="exibicaoCep"
                        @input="processarCep"
                        required
                        pattern=".{9,9}"
                        maxlength="9"
                        :disabled="isDetalhes"
                        placeholder="00000-000"
                      />
                      <span class="error-feedback"
                        >O CEP deve conter os 8 números corretos.</span
                      >
                    </div>
                  </div>
                  <div class="form-row mt-3">
                    <div class="form-group flex-1">
                      <label>Número <span class="required-asterisk">*</span></label>
                      <input
                        type="text"
                        :value="form.numero"
                        @input="processarNumero"
                        required
                        pattern="\d{1,4}"
                        maxlength="4"
                        :disabled="isDetalhes"
                        placeholder="Apenas números"
                      />
                      <span class="error-feedback"
                        >Campo obrigatório. Máximo 4 dígitos.</span
                      >
                    </div>
                    <div class="form-group flex-1">
                      <label
                        >Status do Cadastro
                        <span class="required-asterisk">*</span></label
                      >
                      <div class="status-toggle" :class="{ disabled: isDetalhes }">
                        <label
                          :class="[
                            'toggle-option',
                            { active: form.status_cadastro === 'ATIVO' },
                          ]"
                        >
                          <input
                            type="radio"
                            v-model="form.status_cadastro"
                            value="ATIVO"
                            :disabled="isDetalhes"
                          />
                          ATIVO
                        </label>
                        <label
                          :class="[
                            'toggle-option',
                            { active: form.status_cadastro === 'INATIVO' },
                          ]"
                        >
                          <input
                            type="radio"
                            v-model="form.status_cadastro"
                            value="INATIVO"
                            :disabled="isDetalhes"
                          />
                          INATIVO
                        </label>
                        <div
                          class="toggle-slider"
                          :class="form.status_cadastro.toLowerCase()"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div class="datas-registro mt-3" v-if="isDetalhes">
                    <div class="data-item">
                      <span class="data-label"
                        ><i class="pi pi-calendar-plus"></i> Criado em</span
                      >
                      <span class="data-valor">{{
                        formatarDataHora(clienteEdicao?.created_at)
                      }}</span>
                    </div>
                    <div class="data-item">
                      <span class="data-label"
                        ><i class="pi pi-history"></i> Atualizado em</span
                      >
                      <span class="data-valor">{{
                        formatarDataHora(clienteEdicao?.updated_at)
                      }}</span>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="activeTab === 'historico'"
                  class="tab-pane mock-section"
                  key="historico"
                >
                  <div v-if="carregandoExtras" class="estado-vazio">
                    Carregando histórico...
                  </div>
                  <template v-else-if="historico">
                    <div class="resumo-grid">
                      <div class="resumo-item">
                        <strong>{{ historico.resumo.procedimentos_realizados }}</strong
                        ><span>Procedimentos</span>
                      </div>
                      <div class="resumo-item">
                        <strong>{{ historico.resumo.atendimentos }}</strong
                        ><span>Atendimentos</span>
                      </div>
                      <div class="resumo-item">
                        <strong>{{ historico.resumo.sessoes_utilizadas }}</strong
                        ><span>Sessões usadas</span>
                      </div>
                      <div class="resumo-item">
                        <strong>{{ historico.resumo.faltas }}</strong
                        ><span>Faltas</span>
                      </div>
                      <div class="resumo-item">
                        <strong>{{ historico.resumo.cancelamentos }}</strong
                        ><span>Cancelamentos</span>
                      </div>
                    </div>
                    <div class="secao-titulo">Procedimentos realizados</div>
                    <div v-if="historico.procedimentos.length === 0" class="estado-vazio">
                      Nenhum procedimento realizado.
                    </div>
                    <div v-else class="mock-list scroller">
                      <div
                        class="mock-item"
                        v-for="proc in historico.procedimentos"
                        :key="'p' + proc.id"
                      >
                        <div class="mock-icon"><i class="pi pi-check-circle"></i></div>
                        <div class="mock-info">
                          <h4>{{ proc.servico_nome }}</h4>
                          <p>
                            {{ formatarDataHora(proc.realizado_em) }} ·
                            {{ proc.profissional_nome
                            }}<template v-if="proc.pacote_nome">
                              · {{ proc.pacote_nome }}</template
                            >
                          </p>
                          <p v-if="proc.status === 'ESTORNADO'">
                            Estornado: {{ proc.motivo_estorno }}
                          </p>
                        </div>
                        <span
                          class="mock-badge"
                          :class="
                            proc.status === 'ESTORNADO'
                              ? 'badge-cancelado'
                              : 'badge-concluido'
                          "
                          >{{ proc.status }}</span
                        >
                      </div>
                    </div>
                    <div class="secao-titulo">Atendimentos</div>
                    <div v-if="historico.atendimentos.length === 0" class="estado-vazio">
                      Nenhum agendamento encontrado para este cliente.
                    </div>
                    <div v-else class="mock-list scroller">
                      <div
                        class="mock-item"
                        v-for="ag in historico.atendimentos"
                        :key="'a' + ag.id"
                      >
                        <div class="mock-icon"><i class="pi pi-calendar-clock"></i></div>
                        <div class="mock-info">
                          <h4>{{ ag.servico_nome }}</h4>
                          <p>
                            {{ formatarDataHora(ag.data_hora_inicio) }} ·
                            {{ ag.profissional_nome
                            }}<template v-if="ag.pacote_nome">
                              · {{ ag.pacote_nome }}</template
                            >
                          </p>
                          <p v-if="ag.motivo_cancelamento">
                            Motivo: {{ ag.motivo_cancelamento }}
                          </p>
                        </div>
                        <span class="mock-badge" :class="classeAtendimento(ag)">{{
                          rotuloAtendimento(ag)
                        }}</span>
                      </div>
                    </div>
                    <div class="secao-titulo">Movimentações de sessões</div>
                    <div
                      v-if="historico.movimentos_sessao.length === 0"
                      class="estado-vazio"
                    >
                      Nenhuma movimentação de sessão.
                    </div>
                    <div v-else class="mock-list scroller">
                      <div
                        class="mock-item"
                        v-for="mov in historico.movimentos_sessao"
                        :key="'m' + mov.id"
                      >
                        <div class="mock-icon"><i class="pi pi-history"></i></div>
                        <div class="mock-info">
                          <h4>
                            {{ mov.pacote_nome }} · {{ mov.estado_anterior || "—" }} →
                            {{ mov.estado_novo }}
                          </h4>
                          <p>
                            {{ formatarDataHora(mov.data_alteracao) }} ·
                            {{ mov.responsavel }} · {{ mov.motivo }}
                          </p>
                          <p v-if="mov.justificativa">{{ mov.justificativa }}</p>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
                <div
                  v-else-if="activeTab === 'pacotes'"
                  class="tab-pane mock-section"
                  key="pacotes"
                >
                  <div v-if="carregandoExtras" class="estado-vazio">
                    Carregando pacotes...
                  </div>
                  <div
                    v-else-if="!historico || historico.pacotes.length === 0"
                    class="estado-vazio"
                  >
                    Nenhum pacote adquirido por este cliente.
                  </div>
                  <div v-else class="mock-list scroller">
                    <div
                      class="pacote-bloco"
                      v-for="pacote in historico.pacotes"
                      :key="pacote.id"
                    >
                      <div class="mock-item clicavel" @click="alternarPacote(pacote.id)">
                        <div class="mock-icon"><i class="pi pi-box"></i></div>
                        <div class="mock-info">
                          <h4>{{ pacote.nome }} · {{ pacote.servico_nome }}</h4>
                          <p>
                            Disponíveis {{ pacote.disponiveis }} · Agendadas
                            {{ pacote.agendadas }} · Utilizadas {{ pacote.utilizadas }} ·
                            Perdidas {{ pacote.perdidas }} · Canceladas
                            {{ pacote.canceladas }} (total
                            {{ pacote.quantidade_sessoes }})
                          </p>
                        </div>
                        <span
                          class="mock-badge"
                          :class="
                            pacote.status === 'CANCELADO'
                              ? 'badge-cancelado'
                              : pacote.status === 'CONCLUIDO'
                              ? 'badge-concluido'
                              : 'badge-ativo'
                          "
                          >{{ pacote.status }}</span
                        >
                        <i
                          :class="[
                            'pi',
                            pacoteAberto === pacote.id
                              ? 'pi-chevron-up'
                              : 'pi-chevron-down',
                            'seta-pacote',
                          ]"
                        ></i>
                      </div>
                      <div v-if="pacoteAberto === pacote.id" class="sessoes-lista">
                        <div v-if="carregandoSessoes" class="estado-vazio">
                          Carregando sessões...
                        </div>
                        <template v-else-if="sessoesPacote[pacote.id]">
                          <div
                            class="sessao-item"
                            v-for="sessao in sessoesPacote[pacote.id].sessoes"
                            :key="sessao.id"
                          >
                            <div class="sessao-topo">
                              <strong>Sessão {{ sessao.numero }}</strong>
                              <span
                                class="mock-badge"
                                :class="classeSessao(sessao.status)"
                                >{{ sessao.status }}</span
                              >
                            </div>
                            <p v-if="sessao.agendamento_inicio">
                              Atendimento:
                              {{ formatarDataHora(sessao.agendamento_inicio) }} ·
                              {{ sessao.profissional_nome }}
                            </p>
                            <ul class="sessao-historico">
                              <li v-for="mov in sessao.historico" :key="mov.id">
                                {{ formatarDataHora(mov.data_alteracao) }} ·
                                {{ mov.estado_anterior || "—" }} → {{ mov.estado_novo }} ·
                                {{ mov.responsavel }} · {{ mov.motivo
                                }}<template v-if="mov.justificativa">
                                  ({{ mov.justificativa }})</template
                                >
                              </li>
                            </ul>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
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
import { obterHistoricoCliente, listarSessoesPacote } from "@/services/agendamentos";
import { formatarDataHora } from "@/utils/datas";
const props = defineProps({
  isOpen: Boolean,
  mode: String,
  clienteEdicao: Object,
});
const emit = defineEmits(["close", "save", "notify"]);
const activeTab = ref("cadastro");
const formRef = ref(null);
const foiValidado = ref(false);
const historico = ref(null);
const pacoteAberto = ref(null);
const sessoesPacote = ref({});
const carregandoSessoes = ref(false);
const carregandoExtras = ref(false);
const form = ref({
  id: null,
  nome: "",
  cpf: "",
  telefone: "",
  cep: "",
  numero: "",
  status_cadastro: "ATIVO",
});
const exibicaoCpf = ref("");
const exibicaoTelefone = ref("");
const exibicaoCep = ref("");
const tituloModal = computed(() => {
  if (props.mode === "detalhes") return "Perfil do Cliente";
  if (props.mode === "editar") return "Editar Cliente";
  return "Novo Cliente";
});
const isDetalhes = computed(() => props.mode === "detalhes");
const carregarExtras = async () => {
  if (!props.clienteEdicao?.id) return;
  carregandoExtras.value = true;
  try {
    historico.value = await obterHistoricoCliente(props.clienteEdicao.id);
  } catch (error) {
    emit("notify", { message: "Erro ao buscar histórico do cliente.", type: "error" });
  } finally {
    carregandoExtras.value = false;
  }
};
const classeSessao = (status) => {
  if (status === "UTILIZADA") return "badge-concluido";
  if (status === "PERDIDA" || status === "CANCELADA") return "badge-cancelado";
  return "badge-ativo";
};
const alternarPacote = async (id) => {
  if (pacoteAberto.value === id) {
    pacoteAberto.value = null;
    return;
  }
  pacoteAberto.value = id;
  carregandoSessoes.value = true;
  try {
    sessoesPacote.value = { ...sessoesPacote.value, [id]: await listarSessoesPacote(id) };
  } catch (error) {
    emit("notify", { message: "Erro ao buscar as sessões do pacote.", type: "error" });
  } finally {
    carregandoSessoes.value = false;
  }
};
const rotuloAtendimento = (ag) => {
  if (ag.resultado === "FALTA") return "FALTA";
  return ag.status;
};
const classeAtendimento = (ag) => {
  if (ag.resultado === "FALTA" || ag.status === "CANCELADO") return "badge-cancelado";
  if (ag.status === "CONCLUIDO") return "badge-concluido";
  return "badge-ativo";
};
const aplicarMascaraCpf = (v) => {
  if (!v) return "";
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return v;
};
const aplicarMascaraTelefone = (v) => {
  if (!v) return "";
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  }
  return v;
};
const aplicarMascaraCep = (v) => {
  if (!v) return "";
  v = v.replace(/\D/g, "");
  if (v.length <= 8) {
    v = v.replace(/^(\d{5})(\d)/, "$1-$2");
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
const processarCep = (event) => {
  let num = event.target.value.replace(/\D/g, "").slice(0, 8);
  exibicaoCep.value = aplicarMascaraCep(num);
  form.value.cep = exibicaoCep.value;
};
const processarNumero = (event) => {
  let num = event.target.value.replace(/\D/g, "").slice(0, 4);
  form.value.numero = num;
  event.target.value = num;
};
watch(
  () => props.isOpen,
  (aberto) => {
    if (aberto) {
      activeTab.value = "cadastro";
      historico.value = null;
      pacoteAberto.value = null;
      sessoesPacote.value = {};
      foiValidado.value = false;
      if (props.clienteEdicao && props.mode !== "criar") {
        form.value = {
          id: props.clienteEdicao.id,
          nome: props.clienteEdicao.usuario_nome || "",
          cpf: props.clienteEdicao.usuario_cpf || "",
          telefone: props.clienteEdicao.telefone || "",
          cep: props.clienteEdicao.cep || "",
          numero: props.clienteEdicao.numero_endereco || "",
          status_cadastro: props.clienteEdicao.status_cadastro || "ATIVO",
        };
        exibicaoCpf.value = aplicarMascaraCpf(form.value.cpf);
        exibicaoTelefone.value = aplicarMascaraTelefone(form.value.telefone);
        exibicaoCep.value = aplicarMascaraCep(form.value.cep);
      } else {
        form.value = {
          id: null,
          nome: "",
          cpf: "",
          telefone: "",
          cep: "",
          numero: "",
          status_cadastro: "ATIVO",
        };
        exibicaoCpf.value = "";
        exibicaoTelefone.value = "";
        exibicaoCep.value = "";
      }
    }
  }
);
watch(activeTab, (newTab) => {
  if (
    (newTab === "historico" || newTab === "pacotes") &&
    isDetalhes.value &&
    !historico.value
  ) {
    carregarExtras();
  }
});
const fechar = () => {
  emit("close");
};
const salvar = () => {
  if (isDetalhes.value) return;
  if (formRef.value && !formRef.value.checkValidity()) {
    foiValidado.value = true;
    emit("notify", {
      message: "Por favor, corrija os campos em vermelho para prosseguir.",
      type: "error",
    });
    const firstInvalid = formRef.value.querySelector(":invalid");
    if (firstInvalid) firstInvalid.focus();
    return;
  }
  emit("save", { ...form.value });
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
.modal-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  z-index: 2000;
  font-family: "Inter", sans-serif;
}
.modal-container {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  max-height: 90dvh;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #fff;
}
.header-titles {
  min-width: 0;
  flex: 1;
}
.header-titles h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.btn-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #fff;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  opacity: 0.8;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
}
.btn-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.16);
}
.modal-tabs {
  flex-shrink: 0;
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.modal-tabs::-webkit-scrollbar {
  display: none;
}
.tab-btn {
  flex-shrink: 0;
  white-space: nowrap;
  background: none;
  border: none;
  padding: 14px 18px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
}
.tab-btn:hover {
  color: #0f172a;
}
.tab-btn.active {
  color: var(--cor-primaria, #1ca4a7);
  border-bottom-color: var(--cor-primaria, #1ca4a7);
  font-weight: 600;
}
.modal-form {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0;
}
.form-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  overscroll-behavior: contain;
}
.form-content::-webkit-scrollbar {
  width: 6px;
}
.form-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.form-content::-webkit-scrollbar-track {
  background: transparent;
}
.tab-pane {
  width: 100%;
  min-width: 0;
}
.mt-3 {
  margin-top: 16px;
}
.form-row {
  display: flex;
  gap: 16px;
}
.flex-1 {
  flex: 1;
  min-width: 0;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}
.form-group label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: color 0.25s;
}
.required-asterisk {
  color: #ef4444;
}
.form-group input {
  width: 100%;
  box-sizing: border-box;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  color: #0f172a;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8fafc;
  font-family: inherit;
}
.form-group input:hover:not(:disabled) {
  border-color: #94a3b8;
}
.form-group input:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.form-group input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
}
.status-toggle {
  position: relative;
  display: flex;
  background: #f1f5f9;
  border-radius: 12px;
  height: 46px;
  padding: 4px;
  box-sizing: border-box;
  overflow: hidden;
}
.status-toggle.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.toggle-option {
  flex: 1;
  text-align: center;
  z-index: 2;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.25s;
}
.status-toggle.disabled .toggle-option {
  cursor: not-allowed;
}
.toggle-option input {
  display: none;
}
.toggle-option.active {
  color: #fff;
}
.toggle-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  border-radius: 9px;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.35s ease;
  z-index: 1;
}
.toggle-slider.ativo {
  transform: translateX(0);
  background: var(--cor-primaria, #1ca4a7);
}
.toggle-slider.inativo {
  transform: translateX(100%);
  background: #64748b;
}
.datas-registro {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
}
.data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 160px;
}
.data-label {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 6px;
}
.data-valor {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}
.error-feedback {
  font-size: 12px;
  color: #dc2626;
  margin-top: 2px;
  opacity: 0;
  height: 0;
  overflow: hidden;
  transition: opacity 0.25s ease, height 0.25s ease;
}
.was-validated input:invalid {
  border-color: #ef4444;
  background: #fef2f2;
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
.was-validated input:invalid:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
}
.was-validated .form-group:has(:invalid) label {
  color: #dc2626;
}
.was-validated input:invalid ~ .error-feedback {
  opacity: 1;
  height: 16px;
}
@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-3px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(3px, 0, 0);
  }
}
.mock-section {
  padding: 2px 0;
}
.scroller {
  max-height: 290px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;
  overscroll-behavior: contain;
}
.scroller::-webkit-scrollbar {
  width: 6px;
}
.scroller::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.scroller::-webkit-scrollbar-track {
  background: transparent;
}
.mock-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mock-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
}
.mock-item:hover {
  border-color: rgba(28, 164, 167, 0.45);
  background: #fff;
}
.mock-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f0fdfa;
  color: #0f766e;
  border: 1px solid #ccfbf1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}
.mock-info {
  flex: 1;
  min-width: 0;
}
.mock-info h4 {
  margin: 0 0 4px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.mock-info p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.mock-info p + p {
  margin-top: 3px;
}
.mock-badge {
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 9px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.badge-ativo {
  background: #f0fdfa;
  color: #0f766e;
  border: 1px solid #99f6e4;
}
.badge-concluido {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.badge-cancelado {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
.estado-vazio {
  text-align: center;
  padding: 20px;
  color: #64748b;
  font-size: 13px;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
}
.resumo-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}
.resumo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 3px;
  padding: 10px 6px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  min-width: 0;
}
.resumo-item strong {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.2;
}
.resumo-item span {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  line-height: 1.2;
}
.secao-titulo {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 18px 0 10px;
}
.secao-titulo:first-of-type {
  margin-top: 4px;
}
.pacote-bloco {
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  overflow: hidden;
  flex-shrink: 0;
}
.pacote-bloco > .mock-item {
  border: none;
  border-radius: 0;
  background: transparent;
}
.pacote-bloco > .mock-item:hover {
  background: #fff;
}
.clicavel {
  cursor: pointer;
}
.seta-pacote {
  flex-shrink: 0;
  color: #64748b;
  font-size: 13px;
}
.sessoes-lista {
  border-top: 1px solid #e2e8f0;
  background: #fff;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sessao-item {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.sessao-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.sessao-topo strong {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}
.sessao-item p {
  margin: 0;
  font-size: 12px;
  color: #475569;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.sessao-historico {
  margin: 2px 0 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #64748b;
  font-size: 11.5px;
}
.sessao-historico li {
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.modal-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
.btn-cancelar,
.btn-salvar {
  height: 42px;
  padding: 0 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  background: var(--cor-primaria, #1ca4a7);
  border: 1px solid var(--cor-primaria, #1ca4a7);
  color: #fff;
}
.btn-salvar:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -4px rgba(28, 164, 167, 0.4);
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
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.96);
  opacity: 0;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
@media (max-width: 600px) {
  .modal-overlay {
    padding: 10px;
  }
  .modal-container {
    border-radius: 16px;
    max-height: 92dvh;
  }
  .modal-header {
    padding: 16px 18px;
  }
  .header-titles h3 {
    font-size: 16px;
  }
  .modal-tabs {
    padding: 0 12px;
  }
  .tab-btn {
    padding: 12px 14px;
    font-size: 12.5px;
  }
  .form-content {
    padding: 16px 18px;
  }
  .form-row {
    flex-direction: column;
    gap: 14px;
  }
  .resumo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .resumo-item:last-child:nth-child(odd) {
    grid-column: span 2;
  }
  .scroller {
    max-height: 240px;
  }
  .mock-item {
    padding: 12px;
    gap: 10px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .mock-icon {
    width: 34px;
    height: 34px;
    font-size: 15px;
    border-radius: 10px;
  }
  .mock-badge {
    margin-left: 44px;
  }
  .seta-pacote {
    margin-left: auto;
    align-self: center;
  }
  .sessoes-lista {
    padding: 10px 12px;
  }
  .modal-footer {
    padding: 14px 18px;
  }
  .btn-cancelar,
  .btn-salvar {
    flex: 1;
    height: 44px;
  }
}
</style>
