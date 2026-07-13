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
    delivery_min_days: product.delivery_min_days ?? '',
    delivery_max_days: product.delivery_max_days ?? '',
    images: product.images?.length ? product.images : [''],
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

  const updateImage = (index) => (e) => {
    setForm((f) => {
      const images = [...f.images]
      images[index] = e.target.value
      return { ...f, images }
    })
  }
  const addImageField = () => setForm((f) => ({ ...f, images: [...f.images, ''] }))
  const removeImageField = (index) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const cleanImages = form.images.map((u) => u.trim()).filter(Boolean)
    const payload = {
      ...form,
      images: cleanImages,
      image_url: form.image_url || cleanImages[0] || '',
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      delivery_min_days: form.delivery_min_days === '' ? null : Number(form.delivery_min_days),
      delivery_max_days: form.delivery_max_days === '' ? null : Number(form.delivery_max_days),
    }
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
          <label className="label-field">URL da imagem de capa</label>
          <input className="input-field" value={form.image_url} onChange={update('image_url')} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Galeria de fotos (opcional, além da capa)</label>
          <div className="flex flex-col gap-2">
            {form.images.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input className="input-field" value={url} onChange={updateImage(i)} placeholder="https://..." />
                <button type="button" onClick={() => removeImageField(i)} className="btn-outline px-3">✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addImageField} className="text-xs text-stamp font-semibold mt-2">
            + Adicionar outra foto
          </button>
        </div>
        <div>
          <label className="label-field">Código de rastreio (opcional)</label>
          <input className="input-field" value={form.code} onChange={update('code')} />
        </div>
        <div>
          <label className="label-field">Entrega — mínimo (dias úteis)</label>
          <input type="number" min="0" className="input-field" value={form.delivery_min_days} onChange={update('delivery_min_days')} placeholder="Ex: 15" />
        </div>
        <div>
          <label className="label-field">Entrega — máximo (dias úteis)</label>
          <input type="number" min="0" className="input-field" value={form.delivery_max_days} onChange={update('delivery_max_days')} placeholder="Ex: 25" />
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
