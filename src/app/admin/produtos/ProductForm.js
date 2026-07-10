'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ProductForm({ product, onClose, onSaved }) {
  const isEditing = !!product.id

  const [form, setForm] = useState({
    name: product.name || '',
    slug: product.slug || '',
    brand: product.brand || '',
    description: product.description || '',
    price: product.price ?? '',
    image_url: product.image_url || '',
    category: product.category || '',
    badge: product.badge || '',
    code: product.code || '',
    stock: product.stock ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (field) => (e) => {
    const value = e.target.value
    setForm((f) => {
      const next = { ...f, [field]: value }
      if (field === 'name' && !isEditing) next.slug = slugify(value)
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) || 0 }
    if (isEditing) payload.id = product.id

    try {
      const res = await fetch('/api/admin/products', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setSaving(false)

      if (!res.ok) {
        setError(data.error || 'Não foi possível salvar o produto.')
        return
      }
      onSaved()
    } catch (err) {
      console.error(err)
      setSaving(false)
      setError('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <div className="border border-line rounded-sm p-6 mb-8 bg-paperDim">
      <h3 className="font-semibold mb-4">{isEditing ? 'Editar produto' : 'Novo produto'}</h3>
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label-field">Nome</label>
          <input required className="input-field" value={form.name} onChange={update('name')} />
        </div>
        <div>
          <label className="label-field">Slug (URL)</label>
          <input required className="input-field" value={form.slug} onChange={update('slug')} />
        </div>
        <div>
          <label className="label-field">Marca</label>
          <input className="input-field" value={form.brand} onChange={update('brand')} />
        </div>
        <div>
          <label className="label-field">Preço (R$)</label>
          <input required type="number" step="0.01" min="0" className="input-field" value={form.price} onChange={update('price')} />
        </div>
        <div>
          <label className="label-field">Estoque</label>
          <input type="number" min="0" className="input-field" value={form.stock} onChange={update('stock')} />
        </div>
        <div>
          <label className="label-field">Categoria</label>
          <input className="input-field" value={form.category} onChange={update('category')} />
        </div>
        <div>
          <label className="label-field">Selo (opcional, ex: 10% OFF)</label>
          <input className="input-field" value={form.badge} onChange={update('badge')} />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">URL da imagem</label>
          <input className="input-field" value={form.image_url} onChange={update('image_url')} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Código de rastreio (opcional)</label>
          <input className="input-field" value={form.code} onChange={update('code')} />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Descrição</label>
          <textarea className="input-field h-24 py-2" value={form.description} onChange={update('description')} />
        </div>

        {error && <p className="text-stamp text-sm sm:col-span-2">{error}</p>}

        <div className="sm:col-span-2 flex gap-3 mt-2">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          <button type="button" onClick={onClose} className="btn-outline flex-1">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
