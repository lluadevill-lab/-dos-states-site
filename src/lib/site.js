// Determina a URL pública do site para montar back_urls e webhooks.
// Em produção, defina NEXT_PUBLIC_SITE_URL (ex: https://dosstates.com.br) no Vercel.
// Sem essa variável, usamos o host da própria requisição como fallback.
export function getSiteUrl(request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const host = request.headers.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}
