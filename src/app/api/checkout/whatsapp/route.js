import { NextResponse } from 'next/server'
import { createOrder } from '../../../../lib/orders'
import { orderDisplayCode, formatBRL } from '../../../../lib/format'
import { whatsappLink } from '../../../../lib/whatsapp'

export async function POST(request) {
  try {
    const body = await request.json()
    const { customer, items, coupon_code } = body

    if (!customer?.nome || !customer?.email || !items?.length) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }

    const { order, orderItems, total } = await createOrder({
      customer,
      items,
      paymentMethod: 'whatsapp',
      status: 'via_whatsapp',
      couponCode: coupon_code,
    })

    const displayCode = orderDisplayCode(order.id)
    const itemsList = orderItems.map((i) => `- ${i.quantity}x ${i.product_name}`).join('\n')
    const message =
      `Olá! Quero fechar o pedido ${displayCode} no site da Dos States:\n${itemsList}\n` +
      `Total: ${formatBRL(total)}\nNome: ${customer.nome}`

    return NextResponse.json({
      order_id: order.id,
      display_code: displayCode,
      whatsapp_url: whatsappLink(message),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Erro ao processar pedido.' }, { status: 500 })
  }
}
