'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const EMPTY_FORM = { code: '', discount_type: 'percent', discount_value: '', max_uses: '', expires_at: '' }

export default function AdminCuponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/coupons', { headers: { Authorization: `Bearer ${session?.access_token}` } })
    const data = await res.json()
    setCoupons(data.coupons || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify(form),
    })
    setSaving(false)
    const data = await res.json()
    if (!res.ok) { setErrorMsg(data.error || 'Não foi possível criar o cupom.'); return }
    setForm(EMPTY_FORM)
    load()
  }

  const toggleActive = async (coupon) => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/coupons', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
    })
    load()
  }

  return (
    <div>
      <form onSubmit={submit} className="border border-line rounded-sm p-4 mb-8 grid sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="label-field">Código</label>
          <input required className="input-field uppercase" value={form.code} onChange={update('code')} placeholder="BEMVINDO10" />
        </div>
        <div>
          <label className="label-field">Tipo</label>
          <select className="input-field" value={form.discount_type} onChange={update('discount_type')}>
            <option value="percent">% percentual</option>
            <option value="fixed">R$ fixo</option>
          </select>
        </div>
        <div>
          <label className="label-field">Valor</label>
          <input required type="number" min="0" step="0.01" className="input-field" value={form.discount_value} onChange={update('discount_value')} />
        </div>
        <div>
          <label className="label-field">Usos máx. (opcional)</label>
          <input type="number" min="1" className="input-field" value={form.max_uses} onChange={update('max_uses')} />
        </div>
        <div>
          <label className="label-field">Expira em (opcional)</label>
          <input type="date" className="input-field" value={form.expires_at} onChange={update('expires_at')} />
        </div>
        <div className="sm:col-span-5">
          {errorMsg && <p className="text-stamp text-sm mb-2">{errorMsg}</p>}
          <button disabled={saving} className="btn-primary text-sm">{saving ? 'Criando…' : 'Criar cupom'}</button>
        </div>
      </form>

      {loading ? (
        <p className="text-muted">Carregando cupons…</p>
      ) : coupons.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">Nenhum cupom criado ainda.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted border-b border-line">
              <th className="py-2">Código</th>
              <th>Desconto</th>
              <th>Usos</th>
              <th>Expira</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-line">
                <td className="py-2 font-mono font-semibold">{c.code}</td>
                <td>{c.discount_type === 'percent' ? `${c.discount_value}%` : `R$ ${c.discount_value}`}</td>
                <td>{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('pt-BR') : '—'}</td>
                <td>
                  <span className={`stamp-badge ${c.active ? '' : 'opacity-40'}`}>{c.active ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td>
                  <button onClick={() => toggleActive(c)} className="text-stamp text-xs font-semibold">
                    {c.active ? 'Desativar' : 'Reativar'}
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
