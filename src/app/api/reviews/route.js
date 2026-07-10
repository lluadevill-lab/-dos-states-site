import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

// GET /api/reviews?product_id=... -> lista pública de avaliações de um produto
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('product_id')
  if (!productId) return NextResponse.json({ error: 'product_id é obrigatório.' }, { status: 400 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('id, rating, comment, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ reviews: data })
}

// POST /api/reviews -> cliente logado avalia um item de um pedido já entregue
export async function POST(request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !userData?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const body = await request.json()
  const { order_item_id, rating, comment } = body
  const ratingNum = Number(rating)

  if (!order_item_id || !ratingNum || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: 'Dados incompletos ou nota inválida (1 a 5).' }, { status: 400 })
  }

  // Confere se o item pertence a um pedido do próprio usuário e já foi entregue,
  // antes de aceitar a avaliação.
  const { data: item, error: itemError } = await supabaseAdmin
    .from('order_items')
    .select('id, product_id, order_id, orders!inner(id, user_id, status)')
    .eq('id', order_item_id)
    .single()

  if (itemError || !item) return NextResponse.json({ error: 'Item de pedido não encontrado.' }, { status: 404 })
  if (item.orders.user_id !== userData.user.id) {
    return NextResponse.json({ error: 'Esse pedido não pertence a você.' }, { status: 403 })
  }
  if (item.orders.status !== 'entregue') {
    return NextResponse.json({ error: 'Só é possível avaliar produtos de pedidos já entregues.' }, { status: 400 })
  }

  const { error: insertError } = await supabaseAdmin.from('reviews').insert({
    order_item_id,
    order_id: item.order_id,
    product_id: item.product_id,
    user_id: userData.user.id,
    rating: ratingNum,
    comment: comment || null,
  })

  if (insertError) {
    // Violação de unique (order_item_id) => já avaliado antes.
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'Você já avaliou este produto.' }, { status: 409 })
    }
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
