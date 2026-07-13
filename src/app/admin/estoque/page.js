'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const REASON_LABELS = {
  venda: 'Venda (pedido pago)',
  ajuste_manual: 'Ajuste manual',
}

export default function AdminEstoquePage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetch('/api/admin/stock-history', { headers: { Authorization: `Bearer ${session?.access_token}` } })
        .then((r) => r.json())
        .then((data) => setHistory(data.history || []))
        .finally(() => setLoading(false))
    })
  }, [])

  if (loading) return <p className="text-muted">Carregando histórico…</p>

  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Histórico de estoque</h2>
      {history.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
          Nenhuma movimentação de estoque registrada ainda.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted border-b border-line">
              <th className="py-2">Produto</th>
              <th>Alteração</th>
              <th>Motivo</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-b border-line">
                <td className="py-2">{h.products?.name || 'Produto removido'}</td>
                <td className={`font-mono font-semibold ${h.change < 0 ? 'text-stamp' : 'text-teal'}`}>
                  {h.change > 0 ? `+${h.change}` : h.change}
                </td>
                <td className="text-muted">{REASON_LABELS[h.reason] || h.reason}</td>
                <td className="text-muted">{new Date(h.created_at).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
