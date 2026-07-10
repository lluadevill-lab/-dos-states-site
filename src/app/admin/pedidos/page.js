'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { formatBRL, orderDisplayCode } from '../../../lib/format'

const STATUS_OPTIONS = ['pendente', 'aguardando_pix', 'pago', 'enviado', 'entregue', 'cancelado', 'via_whatsapp']

const STATUS_LABELS = {
  pendente: 'Pendente',
  aguardando_pix: 'Aguardando Pix',
  pago: 'Pago',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  via_whatsapp: 'Via WhatsApp',
}

const METHOD_LABELS = {
  mercado_pago: 'Mercado Pago',
  pix_manual: 'Pix manual',
  whatsapp: 'WhatsApp',
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [activeTab, setActiveTab] = useState('pendente')
  // Guarda o rascunho da mensagem de envio por pedido, enquanto o admin digita.
  const [shippingDrafts, setShippingDrafts] = useState({})
  // Id do pedido cujo campo de mensagem de envio está aberto no momento.
  const [openShippingFor, setOpenShippingFor] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    const data = await res.json()
    setOrders(data.orders || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const grouped = useMemo(() => {
    const map = Object.fromEntries(STATUS_OPTIONS.map((s) => [s, []]))
    for (const o of orders) {
      if (map[o.status]) map[o.status].push(o)
      else map.pendente.push(o)
    }
    return map
  }, [orders])

  const updateStatus = async (order, status, shippingMessage) => {
    setSavingId(order.id)
    const { data: { session } } = await supabase.auth.getSession()
    const body = { id: order.id, status }
    if (typeof shippingMessage === 'string') body.shipping_message = shippingMessage
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify(body),
    })
    setSavingId(null)
    if (res.ok) {
      setOpenShippingFor(null)
      load()
    } else {
      alert('Não foi possível atualizar o status do pedido.')
    }
  }

  const handleStatusChange = (order, status) => {
    // Ao mudar para "enviado", abre o campo de mensagem em vez de salvar na hora,
    // pra dar chance de escrever o link de rastreio antes de confirmar.
    if (status === 'enviado') {
      setShippingDrafts((prev) => ({ ...prev, [order.id]: prev[order.id] ?? order.shipping_message ?? '' }))
      setOpenShippingFor(order.id)
      return
    }
    updateStatus(order, status)
  }

  if (loading) return <p className="text-muted">Carregando pedidos…</p>

  return (
    <div>
      <nav className="flex flex-wrap gap-2 border-b border-line mb-8 -mt-2 pb-px">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b-2 -mb-px transition-colors ${
              activeTab === s ? 'text-stamp border-stamp' : 'text-muted border-transparent hover:text-ink'
            }`}
          >
            {STATUS_LABELS[s]} ({grouped[s]?.length ?? 0})
          </button>
        ))}
      </nav>

      {grouped[activeTab]?.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
          Nenhum pedido em &ldquo;{STATUS_LABELS[activeTab]}&rdquo;.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped[activeTab].map((o) => (
            <div key={o.id} className="border border-line rounded-sm p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-mono font-semibold text-sm">{orderDisplayCode(o.id)}</p>
                  <p className="text-xs text-muted">
                    {new Date(o.created_at).toLocaleString('pt-BR')} · {o.customer_name} · {o.customer_phone}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{METHOD_LABELS[o.payment_method] || o.payment_method}</span>
                  <select
                    value={o.status}
                    disabled={savingId === o.id}
                    onChange={(e) => handleStatusChange(o, e.target.value)}
                    className="input-field h-9 text-xs w-auto py-0"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <span className="font-mono font-semibold">{formatBRL(o.total)}</span>
                </div>
              </div>

              <ul className="text-sm text-muted list-disc list-inside">
                {(o.order_items || []).map((it) => (
                  <li key={it.id}>{it.quantity}× {it.product_name}</li>
                ))}
              </ul>

              {o.shipping_message && openShippingFor !== o.id && (
                <div className="mt-3 text-xs bg-paperDim border border-line rounded-sm p-3 whitespace-pre-wrap">
                  <span className="font-semibold uppercase tracking-wide text-[10px] block mb-1">Mensagem de envio enviada ao cliente</span>
                  {o.shipping_message}
                  <button
                    onClick={() => {
                      setShippingDrafts((prev) => ({ ...prev, [o.id]: o.shipping_message }))
                      setOpenShippingFor(o.id)
                    }}
                    className="block mt-2 text-stamp font-semibold"
                  >
                    Editar mensagem
                  </button>
                </div>
              )}

              {openShippingFor === o.id && (
                <div className="mt-3 border border-line rounded-sm p-3 bg-paperDim">
                  <label className="text-xs font-semibold uppercase tracking-wide block mb-2">
                    Mensagem de envio (rastreio, transportadora, prazo etc.)
                  </label>
                  <textarea
                    className="input-field w-full text-sm"
                    rows={4}
                    placeholder="Ex: Seu pedido foi enviado pelos Correios via Sedex. Código de rastreio: BR123456789US. Link: https://rastreamento.correios.com.br/..."
                    value={shippingDrafts[o.id] ?? ''}
                    onChange={(e) => setShippingDrafts((prev) => ({ ...prev, [o.id]: e.target.value }))}
                  />
                  <div className="flex gap-3 mt-3">
                    <button
                      disabled={savingId === o.id}
                      onClick={() => updateStatus(o, 'enviado', shippingDrafts[o.id] ?? '')}
                      className="btn-primary text-xs"
                    >
                      {savingId === o.id ? 'Salvando…' : 'Confirmar envio e avisar cliente'}
                    </button>
                    <button
                      onClick={() => setOpenShippingFor(null)}
                      className="btn-outline text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
