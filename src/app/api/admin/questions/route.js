import { NextResponse } from 'next/server'
import { getAdminUser } from '../../../../lib/adminAuth'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function GET(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data: questions, error } = await supabaseAdmin
    .from('product_questions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const productIds = [...new Set((questions || []).map((q) => q.product_id))]
  const { data: products } = productIds.length
    ? await supabaseAdmin.from('products').select('id, name, slug').in('id', productIds)
    : { data: [] }
  const productById = Object.fromEntries((products || []).map((p) => [p.id, p]))

  const merged = (questions || []).map((q) => ({ ...q, products: productById[q.product_id] || null }))
  return NextResponse.json({ questions: merged })
}

export async function PUT(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const body = await request.json()
  if (!body.id || !body.answer?.trim()) {
    return NextResponse.json({ error: 'Escreva uma resposta.' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin
    .from('product_questions')
    .update({ answer: body.answer.trim(), answered_at: new Date().toISOString() })
    .eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
