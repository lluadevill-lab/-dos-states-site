'use client'

import Link from 'next/link'
import { Plus, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatBRL } from '../lib/format'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  return (
    <div className="tag-card group flex flex-col">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="aspect-square bg-paperDim relative overflow-hidden flex items-center justify-center">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <span className="font-display text-3xl text-ink/10 select-none">DOS STATES</span>
          )}

          {product.badge && (
            <span className="stamp-badge absolute top-4 left-4 bg-paper">{product.badge}</span>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1 px-4 py-4">
        {product.code && <span className="tracking-code">{product.code}</span>}
        <Link href={`/produto/${product.slug}`}>
          <h3 className="font-semibold text-ink leading-snug hover:text-stamp transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.brand && <p className="text-sm text-muted">{product.brand}</p>}
        {product.avg_rating && (
          <div className="flex items-center gap-1 text-xs text-muted">
            <Star size={12} className="fill-stamp text-stamp" />
            {product.avg_rating.toFixed(1)} ({product.review_count})
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="font-mono font-semibold text-ink">{formatBRL(product.price)}</span>
          <button
            onClick={() => addItem(product)}
            className="w-9 h-9 rounded-full border border-ink flex items-center justify-center hover:bg-ink hover:text-white transition-colors"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
