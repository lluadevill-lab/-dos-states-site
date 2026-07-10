'use client'

import { useEffect, useState } from 'react'
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

  const updateStatus = async (order, status) => {
    setSavingId(order.id)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ id: order.id, status }),
    })
    setSavingId(null)
    if (res.ok) load()
    else alert('Não foi possível atualizar o status do pedido.')
  }

  if (loading) return <p className="text-muted">Carregando pedidos…</p>
  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
        Nenhum pedido registrado ainda.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((o) => (
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
                onChange={(e) => updateStatus(o, e.target.value)}
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
        </div>
      ))}
    </div>
  )
}
