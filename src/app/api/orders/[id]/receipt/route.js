import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { getSupabaseAdmin } from '../../../../../lib/supabaseAdmin'
import { formatBRL, orderDisplayCode } from '../../../../../lib/format'

export async function GET(request, { params }) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return new Response('Não autenticado.', { status: 401 })

  const supabaseAdmin = getSupabaseAdmin()
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !userData?.user) return new Response('Não autenticado.', { status: 401 })

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .single()

  if (error || !order) return new Response('Pedido não encontrado.', { status: 404 })

  // Só o dono do pedido (ou um admin) pode baixar o comprovante.
  if (order.user_id !== userData.user.id) {
    const { data: profile } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', userData.user.id).single()
    if (!profile?.is_admin) return new Response('Acesso negado.', { status: 403 })
  }

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([420, 600])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let y = 560
  const draw = (text, { size = 10, useBold = false, color = rgb(0.1, 0.1, 0.1), x = 40 } = {}) => {
    page.drawText(text, { x, y, size, font: useBold ? bold : font, color })
    y -= size + 8
  }

  draw('DOS STATES', { size: 18, useBold: true })
  draw('Comprovante de compra', { size: 11, color: rgb(0.4, 0.4, 0.4) })
  y -= 10

  draw(`Pedido: ${orderDisplayCode(order.id)}`, { useBold: true })
  draw(`Data: ${new Date(order.created_at).toLocaleString('pt-BR')}`)
  draw(`Cliente: ${order.customer_name}`)
  draw(`E-mail: ${order.customer_email}`)
  y -= 10

  draw('Itens', { useBold: true })
  for (const item of order.order_items || []) {
    draw(`${item.quantity}x ${item.product_name} — ${formatBRL(item.unit_price * item.quantity)}`, { size: 9.5 })
  }
  y -= 6

  if (order.discount_amount > 0) {
    draw(`Desconto (${order.coupon_code || 'cupom'}): -${formatBRL(order.discount_amount)}`, { size: 9.5 })
  }
  if (order.shipping_fee > 0) {
    draw(`Frete: ${formatBRL(order.shipping_fee)}`, { size: 9.5 })
  }
  y -= 6
  draw(`Total: ${formatBRL(order.total)}`, { size: 13, useBold: true })

  const pdfBytes = await pdfDoc.save()

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="comprovante-${orderDisplayCode(order.id)}.pdf"`,
    },
  })
}
