import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

export async function POST(request) {
  const body = await request.json()
  const { product_id, contact } = body
  if (!product_id || !contact?.trim()) {
    return NextResponse.json({ error: 'Informe seu e-mail ou WhatsApp.' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin.from('stock_alerts').insert({ product_id, contact: contact.trim() })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
