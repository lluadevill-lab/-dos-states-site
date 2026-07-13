import { NextResponse } from 'next/server'
import { getAdminUser } from '../../../../lib/adminAuth'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function GET(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ coupons: data })
}

export async function POST(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const body = await request.json()
  if (!body.code || !body.discount_type || !body.discount_value) {
    return NextResponse.json({ error: 'Preencha código, tipo e valor do desconto.' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin.from('coupons').insert({
    code: body.code.trim().toUpperCase(),
    discount_type: body.discount_type,
    discount_value: Number(body.discount_value),
    max_uses: body.max_uses ? Number(body.max_uses) : null,
    expires_at: body.expires_at || null,
    active: true,
  })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Já existe um cupom com esse código.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ success: true })
}

export async function PUT(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })

  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin.from('coupons').update({ active: body.active }).eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
