'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminAvisosPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [onlyPending, setOnlyPending] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/stock-alerts', { headers: { Authorization: `Bearer ${session?.access_token}` } })
    const data = await res.json()
    setAlerts(data.alerts || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleNotified = async (alert) => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/stock-alerts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ id: alert.id, notified: !alert.notified }),
    })
    load()
  }

  if (loading) return <p className="text-muted">Carregando avisos…</p>

  const visible = onlyPending ? alerts.filter((a) => !a.notified) : alerts

  return (
    <div>
      <label className="flex items-center gap-2 text-sm mb-6 cursor-pointer w-fit">
        <input type="checkbox" checked={onlyPending} onChange={(e) => setOnlyPending(e.target.checked)} />
        Mostrar só pendentes de aviso
      </label>

      {visible.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
          Nenhum pedido de aviso por aqui.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted border-b border-line">
              <th className="py-2">Produto</th>
              <th>Contato</th>
              <th>Estoque atual</th>
              <th>Data</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.id} className="border-b border-line">
                <td className="py-2">{a.products?.name || 'Produto removido'}</td>
                <td>{a.contact}</td>
                <td>{a.products?.stock ?? '—'}</td>
                <td className="text-muted">{new Date(a.created_at).toLocaleDateString('pt-BR')}</td>
                <td>
                  <button onClick={() => toggleNotified(a)} className="text-stamp text-xs font-semibold">
                    {a.notified ? 'Marcar pendente' : 'Marcar avisado'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
