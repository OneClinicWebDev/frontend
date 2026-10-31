<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="fechar">
      <Transition name="scale">
        <div v-if="isOpen" class="modal-container">
          <header class="modal-header">
            <div>
              <h3>{{ tituloModal }}</h3>
              <p class="header-subtitle">
                {{ subtituloModal }}
              </p>
            </div>
            <button type="button" class="btn-close" aria-label="Fechar" @click="fechar">
              <i class="pi pi-times"></i>
            </button>
          </header>

          <form class="modal-form" novalidate @submit.prevent="salvar">
            <div ref="corpoRef" class="modal-body">
              <div v-if="alerta" :class="['alerta', alerta.tipo]" role="alert">
                <span class="alerta-icone">
                  <i
                    :class="
                      alerta.tipo === 'conflito'
                        ? 'pi pi-calendar-clock'
                        : 'pi pi-exclamation-triangle'
                    "
                  ></i>
                </span>
                <div class="alerta-conteudo">
                  <strong>{{ alerta.titulo }}</strong>
                  <p>{{ alerta.mensagem }}</p>
                  <small v-if="alerta.detalhe">{{ alerta.detalhe }}</small>
                </div>
                <button
                  type="button"
                  class="alerta-fechar"
                  aria-label="Fechar aviso"
                  @click="$emit('limpar-alerta')"
                >
                  <i class="pi pi-times"></i>
                </button>
              </div>

              <div v-if="somenteLeitura && mensagemSomenteLeitura" class="aviso">
                <i class="pi pi-lock"></i>
                <span>{{ mensagemSomenteLeitura }}</span>
              </div>

              <div v-for="aviso in avisosAcesso" :key="aviso" class="aviso">
                <i class="pi pi-info-circle"></i>
                <span>{{ aviso }}</span>
              </div>

              <div class="form-group">
                <label for="cliente"
                  >Cliente <span class="required-asterisk">*</span></label
                >

                <div class="autocomplete">
                  <div class="input-with-icon">
                    <i class="pi pi-user input-icon"></i>
                    <input
                      id="cliente"
                      v-model="buscaCliente"
                      type="text"
                      class="form-control pl-icon"
                      :class="{ 'input-invalid': foiValidado && !clienteValido }"
                      placeholder="Pesquise por nome ou CPF..."
                      autocomplete="off"
                      required
                      :disabled="bloqueado"
                      @focus="abrirLista('cliente')"
                      @click="abrirLista('cliente')"
                      @input="aoPesquisar('cliente')"
                      @keydown.down.prevent="moverSelecao('cliente', 1)"
                      @keydown.up.prevent="moverSelecao('cliente', -1)"
                      @keydown.enter.prevent="selecionarComTeclado('cliente')"
                      @keydown.esc="fecharListas"
                    />
                    <button
                      type="button"
                      class="btn-dropdown"
                      aria-label="Mostrar clientes"
                      :disabled="bloqueado"
                      @mousedown.prevent
                      @click="alternarLista('cliente')"
                    >
                      <i class="pi pi-chevron-down"></i>
                    </button>
                  </div>

                  <div v-if="listaAberta === 'cliente'" class="dropdown-list">
                    <div v-if="clientesFiltrados.length" class="dropdown-heading">
                      {{ clientesFiltrados.length }} cliente(s) disponível(is)
                    </div>

                    <button
                      v-for="(cliente, index) in clientesFiltrados"
                      :key="cliente.id"
                      type="button"
                      class="dropdown-option"
                      :class="{ 'option-active': indiceSelecionado.cliente === index }"
                      @mouseenter="indiceSelecionado.cliente = index"
                      @click="selecionarCliente(cliente)"
                    >
                      <span class="option-avatar"><i class="pi pi-user"></i></span>
                      <span class="option-details">
                        <strong>{{ cliente.nome }}</strong>
                        <small>CPF: {{ cliente.cpf || "Não informado" }}</small>
                      </span>
                      <i class="pi pi-check option-check"></i>
                    </button>

                    <div v-if="!clientesFiltrados.length" class="dropdown-empty">
                      Nenhum cliente encontrado.
                    </div>
                  </div>
                </div>

                <span v-if="foiValidado && !clienteValido" class="error-feedback visible">
                  Selecione um cliente da lista.
                </span>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="servico"
                    >Procedimento <span class="required-asterisk">*</span></label
                  >

                  <div class="input-with-icon">
                    <i class="pi pi-tag input-icon"></i>
                    <select
                      id="servico"
                      v-model="servicoSelecionado"
                      class="form-control pl-icon"
                      :class="{ 'input-invalid': foiValidado && !servicoSelecionado }"
                      required
                      :disabled="bloqueado"
                    >
                      <option value="" disabled>Selecione o procedimento...</option>
                      <option
                        v-for="servico in servicosDisponiveis"
                        :key="servico.id"
                        :value="String(servico.id)"
                      >
                        {{ servico.nome }}
                      </option>
                    </select>
                  </div>

                  <span
                    v-if="foiValidado && !servicoSelecionado"
                    class="error-feedback visible"
                  >
                    Selecione um procedimento.
                  </span>
                </div>

                <div class="form-group flex-1">
                  <label for="profissional">
                    Profissional responsável <span class="required-asterisk">*</span>
                  </label>

                  <div class="autocomplete">
                    <div class="input-with-icon">
                      <i class="pi pi-id-card input-icon"></i>
                      <input
                        id="profissional"
                        v-model="buscaProfissional"
                        type="text"
                        class="form-control pl-icon"
                        :class="{ 'input-invalid': foiValidado && !profissionalValido }"
                        placeholder="Pesquise por nome..."
                        autocomplete="off"
                        required
                        :disabled="bloqueado"
                        @focus="abrirLista('profissional')"
                        @click="abrirLista('profissional')"
                        @input="aoPesquisar('profissional')"
                        @keydown.down.prevent="moverSelecao('profissional', 1)"
                        @keydown.up.prevent="moverSelecao('profissional', -1)"
                        @keydown.enter.prevent="selecionarComTeclado('profissional')"
                        @keydown.esc="fecharListas"
                      />
                      <button
                        type="button"
                        class="btn-dropdown"
                        aria-label="Mostrar profissionais"
                        :disabled="bloqueado"
                        @mousedown.prevent
                        @click="alternarLista('profissional')"
                      >
                        <i class="pi pi-chevron-down"></i>
                      </button>
                    </div>

                    <div v-if="listaAberta === 'profissional'" class="dropdown-list">
                      <div v-if="profissionaisFiltrados.length" class="dropdown-heading">
                        {{ profissionaisFiltrados.length }} profissional(is)
                        disponível(is)
                      </div>

                      <button
                        v-for="(profissional, index) in profissionaisFiltrados"
                        :key="profissional.id"
                        type="button"
                        class="dropdown-option"
                        :class="{
                          'option-active': indiceSelecionado.profissional === index,
                        }"
                        @mouseenter="indiceSelecionado.profissional = index"
                        @click="selecionarProfissional(profissional)"
                      >
                        <span class="option-avatar professional-avatar">
                          <i class="pi pi-id-card"></i>
                        </span>
                        <span class="option-details">
                          <strong>{{ profissional.nome }}</strong>
                          <small>{{ rotuloFuncao(profissional.funcao) }}</small>
                        </span>
                        <i class="pi pi-check option-check"></i>
                      </button>

                      <div v-if="!profissionaisFiltrados.length" class="dropdown-empty">
                        Nenhum profissional encontrado.
                      </div>
                    </div>
                  </div>

                  <span
                    v-if="foiValidado && !profissionalValido"
                    class="error-feedback visible"
                  >
                    Selecione um profissional da lista.
                  </span>
                </div>
              </div>

              <div v-if="servicoAtual" class="referencia-box">
                <div class="referencia-item">
                  <i class="pi pi-stopwatch"></i>
                  <span>
                    Duração de referência
                    <strong>{{ formatarDuracao(servicoAtual.duracao) }}</strong>
                  </span>
                </div>
                <div class="referencia-item">
                  <i class="pi pi-wallet"></i>
                  <span>
                    Valor de referência
                    <strong>{{ formatarMoeda(servicoAtual.preco) }}</strong>
                  </span>
                </div>
              </div>

              <div v-if="mostrarPacotes" class="form-group">
                <label for="pacote">Pacote do cliente (opcional)</label>

                <div class="input-with-icon">
                  <i class="pi pi-box input-icon"></i>
                  <select
                    id="pacote"
                    v-model="form.pacote_id"
                    class="form-control pl-icon"
                    :disabled="bloqueado || pacotesCarregando"
                  >
                    <option value="">
                      {{
                        pacotesCarregando
                          ? "Buscando pacotes..."
                          : "Agendamento avulso (sem pacote)"
                      }}
                    </option>
                    <option
                      v-for="pacote in opcoesPacote"
                      :key="pacote.id"
                      :value="String(pacote.id)"
                      :disabled="pacote.semSaldo"
                    >
                      {{ pacote.rotulo }}
                    </option>
                  </select>
                </div>

                <small class="campo-ajuda">
                  <template v-if="!pacotesCarregando && !opcoesPacote.length">
                    Nenhum pacote ativo deste cliente para o procedimento escolhido.
                  </template>
                  <template v-else>
                    Ao salvar, uma sessão disponível do pacote é reservada para este
                    agendamento e só é consumida quando o atendimento for concluído.
                  </template>
                </small>
              </div>

              <div class="dates-box">
                <div class="form-group">
                  <label for="dataInicio"
                    >Data do agendamento <span class="required-asterisk">*</span></label
                  >
                  <input
                    id="dataInicio"
                    v-model="form.dataInicio"
                    type="date"
                    class="form-control"
                    required
                    :disabled="bloqueado"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label for="horaInicio"
                      >Hora de início <span class="required-asterisk">*</span></label
                    >
                    <input
                      id="horaInicio"
                      v-model="form.horaInicio"
                      type="time"
                      class="form-control"
                      required
                      :disabled="bloqueado"
                    />
                  </div>

                  <div class="form-group flex-1">
                    <label for="horaFim"
                      >Hora de término <span class="required-asterisk">*</span></label
                    >
                    <input
                      id="horaFim"
                      v-model="form.horaFim"
                      type="time"
                      class="form-control"
                      required
                      :disabled="bloqueado"
                      @input="fimManual = true"
                    />
                  </div>
                </div>

                <p v-if="duracaoEfetiva > 0" class="duracao-resumo">
                  <i class="pi pi-clock"></i>
                  Duração deste agendamento:
                  <strong>{{ formatarDuracao(duracaoEfetiva) }}</strong>
                  <span v-if="servicoAtual && duracaoEfetiva !== servicoAtual.duracao">
                    (referência: {{ formatarDuracao(servicoAtual.duracao) }})
                  </span>
                </p>
              </div>

              <div class="form-group">
                <label for="precoAcordado">Valor deste agendamento (opcional)</label>

                <div class="input-with-icon">
                  <i class="pi pi-wallet input-icon"></i>
                  <input
                    id="precoAcordado"
                    v-model="form.precoAcordado"
                    type="text"
                    inputmode="decimal"
                    class="form-control pl-icon"
                    :class="{ 'input-error': precoInvalido }"
                    placeholder="Em branco = valor de referência"
                    maxlength="12"
                    autocomplete="off"
                    :disabled="bloqueado"
                  />
                </div>

                <span v-if="precoInvalido" class="error-feedback visible">
                  Informe um valor válido, maior ou igual a zero.
                </span>
                <small v-else class="campo-ajuda">
                  Vale apenas para este agendamento e não altera o valor do procedimento.
                </small>
              </div>

              <div class="form-group observacoes-group">
                <label for="observacoes">Observações</label>
                <textarea
                  id="observacoes"
                  v-model="form.observacoes"
                  class="form-control textarea"
                  rows="3"
                  placeholder="Detalhes adicionais sobre o atendimento..."
                  :disabled="bloqueado"
                ></textarea>
              </div>
            </div>

            <footer class="modal-footer">
              <div v-if="editing && (permitirCancelar || permitirFalta)" class="footer-extras">
                <button
                  v-if="permitirCancelar"
                  type="button"
                  class="btn-excluir"
                  @click="$emit('cancelar-agendamento')"
                >
                  <i class="pi pi-ban"></i>
                  Cancelar agendamento
                </button>

                <button
                  v-if="permitirFalta"
                  type="button"
                  class="btn-falta"
                  @click="$emit('registrar-falta')"
                >
                  <i class="pi pi-user-minus"></i>
                  Registrar falta
                </button>
              </div>

              <div class="footer-actions">
                <button type="button" class="btn-cancelar" @click="fechar">
                  Fechar
                </button>
                <button
                  v-if="!bloqueado"
                  type="submit"
                  class="btn-salvar"
                  :disabled="salvando"
                >
                  <i v-if="salvando" class="pi pi-spin pi-spinner"></i>
                  {{
                    salvando
                      ? "Salvando..."
                      : editing
                        ? "Salvar alterações"
                        : "Criar agendamento"
                  }}
                </button>
              </div>
            </footer>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { listarPacotes } from "@/services/agendamentos";
