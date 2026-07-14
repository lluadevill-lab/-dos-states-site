import { NextResponse } from 'next/server'
import { getAdminUser } from '../../../../lib/adminAuth'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function GET(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data: bundles, error } = await supabaseAdmin
    .from('bundles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const bundleIds = (bundles || []).map((b) => b.id)
  let itemsByBundle = {}
  if (bundleIds.length) {
    const { data: items } = await supabaseAdmin
      .from('bundle_items')
      .select('id, bundle_id, quantity, product_id')
      .in('bundle_id', bundleIds)

    const productIds = [...new Set((items || []).map((i) => i.product_id))]
    const { data: products } = productIds.length
      ? await supabaseAdmin.from('products').select('id, name, price, image_url').in('id', productIds)
      : { data: [] }
    const productById = Object.fromEntries((products || []).map((p) => [p.id, p]))

    for (const it of items || []) {
      if (!itemsByBundle[it.bundle_id]) itemsByBundle[it.bundle_id] = []
      itemsByBundle[it.bundle_id].push({ id: it.id, quantity: it.quantity, product_id: it.product_id, products: productById[it.product_id] })
    }
  }

  const merged = (bundles || []).map((b) => ({ ...b, bundle_items: itemsByBundle[b.id] || [] }))
  return NextResponse.json({ bundles: merged })
}

export async function POST(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const body = await request.json()
  if (!body.name || !body.price || !body.items?.length) {
    return NextResponse.json({ error: 'Preencha nome, preço e selecione ao menos um produto.' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()
  const slug = body.name.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const { data: bundle, error: bundleError } = await supabaseAdmin
    .from('bundles')
    .insert({
      name: body.name,
      slug,
      description: body.description || null,
      price: Number(body.price),
      image_url: body.image_url || null,
      active: true,
    })
    .select()
    .single()

  if (bundleError) {
    if (bundleError.code === '23505') return NextResponse.json({ error: 'Já existe um kit com esse nome.' }, { status: 409 })
    return NextResponse.json({ error: bundleError.message }, { status: 400 })
  }

  const { error: itemsError } = await supabaseAdmin.from('bundle_items').insert(
    body.items.map((i) => ({ bundle_id: bundle.id, product_id: i.product_id, quantity: Number(i.quantity) || 1 }))
  )

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 400 })
  return NextResponse.json({ success: true, bundle })
}

export async function PUT(request) {
  const admin = await getAdminUser(request)
  if (!admin) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })

  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin.from('bundles').update({ active: body.active }).eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
