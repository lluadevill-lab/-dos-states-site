import { NextResponse } from 'next/server'
import { updateOrderStatus } from '../../../../lib/orderStatus'

const STATUS_MAP = {
  approved: 'pago',
  rejected: 'cancelado',
  cancelled: 'cancelado',
  refunded: 'cancelado',
  charged_back: 'cancelado',
  pending: 'pendente',
  in_process: 'pendente',
}

async function handleNotification(request) {
  const { searchParams } = new URL(request.url)
  let paymentId = searchParams.get('data.id') || searchParams.get('id')
  let type = searchParams.get('type') || searchParams.get('topic')

  // O Mercado Pago também manda os dados no corpo da requisição (formato mais comum hoje).
  try {
    const body = await request.json()
    paymentId = body?.data?.id || paymentId
    type = body?.type || type
  } catch {
    // corpo vazio ou não-JSON — segue só com os query params
  }

  if (type !== 'payment' || !paymentId) {
    // Outros tipos de evento (merchant_order, etc.) — apenas confirmamos o recebimento.
    return NextResponse.json({ received: true })
  }

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.error('Webhook do Mercado Pago recebido, mas MERCADOPAGO_ACCESS_TOKEN não está configurado.')
    return NextResponse.json({ received: true })
  }

  const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  })

  if (!paymentRes.ok) {
    console.error('Não foi possível consultar o pagamento no Mercado Pago:', await paymentRes.text())
    return NextResponse.json({ received: true })
  }

  const payment = await paymentRes.json()
  const orderId = payment.external_reference
  const newStatus = STATUS_MAP[payment.status] || 'pendente'

  if (orderId) {
    try {
      await updateOrderStatus(orderId, newStatus, { mp_payment_id: String(paymentId) })
    } catch (err) {
      console.error('Erro ao atualizar pedido a partir do webhook:', err.message)
    }
  }

  return NextResponse.json({ received: true })
}

export async function POST(request) {
  try {
    return await handleNotification(request)
  } catch (err) {
    console.error('Erro no webhook do Mercado Pago:', err)
    // Sempre respondemos 200 para o Mercado Pago não ficar reenviando indefinidamente.
    return NextResponse.json({ received: true })
  }
}

export async function GET(request) {
  return handleNotification(request)
}
