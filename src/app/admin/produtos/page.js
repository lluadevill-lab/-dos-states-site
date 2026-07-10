'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { formatBRL } from '../../../lib/format'
import ProductForm from './ProductForm'

export default function AdminProdutosPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = fechado, {} = novo, {...} = editando

  const load = () => {
    setLoading(true)
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Erro ao carregar produtos:', error.message)
        setProducts(data || [])
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (product) => {
    if (!confirm(`Remover "${product.name}"? Essa ação não pode ser desfeita.`)) return

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ id: product.id }),
    })

    if (res.ok) load()
    else alert('Não foi possível remover o produto.')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-lg">Produtos {!loading && `(${products.length})`}</h2>
        {!editing && (
          <button onClick={() => setEditing({})} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Novo produto
          </button>
        )}
      </div>

      {editing && (
        <ProductForm
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
          Nenhum produto cadastrado ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 border border-line rounded-sm p-3">
              <div className="w-14 h-14 bg-paperDim rounded-sm overflow-hidden shrink-0 flex items-center justify-center">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-[10px] text-ink/10">DS</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{p.name}</p>
                <p className="text-xs text-muted truncate">{p.slug} · {p.category || 'sem categoria'}</p>
              </div>
              <p className="font-mono font-semibold shrink-0">{formatBRL(p.price)}</p>
              <p className="text-xs text-muted w-24 text-right shrink-0">estoque: {p.stock ?? 0}</p>
              <button
                onClick={() => setEditing(p)}
                className="w-9 h-9 flex items-center justify-center border border-line rounded-sm hover:border-ink shrink-0"
                aria-label={`Editar ${p.name}`}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(p)}
                className="w-9 h-9 flex items-center justify-center border border-line rounded-sm hover:border-stamp hover:text-stamp shrink-0"
                aria-label={`Remover ${p.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
