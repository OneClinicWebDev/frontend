import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "@/store/auth";
import {
  listarAgendamentos,
  criarAgendamento,
  atualizarAgendamento,
  cancelarAgendamento,
  registrarFaltaAgendamento,
  listarClientes,
  listarColaboradores,
  listarServicos,
} from "@/services/agendamentos";
import {
  camposParaIso,
  interpretarErro,
  normalizarAgendamento,
} from "@/utils/agendamentos";

export function useAgendamentos() {
  const auth = useAuthStore();

  const agora = ref(new Date());
  const registros = ref([]);
  const carregando = ref(false);
  const erroCarregamento = ref("");
  const salvando = ref(false);
  const processandoAcao = ref(false);

  const clientes = ref([]);
  const colaboradores = ref([]);
  const servicos = ref([]);
  const acessoNegado = ref({
    clientes: false,
    colaboradores: false,
    servicos: false,
  });

  let temporizador;
  let contadorRequisicao = 0;

  onMounted(() => {
    temporizador = setInterval(() => {
      agora.value = new Date();
    }, 30000);
  });

  onBeforeUnmount(() => {
    if (temporizador) clearInterval(temporizador);
  });

  const perfil = computed(() => auth.clinicaAtiva?.role || "");

  const podeGerenciar = computed(() =>
    ["ADMIN", "SECRETARIO"].includes(perfil.value)
  );

  const podeEditarAgenda = computed(
    () =>
      podeGerenciar.value ||
      (perfil.value === "PROFISSIONAL" &&
        Boolean(auth.clinicaAtiva?.pode_editar_agenda))
  );

  const agendamentos = computed(() =>
    registros.value.map((registro) =>
      normalizarAgendamento(registro, agora.value)
    )
  );

  const clientesBD = computed(() =>
    clientes.value
      .filter((cliente) => cliente.status_cadastro === "ATIVO")
      .map((cliente) => ({
        id: cliente.id,
        nome: cliente.usuario_nome || "Cliente sem nome",
        cpf: cliente.usuario_cpf || "",
        telefone: cliente.telefone || "",
      }))
  );

  const profissionaisBD = computed(() => {
    if (!acessoNegado.value.colaboradores) {
      return colaboradores.value
        .filter(
          (colaborador) =>
            colaborador.ativo &&
            ["PROFISSIONAL", "ADMIN"].includes(colaborador.role_nome)
        )
        .map((colaborador) => ({
          id: colaborador.id,
          nome: colaborador.usuario_nome || "Profissional sem nome",
          funcao: colaborador.role_nome,
        }));
    }

    const mapa = new Map();

    registros.value.forEach((registro) => {
      if (registro.profissional && !mapa.has(registro.profissional)) {
        mapa.set(registro.profissional, {
          id: registro.profissional,
          nome: registro.profissional_nome || "Profissional",
          funcao: "",
        });
      }
    });

    return [...mapa.values()];
  });

  const servicosBD = computed(() =>
    servicos.value
      .filter((servico) => servico.ativo)
      .map((servico) => ({
        id: servico.id,
        nome: servico.nome,
        preco: Number(servico.preco),
        duracao: Number(servico.duracao_padrao_minutos),
        categoria: servico.categoria || "",
      }))
  );

  const avisosAcesso = computed(() => {
    const avisos = [];

    if (acessoNegado.value.clientes) {
      avisos.push("A lista de clientes não está disponível para o seu perfil.");
    }

    if (acessoNegado.value.servicos) {
      avisos.push(
        "A lista de procedimentos não está disponível para o seu perfil."
      );
    }

    if (acessoNegado.value.colaboradores) {
      avisos.push(
        "A lista de profissionais não está disponível para o seu perfil."
      );
    }

    return avisos;
  });

  const formularioDisponivel = computed(
    () =>
      !acessoNegado.value.clientes &&
      !acessoNegado.value.servicos &&
      !acessoNegado.value.colaboradores
  );

  const carregarCadastros = async () => {
    const [resClientes, resColaboradores, resServicos] =
      await Promise.allSettled([
        listarClientes(),
        listarColaboradores(),
        listarServicos(),
      ]);

    const tratar = (resultado, chave, destino) => {
      if (resultado.status === "fulfilled") {
        destino.value = resultado.value;
        acessoNegado.value[chave] = false;
        return;
      }

      destino.value = [];
      acessoNegado.value[chave] =
        resultado.reason?.response?.status === 403;
    };

    tratar(resClientes, "clientes", clientes);
    tratar(resColaboradores, "colaboradores", colaboradores);
    tratar(resServicos, "servicos", servicos);
  };

  const carregarAgendamentos = async (params = {}) => {
    const requisicao = ++contadorRequisicao;

    carregando.value = true;
    erroCarregamento.value = "";

    try {
      const dados = await listarAgendamentos(params);

      if (requisicao !== contadorRequisicao) return;

      registros.value = dados;
    } catch (erro) {
      if (requisicao !== contadorRequisicao) return;

      erroCarregamento.value = interpretarErro(
        erro,
        "Não foi possível carregar os agendamentos."
      ).mensagem;
    } finally {
      if (requisicao === contadorRequisicao) carregando.value = false;
    }
  };

  const montarPayload = (form) => ({
    cliente: form.cliente_id,
    profissional: form.profissional_id,
    servico: form.servico_id,
    pacote_origem: form.pacote_id ? form.pacote_id : null,
    data_hora_inicio: camposParaIso(form.dataInicio, form.horaInicio),
    data_hora_fim: camposParaIso(form.dataInicio, form.horaFim),
    observacoes: form.observacoes || "",
  });

  const salvarAgendamento = async (form, id = null) => {
    salvando.value = true;

    try {
      if (id) {
        await atualizarAgendamento(id, montarPayload(form));
      } else {
        await criarAgendamento(montarPayload(form));
      }

      return { ok: true };
    } catch (erro) {
      return {
        ok: false,
        erro: interpretarErro(
          erro,
          "Não foi possível salvar o agendamento. Confira os dados e tente novamente."
        ),
      };
    } finally {
      salvando.value = false;
    }
  };

  const reagendarAgendamento = async (id, dataInicio, horaInicio, horaFim) => {
    try {
      await atualizarAgendamento(id, {
        data_hora_inicio: camposParaIso(dataInicio, horaInicio),
        data_hora_fim: camposParaIso(dataInicio, horaFim),
      });

      return { ok: true };
    } catch (erro) {
      return {
        ok: false,
        erro: interpretarErro(
          erro,
          "Não foi possível alterar o horário do agendamento."
        ),
      };
    }
  };

  const cancelar = async (id, motivo) => {
    processandoAcao.value = true;

    try {
      await cancelarAgendamento(id, motivo);
      return { ok: true };
    } catch (erro) {
      return {
        ok: false,
        erro: interpretarErro(
          erro,
          "Não foi possível cancelar o agendamento."
        ),
      };
    } finally {
      processandoAcao.value = false;
    }
  };

  const registrarFalta = async (id, payload) => {
    processandoAcao.value = true;

    try {
      await registrarFaltaAgendamento(id, payload);
      return { ok: true };
    } catch (erro) {
      return {
        ok: false,
        erro: interpretarErro(erro, "Não foi possível registrar a falta."),
      };
    } finally {
      processandoAcao.value = false;
    }
  };

  return {
    agora,
    agendamentos,
    carregando,
    erroCarregamento,
    salvando,
    processandoAcao,
    clientesBD,
    profissionaisBD,
    servicosBD,
    avisosAcesso,
    formularioDisponivel,
    perfil,
    podeGerenciar,
    podeEditarAgenda,
    carregarCadastros,
    carregarAgendamentos,
    salvarAgendamento,
    reagendarAgendamento,
    cancelar,
    registrarFalta,
  };
}