import {
  diferencaMinutos,
  formatarDuracao,
  formatarMoeda,
  interpretarPreco,
  somarMinutosAoHorario,
} from "@/utils/agendamentos";

const props = defineProps({
  isOpen: Boolean,
  editing: Boolean,
  form: { type: Object, required: true },
  clientesBD: { type: Array, default: () => [] },
  servicosBD: { type: Array, default: () => [] },
  profissionaisBD: { type: Array, default: () => [] },
  isValid: Boolean,
  salvando: Boolean,
  alerta: { type: Object, default: null },
  avisosAcesso: { type: Array, default: () => [] },
  somenteLeitura: Boolean,
  mensagemSomenteLeitura: { type: String, default: "" },
  permitirCancelar: Boolean,
  permitirFalta: Boolean,
});

const emit = defineEmits([
  "close",
  "save",
  "cancelar-agendamento",
  "registrar-falta",
  "notify",
  "limpar-alerta",
]);

const corpoRef = ref(null);
const foiValidado = ref(false);
const listaAberta = ref(null);
const buscaCliente = ref("");
const buscaProfissional = ref("");
const indiceSelecionado = ref({ cliente: 0, profissional: 0 });

const clienteEscolhido = ref(null);
const profissionalEscolhido = ref(null);
const servicoSelecionado = ref("");

