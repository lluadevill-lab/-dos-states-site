// Prazo padrão usado quando o produto não tem um prazo específico configurado.
// Configurável por variável de ambiente, sem precisar mexer no código.
// NEXT_PUBLIC_DEFAULT_DELIVERY_MIN_DAYS=15
// NEXT_PUBLIC_DEFAULT_DELIVERY_MAX_DAYS=25
export function getDeliveryEstimate(product) {
  const min = product?.delivery_min_days ?? Number(process.env.NEXT_PUBLIC_DEFAULT_DELIVERY_MIN_DAYS || 15)
  const max = product?.delivery_max_days ?? Number(process.env.NEXT_PUBLIC_DEFAULT_DELIVERY_MAX_DAYS || 25)
  if (!min && !max) return null
  return { min, max }
}
