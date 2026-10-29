import api from "@/services/api";

export const listarAgendamentos = async (params = {}) => {
  const resposta = await api.get("/api/agendamentos/", { params });
  return Array.isArray(resposta.data) ? resposta.data : [];
};

export const criarAgendamento = async (payload) => {
  const resposta = await api.post("/api/agendamentos/", payload);
  return resposta.data;
};

export const atualizarAgendamento = async (id, payload) => {
  const resposta = await api.patch(`/api/agendamentos/${id}/`, payload);
  return resposta.data;
};

export const cancelarAgendamento = async (id, motivo) => {
  const resposta = await api.post(`/api/agendamentos/${id}/cancelar/`, {
    motivo,
  });
  return resposta.data;
};

export const registrarFaltaAgendamento = async (id, payload = {}) => {
  const resposta = await api.post(
    `/api/agendamentos/${id}/registrar_falta/`,
    payload
  );
  return resposta.data;
};

export const listarClientes = async () => {
  const resposta = await api.get("/api/clientes/");
  return Array.isArray(resposta.data) ? resposta.data : [];
};

export const listarColaboradores = async () => {
  const resposta = await api.get("/api/colaboradores/");
  return Array.isArray(resposta.data) ? resposta.data : [];
};

export const listarServicos = async () => {
  const resposta = await api.get("/api/servicos/");
  return Array.isArray(resposta.data) ? resposta.data : [];
};

export const listarPacotes = async (params = {}) => {
  const resposta = await api.get("/api/pacotes/", { params });
  return Array.isArray(resposta.data) ? resposta.data : [];
};