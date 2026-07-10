import { NextResponse } from 'next/server'
import { getAdminUser } from '../../../../lib/adminAuth'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'
import { updateOrderStatus } from '../../../../lib/orderStatus'

export async function GET(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ orders: data })
}

export async function PUT(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const body = await request.json()
  if (!body.id || !body.status) {
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
  }

  const extraFields = {}
  // A mensagem de envio (rastreio, transportadora, prazo etc.) é opcional e
  // só faz sentido guardar quando o admin manda algo — não sobrescreve com
  // vazio se o campo não vier na requisição.
  if (typeof body.shipping_message === 'string') {
    extraFields.shipping_message = body.shipping_message
  }

  try {
    // updateOrderStatus também dá baixa no estoque automaticamente quando o
    // pedido está virando "pago" pela primeira vez.
    await updateOrderStatus(body.id, body.status, extraFields)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
