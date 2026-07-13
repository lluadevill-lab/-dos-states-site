import { NextResponse } from 'next/server'
import { getAdminUser } from '../../../../lib/adminAuth'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'

const PAID_STATUSES = ['pago', 'enviado', 'entregue']

export async function GET(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const supabaseAdmin = getSupabaseAdmin()

  const { data: referredProfiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, referral_code, referred_by_code')
    .not('referred_by_code', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!referredProfiles?.length) return NextResponse.json({ referrals: [] })

  const { data: allProfiles } = await supabaseAdmin.from('profiles').select('id, referral_code')
  const referrerByCode = Object.fromEntries((allProfiles || []).map((p) => [p.referral_code, p.id]))

  const referredIds = referredProfiles.map((p) => p.id)
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('user_id, status')
    .in('user_id', referredIds)

  const hasPaidOrder = {}
  for (const o of orders || []) {
    if (PAID_STATUSES.includes(o.status)) hasPaidOrder[o.user_id] = true
  }

  const results = []
  for (const p of referredProfiles) {
    const referrerId = referrerByCode[p.referred_by_code]
    const [referredUser, referrerUser] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(p.id),
      referrerId ? supabaseAdmin.auth.admin.getUserById(referrerId) : Promise.resolve(null),
    ])
    results.push({
      referred_email: referredUser?.data?.user?.email || null,
      referrer_email: referrerUser?.data?.user?.email || null,
      referred_by_code: p.referred_by_code,
      has_paid_order: !!hasPaidOrder[p.id],
    })
  }

  return NextResponse.json({ referrals: results })
}
