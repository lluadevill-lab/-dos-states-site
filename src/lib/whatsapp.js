// Monta um link wa.me a partir do número configurado em NEXT_PUBLIC_WHATSAPP_NUMBER.
// O número deve estar em formato internacional, só dígitos, ex: 5521999999999
export function whatsappLink(message = '') {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

// Monta um link wa.me para o WHATSAPP DO CLIENTE (não o da loja), a partir do
// telefone salvo no pedido (ex: "(21) 99999-9999"). Usado pelo admin pra
// avisar o comprador com um clique, sem precisar de API do WhatsApp Business.
export function customerWhatsappLink(rawPhone, message = '') {
  const digits = (rawPhone || '').replace(/\D/g, '')
  if (!digits) return null
  // Se já vier com código do país (13 dígitos: 55 + DDD + 9 + número), usa direto.
  const withCountryCode = digits.length >= 12 ? digits : `55${digits}`
  const base = `https://wa.me/${withCountryCode}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
