'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminIndicacoesPage() {
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetch('/api/admin/referrals', { headers: { Authorization: `Bearer ${session?.access_token}` } })
        .then((r) => r.json())
        .then((data) => setReferrals(data.referrals || []))
        .finally(() => setLoading(false))
    })
  }, [])

  if (loading) return <p className="text-muted">Carregando indicações…</p>

  return (
    <div>
      <p className="text-sm text-muted mb-6">
        Quando alguém indicado já tiver um pedido pago, considere criar um cupom (aba Cupons) pra
        recompensar quem indicou.
      </p>
      {referrals.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
          Nenhuma indicação registrada ainda.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted border-b border-line">
              <th className="py-2">Indicado</th>
              <th>Indicado por</th>
              <th>Já comprou?</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((r, i) => (
              <tr key={i} className="border-b border-line">
                <td className="py-2">{r.referred_email || '—'}</td>
                <td>{r.referrer_email || `código ${r.referred_by_code}`}</td>
                <td>
                  <span className={`stamp-badge ${r.has_paid_order ? '' : 'opacity-40'}`}>
                    {r.has_paid_order ? 'Sim' : 'Ainda não'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
