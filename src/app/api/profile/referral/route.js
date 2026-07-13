import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'
import { genReferralCode } from '../../../../lib/referral'

// POST /api/profile/referral -> garante que o usuário logado tem um código de
// indicação, e (se vier um ref_code de quem indicou) registra isso — só na
// primeira vez, nunca sobrescreve depois.
// Roda com a service role de propósito: não existe uma policy de UPDATE
// aberta em "profiles" para o próprio usuário (isso evitaria que alguém se
// promovesse a admin editando o próprio registro pelo navegador), então essa
// rota é o único jeito seguro de gravar essas duas colunas.
export async function POST(request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !userData?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const user = userData.user
  const body = await request.json().catch(() => ({}))
  const ownCode = genReferralCode(user.id)

  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id, referral_code, referred_by_code')
    .eq('id', user.id)
    .maybeSingle()

  const updates = { id: user.id }
  if (!existing?.referral_code) updates.referral_code = ownCode
  if (!existing?.referred_by_code && body.ref_code && body.ref_code.toUpperCase() !== ownCode) {
    updates.referred_by_code = body.ref_code.toUpperCase()
  }

  if (Object.keys(updates).length > 1 || !existing) {
    const { error } = await supabaseAdmin.from('profiles').upsert(updates)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ referral_code: existing?.referral_code || ownCode })
}
