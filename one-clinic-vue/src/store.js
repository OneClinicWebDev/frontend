import { reactive, watch } from 'vue'

const colaboradoresIniciais = [
  { id: 1, iniciais: "CM", nome: "Carlos Mendes", cpf: "123.456.789-01", status: "ativo", cargo: "Médico Ortopedista", departamento: "Corpo Clínico", email: "carlos.mendes@email.com", telefone: "(11) 98765-4321", admissao: "15/01/2026", criadoEm: "10/01/2026 14:22 GMT-3" },
  { id: 2, iniciais: "MC", nome: "Mariana Costa", cpf: "987.654.321-00", status: "ferias", cargo: "Recepcionista", departamento: "Atendimento", email: "mariana.costa@email.com", telefone: "(11) 97654-3210", admissao: "03/03/2026", criadoEm: "01/03/2026 09:15 GMT-3" }
]

const clientesIniciais = [
  { id: 1, profissionalId: 1, iniciais: 'AS', nome: 'Ana Silva', cpf: '123.456.789-01', status: 'ativo', email: 'ana.silva@email.com', telefone: '(11) 98765-4321', endereco: 'Av. Paulista, 1000 - São Paulo SP', criadoEm: '30/05/2026 14:22 GMT-3', ultimaVisita: '02/05/2026', totalVisitas: 15 }
]

export const store = reactive({
  colaboradores: JSON.parse(localStorage.getItem('colaboradores')) || colaboradoresIniciais,
  clientes: JSON.parse(localStorage.getItem('clientes')) || clientesIniciais
})

watch(() => store.colaboradores, (novoValor) => {
  localStorage.setItem('colaboradores', JSON.stringify(novoValor))
}, { deep: true })

watch(() => store.clientes, (novoValor) => {
  localStorage.setItem('clientes', JSON.stringify(novoValor))
}, { deep: true })