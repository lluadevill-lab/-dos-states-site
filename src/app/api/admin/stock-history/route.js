import { NextResponse } from 'next/server'
import { getAdminUser } from '../../../../lib/adminAuth'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function GET(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data: history, error } = await supabaseAdmin
    .from('stock_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const productIds = [...new Set((history || []).map((h) => h.product_id))]
  const { data: products } = productIds.length
    ? await supabaseAdmin.from('products').select('id, name').in('id', productIds)
    : { data: [] }
  const productById = Object.fromEntries((products || []).map((p) => [p.id, p]))

  const merged = (history || []).map((h) => ({ ...h, products: productById[h.product_id] || null }))
  return NextResponse.json({ history: merged })
}