const fimManual = ref(false);
const sincronizando = ref(false);

const pacotes = ref([]);
const pacotesCarregando = ref(false);
const pacotesIndisponivel = ref(false);
const origemInicial = ref({ cliente: "", servico: "", pacote: "" });

let tokenPacotes = 0;

const bloqueado = computed(() => props.somenteLeitura);

const tituloModal = computed(() => {
  if (props.somenteLeitura && props.editing) return "Detalhes do Agendamento";
  return props.editing ? "Editar Agendamento" : "Novo Agendamento";
});

const subtituloModal = computed(() =>
  props.somenteLeitura && props.editing
    ? "Consulte os dados deste atendimento."
    : "Preencha os dados para organizar o atendimento."
);

const rotulosFuncao = {
  PROFISSIONAL: "Profissional",
  ADMIN: "Administrador",
  SECRETARIO: "Secretário",
};

const rotuloFuncao = (funcao) => rotulosFuncao[funcao] || "Profissional";

const normalizarTexto = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

const apenasNumeros = (valor) => String(valor ?? "").replace(/\D/g, "");

const incluirAtual = (lista, id, nome, extra = {}) => {
  if (!id || !nome) return lista;

  if (lista.some((item) => String(item.id) === String(id))) return lista;

  return [...lista, { id, nome, ...extra }];
};

