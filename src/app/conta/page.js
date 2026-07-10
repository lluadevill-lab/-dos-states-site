'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

export default function ContaPage() {
  const { user, loading, signOut } = useAuth()
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setOrdersLoading(false)
      return
    }
    supabase
      .from('orders')
      .select('id, created_at, status, total, payment_method')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Erro ao buscar pedidos:', error.message)
        setOrders(data || [])
        setOrdersLoading(false)
      })
  }, [user])

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
            <div key={o.id} className="border border-line rounded-sm p-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-sm font-semibold">{orderDisplayCode(o.id)}</p>
                <p className="text-xs text-muted">{new Date(o.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <span className="stamp-badge">{STATUS_LABELS[o.status] || o.status}</span>
              <p className="font-mono font-semibold">{formatBRL(o.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
