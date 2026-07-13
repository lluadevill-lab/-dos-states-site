import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

// GET /api/questions?product_id=... -> perguntas já respondidas (visível a todo mundo)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('product_id')
  if (!productId) return NextResponse.json({ error: 'product_id é obrigatório.' }, { status: 400 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('product_questions')
    .select('id, question, answer, answered_at, created_at')
    .eq('product_id', productId)
    .not('answer', 'is', null)
    .order('answered_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ questions: data })
}

// POST /api/questions -> cliente logado pergunta algo sobre um produto
export async function POST(request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !userData?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const body = await request.json()
  const { product_id, question } = body
  if (!product_id || !question?.trim()) {
    return NextResponse.json({ error: 'Escreva sua pergunta.' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('product_questions').insert({
    product_id,
    user_id: userData.user.id,
    author_name: userData.user.user_metadata?.nome || null,
    question: question.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
