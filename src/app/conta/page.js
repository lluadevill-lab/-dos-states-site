'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatBRL, orderDisplayCode } from '../../lib/format'

const STATUS_LABELS = {
  pendente: 'Pendente',
  aguardando_pix: 'Aguardando Pix',
  pago: 'Pago',
  cancelado: 'Cancelado',
  enviado: 'Enviado',
  entregue: 'Entregue',
  via_whatsapp: 'Combinando via WhatsApp',
}

function ReviewForm({ orderItem, onDone }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setSaving(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ order_item_id: orderItem.id, rating, comment }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error || 'Não foi possível enviar sua avaliação.')
      return
    }
    onDone()
  }

  return (
    <div className="mt-2 border border-line rounded-sm p-3 bg-paperDim">
      <p className="text-xs font-semibold uppercase tracking-wide mb-2">Avaliar {orderItem.product_name}</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} aria-label={`${n} estrelas`}>
            <Star size={20} className={n <= rating ? 'fill-stamp text-stamp' : 'text-line'} />
          </button>
        ))}
      </div>
      <textarea
        className="input-field w-full text-sm"
        rows={3}
        placeholder="Conte como foi sua experiência com o produto (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="text-xs text-stamp mt-2">{error}</p>}
      <button disabled={saving} onClick={submit} className="btn-primary text-xs mt-3">
        {saving ? 'Enviando…' : 'Enviar avaliação'}
      </button>
    </div>
  )
}

const PROGRESS_STEPS = ['pendente', 'pago', 'enviado', 'entregue']

