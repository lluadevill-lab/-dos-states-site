import { NextResponse } from 'next/server'
import { validateCoupon } from '../../../../lib/coupons'

export async function POST(request) {
  const body = await request.json()
  const { code, subtotal } = body
  const result = await validateCoupon(code, Number(subtotal) || 0)
  if (!result.valid) return NextResponse.json({ valid: false, error: result.error }, { status: 400 })
  return NextResponse.json({ valid: true, discountAmount: result.discountAmount })
}
