import Button from 'primevue/button'

const features = [
  {
    icon: 'pi pi-calendar',
    title: 'Agenda Inteligente',
    description: 'Gerencie agendamentos com visualização por dia, semana ou mês. Confirmações automáticas via WhatsApp.'
  },
  {
    icon: 'pi pi-users',
    title: 'Gestão de Clientes',
    description: 'Cadastro completo com histórico de atendimentos, preferências e prontuário digital.'
  },
  {
    icon: 'pi pi-dollar',
    title: 'Controle Financeiro',
    description: 'Receitas, despesas, comissões e relatórios detalhados para tomada de decisões.'
  },
  {
    icon: 'pi pi-box',
    title: 'Gestão de Estoque',
    description: 'Controle de produtos, alertas de estoque baixo e histórico de movimentações.'
  },
  {
    icon: 'pi pi-id-card',
    title: 'Equipe e Colaboradores',
    description: 'Cadastro de Colaboradores, agendas individuais e controle de comissões.'
  },
  {
    icon: 'pi pi-chart-bar',
    title: 'Relatórios e Métricas',
    description: 'Dashboards completos com indicadores de performance e crescimento.'
  }
]

const benefits = [
  {
    title: 'Fácil de usar',
    description: 'Interface intuitiva que sua equipe aprende em minutos.'
  },
  {
    title: 'Suporte dedicado',
    description: 'Equipe pronta para ajudar sempre que precisar.'
  },
  {
    title: 'Atualizações constantes',
    description: 'Novos recursos e melhorias frequentes.'
  },
  {
    title: 'Dados seguros',
    description: 'Criptografia e backups automáticos.'
  }
]

export {
  Button,
  features,
  benefits
}