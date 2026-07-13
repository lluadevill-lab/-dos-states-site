import { getSupabaseAdmin } from './supabaseAdmin'
import { getShippingFee } from './shipping'
import { validateCoupon, incrementCouponUsage } from './coupons'

// Só deve ser importado dentro de rotas de API (roda no servidor).
// Recalcula o total a partir dos preços reais no banco — nunca confia no valor
// que veio do navegador (nem produto, nem kit, nem cupom).
export async function createOrder({ customer, items, paymentMethod, status, couponCode }) {
  if (!items?.length) throw new Error('Carrinho vazio.')

  const supabaseAdmin = getSupabaseAdmin()

  const productCartItems = items.filter((i) => i.type !== 'bundle')
  const bundleCartItems = items.filter((i) => i.type === 'bundle')
  const orderItems = []

  if (productCartItems.length) {
    const ids = productCartItems.map((i) => i.id)
    const { data: dbProducts, error } = await supabaseAdmin.from('products').select('id, name, price').in('id', ids)
    if (error) throw new Error('Não foi possível validar os produtos do pedido.')
    const priceById = Object.fromEntries((dbProducts || []).map((p) => [p.id, Number(p.price)]))
    for (const i of productCartItems) {
      orderItems.push({
        product_id: i.id,
        bundle_id: null,
        product_name: i.name,
        quantity: i.qty,
        unit_price: priceById[i.id] ?? Number(i.price),
      })
    }
  }

  if (bundleCartItems.length) {
    const ids = bundleCartItems.map((i) => i.id)
    const { data: dbBundles, error } = await supabaseAdmin.from('bundles').select('id, name, price').in('id', ids)
    if (error) throw new Error('Não foi possível validar os kits do pedido.')
    const priceById = Object.fromEntries((dbBundles || []).map((b) => [b.id, Number(b.price)]))
    for (const i of bundleCartItems) {
      orderItems.push({
        product_id: null,
        bundle_id: i.id,
        product_name: i.name,
        quantity: i.qty,
        unit_price: priceById[i.id] ?? Number(i.price),
      })
    }
  }

  const subtotal = orderItems.reduce((acc, i) => acc + i.unit_price * i.quantity, 0)

  let discountAmount = 0
  let appliedCoupon = null
  if (couponCode) {
    const result = await validateCoupon(couponCode, subtotal)
    if (result.valid) {
      discountAmount = result.discountAmount
      appliedCoupon = result.coupon
    }
    // Se o cupom não for mais válido (expirou/esgotou entre a checagem e o
    // envio, por exemplo), seguimos sem o desconto em vez de travar a compra.
  }

  // O frete também é calculado no servidor (não confia em valor vindo do navegador).
  const shippingFee = getShippingFee(subtotal)
  const total = Math.max(subtotal - discountAmount, 0) + shippingFee

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: customer.user_id || null,
      customer_name: customer.nome,
      customer_email: customer.email,
      customer_phone: customer.telefone,
      customer_address: customer.endereco || null,
      observacoes: customer.observacoes || null,
      payment_method: paymentMethod,
      status,
      total,
      shipping_fee: shippingFee,
      coupon_code: appliedCoupon?.code || null,
      discount_amount: discountAmount,
    })
    .select()
    .single()

  if (orderError) throw new Error('Não foi possível criar o pedido: ' + orderError.message)

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems.map((i) => ({ ...i, order_id: order.id })))

  if (itemsError) throw new Error('Não foi possível salvar os itens do pedido: ' + itemsError.message)

  if (appliedCoupon) await incrementCouponUsage(appliedCoupon.id)

  return { order, orderItems, total, subtotal, shippingFee, discountAmount }
}