function OrderProgress({ status }) {
  // Pedidos cancelados ou fechados via WhatsApp não seguem essa esteira linear.
  if (status === 'cancelado') {
    return <p className="text-xs text-stamp font-semibold mt-3">Pedido cancelado</p>
  }
  if (status === 'via_whatsapp') {
    return <p className="text-xs text-muted mt-3">Combinando os detalhes com você pelo WhatsApp</p>
  }

  const stepIndex = status === 'aguardando_pix'
    ? 0
    : PROGRESS_STEPS.indexOf(status)
  const current = stepIndex === -1 ? 0 : stepIndex

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {PROGRESS_STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${i <= current ? 'bg-stamp' : 'bg-line'}`}
            />
            {i < PROGRESS_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 ${i < current ? 'bg-stamp' : 'bg-line'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex text-[10px] text-muted uppercase tracking-wide mt-1.5 justify-between">
        <span className={current >= 0 ? 'text-ink font-semibold' : ''}>Pendente</span>
        <span className={current >= 1 ? 'text-ink font-semibold' : ''}>Pago</span>
        <span className={current >= 2 ? 'text-ink font-semibold' : ''}>Enviado</span>
        <span className={current >= 3 ? 'text-ink font-semibold' : ''}>Entregue</span>
      </div>
    </div>
  )
}

const PAID_STATUSES_FOR_RECEIPT = ['pago', 'enviado', 'entregue']

async function downloadReceipt(orderId) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`/api/orders/${orderId}/receipt`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  })
  if (!res.ok) { alert('Não foi possível gerar o comprovante.'); return }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `comprovante-${orderDisplayCode(orderId)}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

function OrderCard({ order, onReviewed }) {
  const [reviewingItemId, setReviewingItemId] = useState(null)

  return (
    <div className="border border-line rounded-sm p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-semibold">{orderDisplayCode(order.id)}</p>
          <p className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
        </div>
        <span className="stamp-badge">{STATUS_LABELS[order.status] || order.status}</span>
        <p className="font-mono font-semibold">{formatBRL(order.total)}</p>
      </div>

      <ul className="text-sm text-muted list-disc list-inside mt-2">
        {(order.order_items || []).map((it) => (
          <li key={it.id}>{it.quantity}× {it.product_name}</li>
        ))}
      </ul>

      <OrderProgress status={order.status} />

      {PAID_STATUSES_FOR_RECEIPT.includes(order.status) && (
        <button onClick={() => downloadReceipt(order.id)} className="text-xs text-stamp font-semibold mt-3">
          Baixar comprovante (PDF)
        </button>
      )}

      {order.shipping_message && (order.status === 'enviado' || order.status === 'entregue') && (
        <div className="mt-3 text-xs bg-paperDim border border-line rounded-sm p-3 whitespace-pre-wrap">
          <span className="font-semibold uppercase tracking-wide text-[10px] block mb-1">Informações de entrega</span>
          {order.shipping_message}
        </div>
      )}

      {order.status === 'entregue' && (
        <div className="mt-3 flex flex-col gap-2">
          {(order.order_items || []).map((it) => {
            const alreadyReviewed = (it.reviews || []).length > 0
            if (alreadyReviewed) {
              return (
                <p key={it.id} className="text-xs text-muted italic">
                  Você já avaliou {it.product_name}. Obrigado!
                </p>
              )
            }
            if (reviewingItemId === it.id) {
              return (
                <ReviewForm
                  key={it.id}
                  orderItem={it}
                  onDone={() => { setReviewingItemId(null); onReviewed() }}
                />
              )
            }
            return (
              <button
                key={it.id}
                onClick={() => setReviewingItemId(it.id)}
                className="btn-outline text-xs w-fit"
              >
                Avaliar {it.product_name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ContaPage() {
  const { user, loading, signOut } = useAuth()
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [referralCode, setReferralCode] = useState(null)
  const [copied, setCopied] = useState(false)

  const loadOrders = () => {
    if (!user) {
      setOrdersLoading(false)
      return
    }
    setOrdersLoading(true)
    supabase
      .from('orders')
      .select('id, created_at, status, total, payment_method, shipping_message, order_items(id, product_name, quantity, reviews(id))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Erro ao buscar pedidos:', error.message)
        setOrders(data || [])
        setOrdersLoading(false)
      })
  }

  useEffect(() => { loadOrders() }, [user])

  useEffect(() => {
    if (!user) return
    const refCode = localStorage.getItem('dos-states:ref_code')
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const res = await fetch('/api/profile/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ ref_code: refCode || undefined }),
      })
      const data = await res.json()
      if (data.referral_code) setReferralCode(data.referral_code)
    })
  }, [user])

  const referralLink = referralCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referralCode}` : ''

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="max-w-container mx-auto px-4 md:px-8 py-24 text-center text-muted">Carregando…</div>
  }

  if (!user) {
    return (
      <div className="max-w-container mx-auto px-4 md:px-8 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-4">Minha conta</h1>
        <p className="text-muted mb-8">Entre na sua conta para ver seus pedidos e acompanhar entregas.</p>
        <Link href="/login" className="btn-primary inline-flex">Entrar ou criar conta</Link>
      </div>
    )
  }

  return (
    <div className="max-w-container mx-auto px-4 md:px-8 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="tracking-code mb-2">FICHA DO CLIENTE</p>
          <h1 className="font-display text-3xl md:text-4xl text-ink">Minha conta</h1>
          <p className="text-muted text-sm mt-1">{user.email}</p>
        </div>
        <button onClick={signOut} className="btn-outline">Sair</button>
      </div>

      {referralCode && (
        <div className="border border-line rounded-sm p-4 mb-10 bg-paperDim">
          <p className="text-xs font-semibold uppercase tracking-wide mb-1">Indique e ganhe</p>
          <p className="text-sm text-muted mb-3">
            Compartilhe seu link com amigos. Quando eles comprarem, você fica elegível a um desconto.
          </p>
          <div className="flex gap-2">
            <input readOnly className="input-field text-xs flex-1" value={referralLink} />
            <button onClick={copyReferralLink} className="btn-outline text-xs whitespace-nowrap">
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>
      )}

      <h2 className="font-semibold text-lg mb-4">Meus pedidos</h2>
      {ordersLoading ? (
        <p className="text-muted">Carregando pedidos…</p>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
          Você ainda não fez nenhum pedido.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} onReviewed={loadOrders} />
          ))}
        </div>
      )}
    </div>
  )
}
