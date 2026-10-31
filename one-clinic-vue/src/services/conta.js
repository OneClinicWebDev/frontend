import api from "@/services/api";

export const obterPerfil = async () => {
  const resposta = await api.get("/api/auth/perfil/");
  return resposta.data;
};

export const atualizarPerfil = async (payload) => {
  const resposta = await api.patch("/api/auth/perfil/", payload);
  return resposta.data;
};

export const alterarSenha = async (payload) => {
  const resposta = await api.post("/api/auth/alterar-senha/", payload);
  return resposta.data;
};

export const obterClinicaAtual = async () => {
  const resposta = await api.get("/api/clinica/atual/");
  return resposta.data;
};

export const atualizarClinicaAtual = async (payload) => {
  const resposta = await api.patch("/api/clinica/atual/", payload);
  return resposta.data;
};

export const atualizarAutonomiaAgenda = async (valor) => {
  const resposta = await api.patch("/api/clinica/autonomia_agenda/", {
    profissionais_podem_editar_agenda: Boolean(valor),
  });
  return resposta.data;
};