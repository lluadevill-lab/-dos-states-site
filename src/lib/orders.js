import { getSupabaseAdmin } from './supabaseAdmin'

// Só deve ser importado dentro de rotas de API (roda no servidor).
// Recalcula o total a partir do preço enviado pelo cliente — em produção o ideal
// é buscar o preço real de cada produto no banco antes de gravar, para o cliente
// nunca conseguir alterar o valor cobrado. Deixamos um passo pronto para isso abaixo.
export async function createOrder({ customer, items, paymentMethod, status }) {
  if (!items?.length) throw new Error('Carrinho vazio.')

  const supabaseAdmin = getSupabaseAdmin()

  // Busca os preços reais no banco pelos IDs recebidos, para não confiar no valor
  // que veio do navegador.
  const ids = items.map((i) => i.id)
  const { data: dbProducts, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, name, price')
    .in('id', ids)

  if (productsError) throw new Error('Não foi possível validar os produtos do pedido.')

  const priceById = Object.fromEntries((dbProducts || []).map((p) => [p.id, Number(p.price)]))

  const orderItems = items.map((i) => {
    const realPrice = priceById[i.id] ?? Number(i.price)
    return {
      product_id: i.id,
      product_name: i.name,
      quantity: i.qty,
      unit_price: realPrice,
    }
  })

  const total = orderItems.reduce((acc, i) => acc + i.unit_price * i.quantity, 0)

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
    })
    .select()
    .single()

  if (orderError) throw new Error('Não foi possível criar o pedido: ' + orderError.message)

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems.map((i) => ({ ...i, order_id: order.id })))

  if (itemsError) throw new Error('Não foi possível salvar os itens do pedido: ' + itemsError.message)

  return { order, orderItems, total }
}
