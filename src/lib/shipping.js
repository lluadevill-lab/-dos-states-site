// Configuração de frete simples: uma taxa fixa (opcional) e um valor mínimo
// de compra a partir do qual o frete fica grátis. Ambos configuráveis por
// variável de ambiente, sem precisar mexer no código.
// NEXT_PUBLIC_SHIPPING_FEE=25.00
// NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=300.00
export function getShippingFee(subtotal) {
  const fee = Number(process.env.NEXT_PUBLIC_SHIPPING_FEE || 0)
  const threshold = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 0)
  if (fee <= 0) return 0
  if (threshold > 0 && subtotal >= threshold) return 0
  return fee
}

export function getFreeShippingThreshold() {
  return Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 0)
}
