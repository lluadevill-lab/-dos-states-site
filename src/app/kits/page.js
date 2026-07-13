'use client'

import { useEffect, useState } from 'react'
import { Plus, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useCart } from '../../context/CartContext'
import { formatBRL } from '../../lib/format'

export default function KitsPage() {
  const { addItem } = useCart()
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('bundles')
      .select('*, bundle_items(quantity, products(name))')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setBundles(data || []); setLoading(false) })
  }, [])

  return (
    <div className="max-w-container mx-auto px-4 md:px-8 py-16">
      <p className="tracking-code mb-2">COMBOS COM DESCONTO</p>
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-10">Kits</h1>

      {loading ? (
        <p className="text-muted">Carregando kits…</p>
      ) : bundles.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
          Nenhum kit disponível no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {bundles.map((b) => (
            <div key={b.id} className="tag-card group flex flex-col">
              <div className="aspect-square bg-paperDim relative overflow-hidden flex items-center justify-center">
                {b.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image_url} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={40} className="text-ink/20" />
                )}
              </div>
              <div className="flex flex-col gap-1 px-4 py-4">
                <h3 className="font-semibold text-ink leading-snug">{b.name}</h3>
                <p className="text-xs text-muted">
                  {(b.bundle_items || []).map((i) => `${i.quantity}x ${i.products?.name}`).join(' + ')}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-mono font-semibold text-ink">{formatBRL(b.price)}</span>
                  <button
                    onClick={() => addItem({ id: b.id, slug: b.slug, name: b.name, price: b.price, image_url: b.image_url, type: 'bundle' })}
                    className="w-9 h-9 rounded-full border border-ink flex items-center justify-center hover:bg-ink hover:text-white transition-colors"
                    aria-label={`Adicionar kit ${b.name} ao carrinho`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
