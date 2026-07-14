import { NextResponse } from 'next/server'
import { getAdminUser } from '../../../../lib/adminAuth'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function GET(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data: alerts, error } = await supabaseAdmin
    .from('stock_alerts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const productIds = [...new Set((alerts || []).map((a) => a.product_id))]
  const { data: products } = productIds.length
    ? await supabaseAdmin.from('products').select('id, name, stock').in('id', productIds)
    : { data: [] }
  const productById = Object.fromEntries((products || []).map((p) => [p.id, p]))

  const merged = (alerts || []).map((a) => ({ ...a, products: productById[a.product_id] || null }))
  return NextResponse.json({ alerts: merged })
}

export async function PUT(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })

  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin.from('stock_alerts').update({ notified: body.notified }).eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
