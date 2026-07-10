export function formatBRL(value) {
  const n = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value)
  if (Number.isNaN(n)) return 'R$ 0,00'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Gera um código curto e legível para exibir ao cliente (ex: DS-7F3K9A2).
// O identificador real do pedido continua sendo o UUID da tabela orders.
export function orderDisplayCode(orderId) {
  if (!orderId) return ''
  return `DS-${orderId.replace(/-/g, '').slice(0, 8).toUpperCase()}`
}
