import { NextResponse } from 'next/server'
import { createOrder } from '../../../../lib/orders'
import { orderDisplayCode } from '../../../../lib/format'
import { whatsappLink } from '../../../../lib/whatsapp'

export async function POST(request) {
  try {
    const body = await request.json()
    const { customer, items } = body

    if (!customer?.nome || !customer?.email || !items?.length) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }

    if (!process.env.PIX_KEY) {
      return NextResponse.json(
        { error: 'Pagamento via Pix manual não está configurado neste site ainda.' },
        { status: 500 }
      )
    }

    const { order, total } = await createOrder({
      customer,
      items,
      paymentMethod: 'pix_manual',
      status: 'aguardando_pix',
    })

    const displayCode = orderDisplayCode(order.id)
    const message = `Olá! Fiz o pedido ${displayCode} no site da Dos States e vou enviar o comprovante do Pix agora.`

    return NextResponse.json({
      order_id: order.id,
      display_code: displayCode,
      pix_key: process.env.PIX_KEY,
      amount: total,
      whatsapp_url: whatsappLink(message),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Erro ao processar pedido.' }, { status: 500 })
  }
}
