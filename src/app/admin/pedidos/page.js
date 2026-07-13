'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { formatBRL, orderDisplayCode } from '../../../lib/format'
import { customerWhatsappLink } from '../../../lib/whatsapp'

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

function toCsvValue(value) {
  const str = String(value ?? '')
  if (/[",\n;]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function downloadOrdersCsv(orders, labelForFilename = '') {
  const header = ['codigo', 'data', 'cliente', 'telefone', 'status', 'metodo_pagamento', 'total', 'itens']
  const rows = orders.map((o) => [
    orderDisplayCode(o.id),
    new Date(o.created_at).toLocaleString('pt-BR'),
    o.customer_name,
    o.customer_phone,
    STATUS_LABELS[o.status] || o.status,
    METHOD_LABELS[o.payment_method] || o.payment_method,
    o.total,
    (o.order_items || []).map((it) => `${it.quantity}x ${it.product_name}`).join(' | '),
  ])

  const csv = [header, ...rows].map((r) => r.map(toCsvValue).join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const suffix = labelForFilename
    ? '-' + labelForFilename.toLowerCase().replace(/\s+/g, '_')
    : ''
  a.download = `pedidos${suffix}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [activeTab, setActiveTab] = useState('pendente')
  const [search, setSearch] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [exportStatuses, setExportStatuses] = useState([])
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

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return orders
    return orders.filter((o) =>
      orderDisplayCode(o.id).toLowerCase().includes(term) ||
      (o.customer_name || '').toLowerCase().includes(term) ||
      (o.customer_phone || '').toLowerCase().includes(term)
    )
  }, [orders, search])

  const toggleExportStatus = (status) => {
    setExportStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const exportSelected = () => {
    const statusesToUse = exportStatuses.length ? exportStatuses : [activeTab]
    const ordersToExport = filteredOrders.filter((o) => statusesToUse.includes(o.status))
    if (ordersToExport.length === 0) {
      alert('Nenhum pedido encontrado para as abas selecionadas.')
      return
    }
    downloadOrdersCsv(ordersToExport, statusesToUse.map((s) => STATUS_LABELS[s]).join('-'))
    setExportOpen(false)
  }

  const grouped = useMemo(() => {
    const map = Object.fromEntries(STATUS_OPTIONS.map((s) => [s, []]))
    for (const o of filteredOrders) {
      if (map[o.status]) map[o.status].push(o)
      else map.pendente.push(o)
    }
    return map
  }, [filteredOrders])

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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative">
        <input
          type="text"
          placeholder="Buscar por código, nome ou telefone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field text-sm max-w-xs"
        />
        <div className="relative">
          <button
            onClick={() => setExportOpen((v) => !v)}
            className="btn-outline text-xs inline-flex items-center gap-2"
          >
            <Download size={14} /> Exportar CSV
          </button>

          {exportOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-paper border border-line rounded-sm p-4 shadow-lg z-10">
              <p className="text-xs font-semibold uppercase tracking-wide mb-3">
                Escolha as abas pra juntar num CSV
              </p>
              <div className="flex flex-col gap-2 mb-4 max-h-56 overflow-y-auto">
                {STATUS_OPTIONS.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportStatuses.includes(s)}
                      onChange={() => toggleExportStatus(s)}
                    />
                    {STATUS_LABELS[s]} ({grouped[s]?.length ?? 0})
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-muted mb-3">
                Nenhuma marcada = exporta só a aba aberta agora ({STATUS_LABELS[activeTab]}).
              </p>
              <button onClick={exportSelected} className="btn-primary text-xs w-full">
                Baixar CSV
              </button>
            </div>
          )}
        </div>
      </div>

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
          Nenhum pedido em &ldquo;{STATUS_LABELS[activeTab]}&rdquo;{search ? ' para essa busca' : ''}.
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
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => {
                        setShippingDrafts((prev) => ({ ...prev, [o.id]: o.shipping_message }))
                        setOpenShippingFor(o.id)
                      }}
                      className="text-stamp font-semibold"
                    >
                      Editar mensagem
                    </button>
                    {customerWhatsappLink(o.customer_phone, o.shipping_message) && (
                      <a
                        href={customerWhatsappLink(o.customer_phone, o.shipping_message)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stamp font-semibold"
                      >
                        Enviar por WhatsApp
                      </a>
                    )}
                  </div>
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
