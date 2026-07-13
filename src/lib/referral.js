// Código de indicação simples e determinístico, derivado do próprio ID do
// usuário — não precisa gerar nem armazenar um valor aleatório separado.
export function genReferralCode(userId) {
  return userId.replace(/-/g, '').slice(0, 8).toUpperCase()
}
