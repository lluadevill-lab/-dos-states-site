import { NextResponse } from 'next/server'
import { getAdminUser } from '../../../../lib/adminAuth'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function POST(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const body = await request.json()
  const { id, ...fields } = body // ignora qualquer id enviado na criação

  if (!fields.name || !fields.slug || fields.price === undefined) {
    return NextResponse.json({ error: 'Nome, slug e preço são obrigatórios.' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin.from('products').insert(fields).select().single()

  if (error) {
    const msg = error.code === '23505' ? 'Já existe um produto com esse slug.' : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }
  return NextResponse.json({ product: data })
}

export async function PUT(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const body = await request.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'ID do produto ausente.' }, { status: 400 })

  const supabaseAdmin = getSupabaseAdmin()

  // Se o estoque está sendo alterado, guarda o valor anterior pra registrar a
  // diferença no histórico depois que a atualização for confirmada.
  let previousStock = null
  if (fields.stock !== undefined) {
    const { data: existing } = await supabaseAdmin.from('products').select('stock').eq('id', id).single()
    previousStock = existing?.stock ?? null
  }

  const { data, error } = await supabaseAdmin.from('products').update(fields).eq('id', id).select().single()

  if (error) {
    const msg = error.code === '23505' ? 'Já existe um produto com esse slug.' : error.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  if (previousStock !== null && Number(fields.stock) !== Number(previousStock)) {
    const change = Number(fields.stock) - Number(previousStock)
    await supabaseAdmin.from('stock_history').insert({ product_id: id, change, reason: 'ajuste_manual' })
  }

  return NextResponse.json({ product: data })
}

export async function DELETE(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'ID do produto ausente.' }, { status: 400 })

  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin.from('products').delete().eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
