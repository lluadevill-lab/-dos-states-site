import { getSupabaseAdmin } from './supabaseAdmin'

// Centraliza a troca de status de pedido, porque isso acontece em mais de um
// lugar (webhook do Mercado Pago e tela do admin) e a baixa de estoque só
// pode rodar UMA vez por pedido, senão descontaria o estoque em dobro.
export async function updateOrderStatus(orderId, newStatus, extraFields = {}) {
  const supabaseAdmin = getSupabaseAdmin()

  const { data: currentOrder, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, status, order_items(product_id, quantity)')
    .eq('id', orderId)
    .single()

  if (fetchError || !currentOrder) throw new Error('Pedido não encontrado.')

  const wasAlreadyPaid = currentOrder.status === 'pago' ||
    ['enviado', 'entregue'].includes(currentOrder.status)
  const isBecomingPaid = newStatus === 'pago' && !wasAlreadyPaid

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: newStatus, ...extraFields })
    .eq('id', orderId)

  if (updateError) throw new Error(updateError.message)

  if (isBecomingPaid) {
    for (const item of currentOrder.order_items || []) {
      if (!item.product_id) continue
      const { error: stockError } = await supabaseAdmin.rpc('decrement_stock', {
        p_product_id: item.product_id,
        p_qty: item.quantity,
      })
      // Não derruba a atualização do pedido por causa disso — só avisa no log.
      // O estoque pode ser corrigido manualmente na tela de produtos se falhar.
      if (stockError) console.error('Erro ao baixar estoque:', stockError.message)
    }
  }

  return currentOrder
}
