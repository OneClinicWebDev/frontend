const opcoes = {
timeZone: 'America/Sao_Paulo',
day: '2-digit',
month: '2-digit',
year: 'numeric',
hour: '2-digit',
minute: '2-digit',
hour12: false,
}
export const formatarDataHora = (valor) => {
if (!valor) return '—'
const data = new Date(valor)
if (Number.isNaN(data.getTime())) return '—'
return data.toLocaleString('pt-BR', opcoes).replace(',', '')
}
export const formatarData = (valor) => {
if (!valor) return '—'
const data = new Date(valor)
if (Number.isNaN(data.getTime())) return '—'
return data.toLocaleDateString('pt-BR', {
timeZone: 'America/Sao_Paulo',
day: '2-digit',
month: '2-digit',
year: 'numeric',
})
}
