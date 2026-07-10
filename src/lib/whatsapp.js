// Monta um link wa.me a partir do número configurado em NEXT_PUBLIC_WHATSAPP_NUMBER.
// O número deve estar em formato internacional, só dígitos, ex: 5521999999999
export function whatsappLink(message = '') {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