const clientesDisponiveis = computed(() =>
  incluirAtual(props.clientesBD, props.form.cliente_id, props.form.cliente, {
    cpf: "",
  })
);

const profissionaisDisponiveis = computed(() =>
  incluirAtual(
    props.profissionaisBD,
    props.form.profissional_id,
    props.form.profissional,
    { funcao: "" }
  )
);

const servicosDisponiveis = computed(() =>
  incluirAtual(props.servicosBD, props.form.servico_id, props.form.servico, {
    preco: props.form.servicoPreco ?? null,
    duracao: props.form.servicoDuracao ?? null,
  })
);

const servicoAtual = computed(
  () =>
    servicosDisponiveis.value.find(
      (item) => String(item.id) === String(servicoSelecionado.value)
    ) || null
);

const pesquisarPessoa = (lista, busca) => {
  const termo = String(busca ?? "").trim();
  if (!termo) return lista;

  const numero = apenasNumeros(termo);
  const buscaNumerica = /^[\d\s.()/*-]+$/.test(termo);

  if (buscaNumerica && numero) {
    return lista.filter((pessoa) => apenasNumeros(pessoa.cpf).includes(numero));
  }

  const texto = normalizarTexto(termo);

  return lista.filter((pessoa) => {
    const nome = normalizarTexto(pessoa.nome);
    const cpf = apenasNumeros(pessoa.cpf);

    return nome.includes(texto) || (numero.length >= 3 && cpf.includes(numero));
  });
};

const clientesFiltrados = computed(() =>
  pesquisarPessoa(clientesDisponiveis.value, buscaCliente.value)
);

const profissionaisFiltrados = computed(() =>
  pesquisarPessoa(profissionaisDisponiveis.value, buscaProfissional.value)
);

const clienteValido = computed(
  () =>
    Boolean(clienteEscolhido.value) &&
    clientesDisponiveis.value.some(
      (item) => String(item.id) === String(clienteEscolhido.value.id)
    )
);

const profissionalValido = computed(
  () =>
    Boolean(profissionalEscolhido.value) &&
    profissionaisDisponiveis.value.some(
      (item) => String(item.id) === String(profissionalEscolhido.value.id)
    )
);

const duracaoEfetiva = computed(() =>
  diferencaMinutos(
    props.form.dataInicio,
    props.form.horaInicio,
    props.form.dataInicio,
    props.form.horaFim
  )
);

const precoInvalido = computed(() => {
  const resultado = interpretarPreco(props.form.precoAcordado);

  return !resultado.vazio && resultado.valor === null;
});

const mostrarPacotes = computed(
  () =>
    !pacotesIndisponivel.value &&
    Boolean(clienteEscolhido.value) &&
    Boolean(servicoSelecionado.value)
);

const opcoesPacote = computed(() => {
  const opcoes = pacotes.value.map((pacote) => {
    const saldo = Number(pacote.saldo_sessoes ?? 0);
    const nome = pacote.modelo_nome || pacote.servico_nome || "Pacote";

    return {
      id: pacote.id,
      semSaldo: saldo <= 0,
      rotulo: `${nome} — ${saldo} ${
        saldo === 1 ? "sessão disponível" : "sessões disponíveis"
      }`,
    };
  });

  const atual = props.form.pacote_id;
  const mesmoContexto =
    String(origemInicial.value.cliente) === String(props.form.cliente_id) &&
    String(origemInicial.value.servico) === String(props.form.servico_id);

  if (
    atual &&
    mesmoContexto &&
    !opcoes.some((opcao) => String(opcao.id) === String(atual))
  ) {
    opcoes.push({
      id: atual,
      semSaldo: false,
      rotulo: `${props.form.pacoteNome || "Pacote vinculado"} — vinculado`,
    });
  }

  return opcoes;
});

const abrirLista = (tipo) => {
  if (bloqueado.value) return;

  listaAberta.value = tipo;
  indiceSelecionado.value[tipo] = 0;
};

const fecharListas = () => {
  listaAberta.value = null;
};

const alternarLista = (tipo) => {
  if (listaAberta.value === tipo) fecharListas();
  else abrirLista(tipo);
};

const aoPesquisar = (tipo) => {
  if (tipo === "cliente") {
    clienteEscolhido.value = null;
    props.form.cliente = "";
    props.form.cliente_id = "";
  } else {
    profissionalEscolhido.value = null;
    props.form.profissional = "";
    props.form.profissional_id = "";
  }

  abrirLista(tipo);
};

const moverSelecao = (tipo, direcao) => {
  if (listaAberta.value !== tipo) abrirLista(tipo);

  const quantidade =
    tipo === "cliente"
      ? clientesFiltrados.value.length
      : profissionaisFiltrados.value.length;

  if (!quantidade) return;

  const atual = indiceSelecionado.value[tipo];
  indiceSelecionado.value[tipo] = (atual + direcao + quantidade) % quantidade;
};

const selecionarComTeclado = (tipo) => {
  if (listaAberta.value !== tipo) {
    abrirLista(tipo);
    return;
  }

  if (tipo === "cliente") {
    const pessoa = clientesFiltrados.value[indiceSelecionado.value.cliente];
    if (pessoa) selecionarCliente(pessoa);
  } else {
    const pessoa = profissionaisFiltrados.value[indiceSelecionado.value.profissional];
    if (pessoa) selecionarProfissional(pessoa);
  }
};

const selecionarCliente = (cliente) => {
  clienteEscolhido.value = cliente;
  buscaCliente.value = cliente.nome;
  props.form.cliente = cliente.nome;
  props.form.cliente_id = cliente.id;
  fecharListas();
};

const selecionarProfissional = (profissional) => {
  profissionalEscolhido.value = profissional;
  buscaProfissional.value = profissional.nome;
  props.form.profissional = profissional.nome;
  props.form.profissional_id = profissional.id;
  fecharListas();
};

const sugerirFim = () => {
  if (fimManual.value || bloqueado.value) return;
  if (!servicoAtual.value || !props.form.horaInicio) return;

  const sugestao = somarMinutosAoHorario(
    props.form.horaInicio,
    servicoAtual.value.duracao
  );

  if (sugestao) props.form.horaFim = sugestao;
};

const carregarPacotes = async () => {
  const cliente = clienteEscolhido.value?.id;
  const servico = servicoSelecionado.value;
  const token = ++tokenPacotes;

  pacotes.value = [];

  if (!cliente || !servico || bloqueado.value) {
    pacotesCarregando.value = false;
    return;
  }

  pacotesCarregando.value = true;

  try {
    const dados = await listarPacotes({
      cliente,
      servico,
      status: "ATIVO",
    });

    if (token !== tokenPacotes) return;

    pacotesIndisponivel.value = false;
    pacotes.value = dados;
  } catch (erro) {
    if (token !== tokenPacotes) return;

    pacotesIndisponivel.value = erro?.response?.status === 403;
  } finally {
    if (token === tokenPacotes) pacotesCarregando.value = false;
  }

  if (token !== tokenPacotes) return;

  const atual = props.form.pacote_id;

  if (!atual) return;

  const existe = pacotes.value.some(
    (pacote) => String(pacote.id) === String(atual)
  );
  const mesmoContexto =
    String(origemInicial.value.cliente) === String(cliente) &&
    String(origemInicial.value.servico) === String(servico);

  if (!existe && !mesmoContexto) props.form.pacote_id = "";
};

const sincronizarFormulario = () => {
  sincronizando.value = true;

  buscaCliente.value = props.form.cliente || "";
  buscaProfissional.value = props.form.profissional || "";
  servicoSelecionado.value = props.form.servico_id
    ? String(props.form.servico_id)
    : "";

  clienteEscolhido.value =
    clientesDisponiveis.value.find(
      (item) => String(item.id) === String(props.form.cliente_id)
    ) || null;

  profissionalEscolhido.value =
    profissionaisDisponiveis.value.find(
      (item) => String(item.id) === String(props.form.profissional_id)
    ) || null;

  if (clienteEscolhido.value) {
    props.form.cliente = clienteEscolhido.value.nome;
    props.form.cliente_id = clienteEscolhido.value.id;
    buscaCliente.value = clienteEscolhido.value.nome;
  }

  if (profissionalEscolhido.value) {
    props.form.profissional = profissionalEscolhido.value.nome;
    props.form.profissional_id = profissionalEscolhido.value.id;
    buscaProfissional.value = profissionalEscolhido.value.nome;
  }

  props.form.pacote_id = props.form.pacote_id ? String(props.form.pacote_id) : "";

  origemInicial.value = {
    cliente: props.form.cliente_id || "",
    servico: props.form.servico_id || "",
    pacote: props.form.pacote_id || "",
  };

  fimManual.value = props.editing || Boolean(props.form.horaFim);
  pacotesIndisponivel.value = false;

  carregarPacotes();

  nextTick(() => {
    sincronizando.value = false;
  });
};

const salvar = () => {
  if (bloqueado.value) return;

  foiValidado.value = true;

  const servico = servicoAtual.value;

  if (!clienteValido.value || !profissionalValido.value || !servico) {
    emit("notify", {
      message: "Selecione um cliente, procedimento e profissional válidos.",
      type: "error",
    });
    return;
  }

  if (!props.form.dataInicio || !props.form.horaInicio || !props.form.horaFim) {
    emit("notify", { message: "Preencha a data e os horários.", type: "error" });
    return;
  }

  if (props.form.horaFim <= props.form.horaInicio) {
    emit("notify", {
      message: "A hora de término deve ser posterior à hora de início.",
      type: "error",
    });
    return;
  }

  if (precoInvalido.value) {
    emit("notify", {
      message: "Informe um valor válido para o agendamento.",
      type: "error",
    });
    return;
  }

  props.form.cliente = clienteEscolhido.value.nome;
  props.form.cliente_id = clienteEscolhido.value.id;
  props.form.profissional = profissionalEscolhido.value.nome;
  props.form.profissional_id = profissionalEscolhido.value.id;
  props.form.servico = servico.nome;
  props.form.servico_id = servico.id;
  props.form.dataFim = props.form.dataInicio;

  emit("save");
};

const fechar = () => {
  fecharListas();
  emit("close");
};

watch(
  () => props.isOpen,
  (aberto) => {
    if (aberto) {
      foiValidado.value = false;
      fecharListas();
      sincronizarFormulario();
    } else {
      fecharListas();
    }
  }
);

watch(servicoSelecionado, (id) => {
  if (!props.isOpen || sincronizando.value) return;

  const servico = servicosDisponiveis.value.find(
    (item) => String(item.id) === String(id)
  );

  if (servico) {
    props.form.servico = servico.nome;
    props.form.servico_id = servico.id;
  }

  sugerirFim();
  carregarPacotes();
});

watch(
  () => clienteEscolhido.value?.id,
  () => {
    if (!props.isOpen || sincronizando.value) return;

    carregarPacotes();
  }
);

watch(
  () => props.form.horaInicio,
  () => {
    if (!props.isOpen || sincronizando.value) return;

    sugerirFim();
  }
);

watch(
  () => [
    props.form.dataInicio,
    props.form.horaInicio,
    props.form.horaFim,
    props.form.profissional_id,
    props.form.cliente_id,
  ],
  () => {
    if (props.isOpen && props.alerta && !sincronizando.value) {
      emit("limpar-alerta");
    }
  }
);

watch(
  () => props.alerta,
  (alerta) => {
    if (!alerta) return;

    nextTick(() => {
      corpoRef.value?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
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
  max-width: 760px;
  max-height: calc(100dvh - 2rem);
  display: flex;
  flex-direction: column;
  overflow: visible;
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
  padding: 1.35rem 1.65rem;
  border-radius: 18px 18px 0 0;
  background: #1f2937;
  color: #fff;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 0.35rem 0 0;
  color: #cbd5e1;
  font-size: 0.82rem;
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
  transition: background 0.2s, transform 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: rotate(4deg);
}

.modal-form {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: visible;
}

.modal-body {
  min-height: 0;
  padding: 1.5rem 1.65rem;
  overflow-y: auto;
  overflow-x: clip;
}

.form-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  margin-bottom: 1.2rem;
}

.form-group > label,
.label-row > label {
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
}

.required-asterisk {
  color: #ef4444;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.autocomplete,
.input-with-icon {
  position: relative;
  width: 100%;
  min-width: 0;
}

.input-with-icon {
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  z-index: 1;
  color: #94a3b8;
  pointer-events: none;
}

.form-control {
  display: block;
  width: 100%;
  min-width: 0;
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

.pl-icon {
  padding-left: 2.65rem;
}

.autocomplete .form-control {
  padding-right: 2.75rem;
}

.form-control:focus {
  border-color: #1ca4a7;
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.12);
}

.form-control.input-invalid {
  border-color: #ef4444;
  background: #fffafa;
}

.btn-dropdown {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 0 10px 10px 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
}

.btn-dropdown:hover {
  background: #f8fafc;
  color: #0f999b;
}

.dropdown-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 2100;
  max-height: 230px;
  overflow-y: auto;
  padding: 5px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.17);
  animation: dropdown-enter 0.16s ease both;
}

.dropdown-heading {
  padding: 8px 10px;
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.dropdown-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 0;
  border-radius: 9px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-option:hover,
.dropdown-option.option-active {
  background: #f0fdfa;
}

.option-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #e6fffb;
  color: #0f999b;
}

.professional-avatar {
  background: #eef2ff;
  color: #6366f1;
}

.option-details {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.option-details strong {
  overflow: hidden;
  color: #1f2937;
  font-size: 0.85rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-details small {
  color: #64748b;
  font-size: 0.74rem;
}

.option-check {
  color: #0f999b;
  opacity: 0;
}

.dropdown-option:hover .option-check,
.dropdown-option.option-active .option-check {
  opacity: 1;
}

.dropdown-empty {
  padding: 18px 10px;
  color: #64748b;
  font-size: 0.84rem;
  text-align: center;
}

.form-row {
  display: flex;
  gap: 1.2rem;
}

.flex-1 {
  flex: 1;
}

.dates-box {
  margin: 0.3rem 0 1.2rem;
  padding: 1.1rem 1.15rem 0.1rem;
  border: 1px solid #e7edf2;
  border-radius: 13px;
  background: #f8fafc;
}

.error-feedback {
  display: none;
  color: #dc2626;
  font-size: 0.75rem;
}

.error-feedback.visible {
  display: block;
}

.modal-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.65rem;
  border-top: 1px solid #e8edf2;
  border-radius: 0 0 18px 18px;
  background: #f8fafc;
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.btn-cancelar,
.btn-salvar,
.btn-excluir {
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

.btn-cancelar {
  border: 1px solid #dfe6ee;
  background: #fff;
  color: #475569;
}

.btn-cancelar:hover {
  background: #f1f5f9;
}

.btn-salvar {
  border: 0;
  background: #15999c;
  color: #fff;
}

.btn-salvar:hover {
  background: #117f82;
  transform: translateY(-1px);
}

.btn-excluir {
  border: 1px solid #fecaca;
  background: #fff;
  color: #dc2626;
}

.btn-excluir:hover {
  background: #fef2f2;
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

.alerta {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-bottom: 1.2rem;
  padding: 1rem 1.05rem;
  border: 1px solid #fecaca;
  border-radius: 14px;
  background: #fef2f2;
  color: #991b1b;
  animation: dropdown-enter 0.25s ease both;
}

.alerta.conflito {
  border-color: #fed7aa;
  background: linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%);
  color: #9a3412;
}

.alerta-icone {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(220, 38, 38, 0.12);
  font-size: 1rem;
}

.alerta.conflito .alerta-icone {
  background: rgba(234, 88, 12, 0.14);
}

.alerta-conteudo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.alerta-conteudo strong {
  font-size: 0.88rem;
}

.alerta-conteudo p {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.5;
}

.alerta-conteudo small {
  margin-top: 0.15rem;
  font-size: 0.76rem;
  opacity: 0.85;
  line-height: 1.45;
}

.alerta-fechar {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s, background 0.2s;
}

.alerta-fechar:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

.aviso {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 1rem;
  padding: 0.75rem 0.95rem;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #eff6ff;
  color: #1e40af;
  font-size: 0.8rem;
  line-height: 1.45;
}

.aviso i {
  margin-top: 2px;
}

.referencia-box {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  margin: -0.35rem 0 1.2rem;
  padding: 0.8rem 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #fbfdff;
}

.referencia-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: #64748b;
  font-size: 0.78rem;
}

.referencia-item i {
  color: #15999c;
  font-size: 0.95rem;
}

.referencia-item span {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.referencia-item strong {
  color: #1f2937;
  font-size: 0.88rem;
}

.campo-ajuda {
  color: #64748b;
  font-size: 0.74rem;
  line-height: 1.4;
}

.duracao-resumo {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0 0 1rem;
  color: #475569;
  font-size: 0.8rem;
}

.duracao-resumo i {
  color: #15999c;
}

.duracao-resumo strong {
  color: #1f2937;
}

.textarea {
  min-height: 84px;
  resize: vertical;
}

.observacoes-group {
  margin-bottom: 0.4rem;
}

.input-error {
  border-color: #ef4444;
}

.form-control:disabled,
.btn-dropdown:disabled {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

.footer-extras {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.btn-falta {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.1rem;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  background: #fff;
  color: #c2410c;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.btn-falta:hover {
  background: #fff7ed;
}

.btn-salvar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

@keyframes dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 650px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-container {
    max-height: calc(100dvh - 1rem);
    border-radius: 14px;
  }

  .modal-header,
  .modal-footer {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
    overflow-y: auto;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .modal-footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .footer-actions {
    width: 100%;
  }

  .footer-actions button {
    flex: 1;
    padding-inline: 0.5rem;
  }

  .footer-extras {
    width: 100%;
    flex-direction: column;
  }

  .btn-excluir,
  .btn-falta {
    width: 100%;
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