import { NextResponse } from 'next/server'
import { createOrder } from '../../../../lib/orders'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'
import { getSiteUrl } from '../../../../lib/site'
import { orderDisplayCode } from '../../../../lib/format'

export async function POST(request) {
  try {
    const body = await request.json()
    const { customer, items } = body

    if (!customer?.nome || !customer?.email || !items?.length) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Pagamento via Mercado Pago não está configurado neste site ainda.' },
        { status: 500 }
      )
    }

    const { order, orderItems } = await createOrder({
      customer,
      items,
      paymentMethod: 'mercado_pago',
      status: 'pendente',
    })

    const siteUrl = getSiteUrl(request)

    const preferenceRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: orderItems.map((i) => ({
          title: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          currency_id: 'BRL',
        })),
        payer: { name: customer.nome, email: customer.email },
        external_reference: order.id,
        back_urls: {
          success: `${siteUrl}/checkout/sucesso`,
          pending: `${siteUrl}/checkout/sucesso`,
          failure: `${siteUrl}/checkout/sucesso`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      }),
    })

    const preference = await preferenceRes.json()

    if (!preferenceRes.ok) {
      console.error('Erro do Mercado Pago:', preference)
      return NextResponse.json({ error: 'Não foi possível iniciar o pagamento.' }, { status: 502 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    await supabaseAdmin.from('orders').update({ mp_preference_id: preference.id }).eq('id', order.id)

    return NextResponse.json({
      order_id: order.id,
      display_code: orderDisplayCode(order.id),
      init_point: preference.init_point,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Erro ao processar pedido.' }, { status: 500 })
  }
}
