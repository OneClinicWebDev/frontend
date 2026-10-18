import { reactive, watch } from 'vue'

const colaboradoresIniciais = [
  {
    id: "a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab",
    iniciais: "CM",
    nome: "Carlos Mendes",
    cpf: "123.456.789-01",
    email: "carlos.mendes@email.com",
    telefone: "(11) 98765-4321",
    role: "PROFISSIONAL",
    pode_editar_agenda: false,
    ativo: true,
    criadoEm: "10/01/2026 14:22 GMT-3"
  },
  {
    id: "b2c3d4e5-f6a7-4b5c-8d9e-123456789abc",
    iniciais: "MC",
    nome: "Mariana Costa",
    cpf: "987.654.321-00",
    email: "mariana.costa@email.com",
    telefone: "(11) 97654-3210",
    role: "SECRETARIO",
    pode_editar_agenda: true,
    ativo: true,
    criadoEm: "01/03/2026 09:15 GMT-3"
  }
]

const clientesIniciais = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    iniciais: "AS",
    nome: "Ana Silva",
    cpf: "123.456.789-01",
    email: "ana.silva@email.com",
    telefone: "(11) 98765-4321",
    cep: "01310-100",
    numero: "1000",
    status_cadastro: "ATIVO",
    criadoEm: "30/05/2026 14:22 GMT-3",
    ultimaVisita: "02/05/2026",
    totalVisitas: 15
  }
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