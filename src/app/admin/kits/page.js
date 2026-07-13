'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { formatBRL } from '../../../lib/format'

const EMPTY_FORM = { name: '', description: '', price: '', image_url: '' }

export default function AdminKitsPage() {
  const [bundles, setBundles] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedItems, setSelectedItems] = useState([]) // [{ product_id, quantity }]
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const [bundlesRes, productsRes] = await Promise.all([
      fetch('/api/admin/kits', { headers: { Authorization: `Bearer ${session?.access_token}` } }),
      fetch('/api/admin/products', { headers: { Authorization: `Bearer ${session?.access_token}` } }),
    ])
    setBundles((await bundlesRes.json()).bundles || [])
    setProducts((await productsRes.json()).products || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const toggleProduct = (productId) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.product_id === productId)
      if (exists) return prev.filter((i) => i.product_id !== productId)
      return [...prev, { product_id: productId, quantity: 1 }]
    })
  }

  const updateQty = (productId, qty) => {
    setSelectedItems((prev) => prev.map((i) => (i.product_id === productId ? { ...i, quantity: qty } : i)))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!selectedItems.length) { setErrorMsg('Selecione pelo menos um produto pro kit.'); return }
    setSaving(true)
    setErrorMsg('')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/kits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ ...form, items: selectedItems }),
    })
    setSaving(false)
    const data = await res.json()
    if (!res.ok) { setErrorMsg(data.error || 'Não foi possível criar o kit.'); return }
    setForm(EMPTY_FORM)
    setSelectedItems([])
    load()
  }

  const toggleActive = async (bundle) => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/kits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ id: bundle.id, active: !bundle.active }),
    })
    load()
  }

  const suggestedTotal = selectedItems.reduce((acc, i) => {
    const p = products.find((p) => p.id === i.product_id)
    return acc + (p ? Number(p.price) * i.quantity : 0)
  }, 0)

  if (loading) return <p className="text-muted">Carregando kits…</p>

  return (
    <div>
      <form onSubmit={submit} className="border border-line rounded-sm p-4 mb-8">
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="sm:col-span-2">
            <label className="label-field">Nome do kit</label>
            <input required className="input-field" value={form.name} onChange={update('name')} />
          </div>
          <div>
            <label className="label-field">Preço do kit</label>
            <input required type="number" min="0" step="0.01" className="input-field" value={form.price} onChange={update('price')} />
          </div>
          <div className="sm:col-span-2">
            <label className="label-field">Descrição (opcional)</label>
            <input className="input-field" value={form.description} onChange={update('description')} />
          </div>
          <div>
            <label className="label-field">Imagem de capa (opcional)</label>
            <input className="input-field" value={form.image_url} onChange={update('image_url')} placeholder="https://..." />
          </div>
        </div>

        <label className="label-field">Produtos incluídos no kit</label>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-line rounded-sm p-3 mb-3">
          {products.map((p) => {
            const selected = selectedItems.find((i) => i.product_id === p.id)
            return (
              <div key={p.id} className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={!!selected} onChange={() => toggleProduct(p.id)} />
                <span className="flex-1">{p.name} — {formatBRL(p.price)}</span>
                {selected && (
                  <input
                    type="number"
                    min="1"
                    className="input-field w-16 h-8 py-0 text-xs"
                    value={selected.quantity}
                    onChange={(e) => updateQty(p.id, Number(e.target.value) || 1)}
                  />
                )}
              </div>
            )
          })}
        </div>

        {selectedItems.length > 0 && (
          <p className="text-xs text-muted mb-3">
            Soma dos produtos avulsos: {formatBRL(suggestedTotal)} — defina o preço do kit acima com o desconto que quiser dar.
          </p>
        )}

        {errorMsg && <p className="text-stamp text-sm mb-2">{errorMsg}</p>}
        <button disabled={saving} className="btn-primary text-sm">{saving ? 'Criando…' : 'Criar kit'}</button>
      </form>

      {bundles.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">Nenhum kit criado ainda.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {bundles.map((b) => (
            <div key={b.id} className="border border-line rounded-sm p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{b.name} <span className="font-mono text-stamp">{formatBRL(b.price)}</span></p>
                <p className="text-xs text-muted">
                  {(b.bundle_items || []).map((i) => `${i.quantity}x ${i.products?.name}`).join(' + ')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`stamp-badge ${b.active ? '' : 'opacity-40'}`}>{b.active ? 'Ativo' : 'Inativo'}</span>
                <button onClick={() => toggleActive(b)} className="text-stamp text-xs font-semibold">
                  {b.active ? 'Desativar' : 'Reativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
