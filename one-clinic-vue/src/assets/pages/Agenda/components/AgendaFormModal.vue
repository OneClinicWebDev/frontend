<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="fechar">
      <Transition name="scale">
        <div v-if="isOpen" class="modal-container">
          <header class="modal-header">
            <div>
              <h3>{{ editing ? "Editar Agendamento" : "Novo Agendamento" }}</h3>
              <p class="header-subtitle">
                Preencha os dados para organizar o atendimento.
              </p>
            </div>
            <button type="button" class="btn-close" aria-label="Fechar" @click="fechar">
              <i class="pi pi-times"></i>
            </button>
          </header>

          <form class="modal-form" novalidate @submit.prevent="salvar">
            <div class="modal-body">
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
                  <div class="label-row">
                    <label for="servico"
                      >Procedimento <span class="required-asterisk">*</span></label
                    >
                    <button
                      type="button"
                      class="btn-text-action"
                      @click="toggleNovoServico"
                    >
                      <i
                        :class="isCriandoServico ? 'pi pi-arrow-left' : 'pi pi-plus'"
                      ></i>
                      {{ isCriandoServico ? "Voltar à lista" : "Novo procedimento" }}
                    </button>
                  </div>

                  <div v-if="!isCriandoServico" class="input-with-icon">
                    <i class="pi pi-tag input-icon"></i>
                    <select
                      id="servico"
                      v-model="servicoSelecionado"
                      class="form-control pl-icon"
                      :class="{ 'input-invalid': foiValidado && !servicoSelecionado }"
                      required
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

                  <div v-else class="input-with-icon">
                    <i class="pi pi-plus-circle input-icon"></i>
                    <input
                      v-model="novoServicoInput"
                      type="text"
                      class="form-control pl-icon input-with-append"
                      placeholder="Nome do procedimento..."
                      maxlength="150"
                      @keydown.enter.prevent="adicionarServico"
                    />
                    <button
                      type="button"
                      class="btn-inside-append"
                      aria-label="Salvar procedimento"
                      @click="adicionarServico"
                    >
                      <i class="pi pi-check"></i>
                    </button>
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
                        placeholder="Pesquise por nome ou CPF..."
                        autocomplete="off"
                        required
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
                          <small>CPF: {{ profissional.cpf || "Não informado" }}</small>
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
                    />
                  </div>
                </div>
              </div>

              <div class="form-group status-group">
                <label
                  >Status do agendamento <span class="required-asterisk">*</span></label
                >

                <div class="status-toggle">
                  <div class="toggle-slider" :class="form.status || 'confirmado'"></div>
                  <label
                    v-for="status in statusOptions"
                    :key="status.value"
                    class="toggle-option"
                    :class="{ active: (form.status || 'confirmado') === status.value }"
                  >
                    <input v-model="form.status" type="radio" :value="status.value" />
                    <span>{{ status.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <footer class="modal-footer">
              <button
                v-if="editing"
                type="button"
                class="btn-excluir"
                @click="$emit('delete')"
              >
                <i class="pi pi-trash"></i>
                Excluir
              </button>

              <div class="footer-actions">
                <button type="button" class="btn-cancelar" @click="fechar">
                  Cancelar
                </button>
                <button type="submit" class="btn-salvar">
                  {{ editing ? "Salvar alterações" : "Criar agendamento" }}
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
import { ref, computed, watch } from "vue";

const props = defineProps({
  isOpen: Boolean,
  editing: Boolean,
  form: { type: Object, required: true },
  clientesBD: { type: Array, default: () => [] },
  servicosBD: { type: Array, default: () => [] },
  profissionaisBD: { type: Array, default: () => [] },
  isValid: Boolean,
});

const emit = defineEmits(["close", "save", "delete", "notify", "add-servico"]);

const foiValidado = ref(false);
const isCriandoServico = ref(false);
const novoServicoInput = ref("");
const listaAberta = ref(null);
const buscaCliente = ref("");
const buscaProfissional = ref("");
const indiceSelecionado = ref({ cliente: 0, profissional: 0 });
const servicosLocais = ref([]);

const clienteEscolhido = ref(null);
const profissionalEscolhido = ref(null);
const servicoSelecionado = ref("");

const statusOptions = [
  { value: "confirmado", label: "Confirmado" },
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "cancelado", label: "Cancelado" },
];

const clientesExemplo = [
  { id: "demo-cliente-1", nome: "Ana Carolina Souza", cpf: "123.456.789-01" },
  { id: "demo-cliente-2", nome: "Beatriz Oliveira", cpf: "234.567.890-12" },
  { id: "demo-cliente-3", nome: "Camila Fernandes", cpf: "345.678.901-23" },
  { id: "demo-cliente-4", nome: "Mariana Costa", cpf: "456.789.012-34" },
  { id: "demo-cliente-5", nome: "Juliana Martins", cpf: "567.890.123-45" },
];

const profissionaisExemplo = [
  { id: "demo-profissional-1", nome: "Amanda Rodrigues", cpf: "123.456.789-10" },
  { id: "demo-profissional-2", nome: "Fernanda Almeida", cpf: "234.567.890-21" },
  { id: "demo-profissional-3", nome: "Isabela Santos", cpf: "345.678.901-32" },
  { id: "demo-profissional-4", nome: "Patrícia Ribeiro", cpf: "456.789.012-43" },
];

const normalizarTexto = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

const apenasNumeros = (valor) => String(valor ?? "").replace(/\D/g, "");

const prepararPessoa = (pessoa, indice, tipo) => {
  if (typeof pessoa === "string") {
    return { id: `${tipo}-${indice}-${pessoa}`, nome: pessoa, cpf: "" };
  }

  return {
    ...pessoa,
    id: pessoa.id ?? `${tipo}-${indice}-${pessoa.nome ?? "pessoa"}`,
    nome: pessoa.nome ?? "",
    cpf: pessoa.cpf ?? "",
  };
};

const unirPessoas = (listaPrincipal, listaExemplo, tipo) => {
  const mapa = new Map();

  [...listaPrincipal, ...listaExemplo].forEach((pessoa, indice) => {
    const preparada = prepararPessoa(pessoa, indice, tipo);
    const chave = normalizarTexto(preparada.nome);

    if (chave && !mapa.has(chave)) mapa.set(chave, preparada);
  });

  return [...mapa.values()];
};

const clientesDisponiveis = computed(() =>
  unirPessoas(props.clientesBD, clientesExemplo, "cliente")
);

const profissionaisDisponiveis = computed(() =>
  unirPessoas(props.profissionaisBD, profissionaisExemplo, "profissional")
);

const servicosDisponiveis = computed(() => {
  const mapa = new Map();

  [...props.servicosBD, ...servicosLocais.value].forEach((item, indice) => {
    const nome = typeof item === "string" ? item : item?.nome;
    if (!nome) return;

    const chave = normalizarTexto(nome);

    if (!mapa.has(chave)) {
      mapa.set(chave, {
        id: item?.id ?? `servico-${indice}-${chave}`,
        nome,
      });
    }
  });

  return [...mapa.values()];
});

const pesquisarPessoa = (lista, busca) => {
  const termo = String(busca ?? "").trim();
  if (!termo) return lista;

  const numero = apenasNumeros(termo);
  const buscaNumerica = /^[\d\s.()/-]+$/.test(termo);

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

const abrirLista = (tipo) => {
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

const toggleNovoServico = () => {
  isCriandoServico.value = !isCriandoServico.value;
  novoServicoInput.value = "";
  fecharListas();
};

const adicionarServico = () => {
  const nome = novoServicoInput.value.trim();

  if (nome.length < 3) {
    emit("notify", {
      message: "Informe um procedimento com pelo menos 3 caracteres.",
      type: "error",
    });
    return;
  }

  const existente = servicosDisponiveis.value.find(
    (servico) => normalizarTexto(servico.nome) === normalizarTexto(nome)
  );

  if (existente) {
    servicoSelecionado.value = String(existente.id);
    props.form.servico = existente.nome;
    props.form.servico_id = existente.id;
    isCriandoServico.value = false;
    novoServicoInput.value = "";
    return;
  }

  const novoServico = { id: `local-${Date.now()}`, nome };
  servicosLocais.value.push(novoServico);

  servicoSelecionado.value = String(novoServico.id);
  props.form.servico = novoServico.nome;
  props.form.servico_id = novoServico.id;

  emit("add-servico", nome);

  isCriandoServico.value = false;
  novoServicoInput.value = "";
};

const sincronizarFormulario = () => {
  buscaCliente.value = props.form.cliente || "";
  buscaProfissional.value = props.form.profissional || "";
  servicoSelecionado.value = props.form.servico_id ? String(props.form.servico_id) : "";

  clienteEscolhido.value =
    clientesDisponiveis.value.find(
      (item) => String(item.id) === String(props.form.cliente_id)
    ) ||
    clientesDisponiveis.value.find(
      (item) => normalizarTexto(item.nome) === normalizarTexto(props.form.cliente)
    ) ||
    null;

  profissionalEscolhido.value =
    profissionaisDisponiveis.value.find(
      (item) => String(item.id) === String(props.form.profissional_id)
    ) ||
    profissionaisDisponiveis.value.find(
      (item) => normalizarTexto(item.nome) === normalizarTexto(props.form.profissional)
    ) ||
    null;

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

  const servicoAtual =
    servicosDisponiveis.value.find(
      (item) => String(item.id) === String(props.form.servico_id)
    ) ||
    servicosDisponiveis.value.find(
      (item) => normalizarTexto(item.nome) === normalizarTexto(props.form.servico)
    );

  if (servicoAtual) {
    servicoSelecionado.value = String(servicoAtual.id);
    props.form.servico = servicoAtual.nome;
    props.form.servico_id = servicoAtual.id;
  }
};

const salvar = () => {
  foiValidado.value = true;

  const servico = servicosDisponiveis.value.find(
    (item) => String(item.id) === String(servicoSelecionado.value)
  );

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
      isCriandoServico.value = false;
      novoServicoInput.value = "";
      fecharListas();
      sincronizarFormulario();
    } else {
      fecharListas();
    }
  }
);

watch(
  () => props.form.servico_id,
  (id) => {
    if (!id) return;

    const servico = servicosDisponiveis.value.find(
      (item) => String(item.id) === String(id)
    );

    if (servico) {
      servicoSelecionado.value = String(servico.id);
      props.form.servico = servico.nome;
    }
  }
);

watch(servicosDisponiveis, () => {
  if (!props.isOpen) return;

  const servico = servicosDisponiveis.value.find(
    (item) => normalizarTexto(item.nome) === normalizarTexto(props.form.servico)
  );

  if (servico) {
    servicoSelecionado.value = String(servico.id);
    props.form.servico_id = servico.id;
  }
});

watch(
  () => props.form.cliente_id,
  () => {
    if (props.isOpen) sincronizarFormulario();
  }
);

watch(
  () => props.form.profissional_id,
  () => {
    if (props.isOpen) sincronizarFormulario();
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

.btn-text-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: #0f999b;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-text-action:hover {
  color: #087d80;
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

.input-with-append {
  padding-right: 3.2rem;
}

.btn-inside-append {
  position: absolute;
  right: 6px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: #1ca4a7;
  color: #fff;
  cursor: pointer;
}

.btn-inside-append:hover {
  background: #158a8d;
}

.dates-box {
  margin: 0.3rem 0 1.2rem;
  padding: 1.1rem 1.15rem 0.1rem;
  border: 1px solid #e7edf2;
  border-radius: 13px;
  background: #f8fafc;
}

.status-group {
  margin-bottom: 0;
}

.status-toggle {
  --toggle-padding: 4px;
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  padding: var(--toggle-padding);
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  background: #f1f5f9;
}

.toggle-slider {
  position: absolute;
  z-index: -1;
  top: var(--toggle-padding);
  bottom: var(--toggle-padding);
  left: var(--toggle-padding);
  width: calc((100% - 8px) / 4);
  border-radius: 7px;
  pointer-events: none;
  transition: transform 0.25s ease, background-color 0.25s ease;
}

.toggle-slider.confirmado {
  transform: translateX(0);
  background: #10b981;
}

.toggle-slider.pendente {
  transform: translateX(100%);
  background: #f97316;
}

.toggle-slider.em_andamento {
  transform: translateX(200%);
  background: #3b82f6;
}

.toggle-slider.cancelado {
  transform: translateX(300%);
  background: #ef4444;
}

.toggle-option {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0.65rem 0.2rem;
  border-radius: 7px;
  color: #64748b;
  font-size: 0.73rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.toggle-option input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.toggle-option.active {
  color: #fff;
}

.toggle-option:focus-within {
  outline: 2px solid #1f2937;
  outline-offset: -2px;
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

  .status-toggle {
    min-height: 54px;
  }

  .toggle-option {
    padding: 0.45rem 0.08rem;
    font-size: 0.66rem;
    overflow-wrap: anywhere;
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

  .btn-excluir {
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
