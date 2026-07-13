import { getSupabaseAdmin } from './supabaseAdmin'

// Valida um cupom no servidor (nunca confia no desconto calculado no navegador).
// Retorna { valid, discountAmount, coupon, error }.
export async function validateCoupon(code, subtotal) {
  if (!code) return { valid: false, discountAmount: 0, error: 'Informe um cupom.' }

  const supabaseAdmin = getSupabaseAdmin()
  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .ilike('code', code.trim())
    .maybeSingle()

  if (error || !coupon) return { valid: false, discountAmount: 0, error: 'Cupom não encontrado.' }
  if (!coupon.active) return { valid: false, discountAmount: 0, error: 'Este cupom não está mais ativo.' }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, discountAmount: 0, error: 'Este cupom expirou.' }
  }
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return { valid: false, discountAmount: 0, error: 'Este cupom já atingiu o limite de uso.' }
  }

  const discountAmount = coupon.discount_type === 'percent'
    ? subtotal * (coupon.discount_value / 100)
    : Math.min(coupon.discount_value, subtotal)

  return { valid: true, discountAmount, coupon }
}

export async function incrementCouponUsage(couponId) {
  const supabaseAdmin = getSupabaseAdmin()
  await supabaseAdmin.rpc('increment_coupon_usage', { p_coupon_id: couponId })
}
