'use client'

import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatBRL } from '../../lib/format'

export default function CarrinhoPage() {
  const { items, updateQty, removeItem, total, hydrated } = useCart()

  if (hydrated && items.length === 0) {
    return (
      <div className="max-w-container mx-auto px-4 md:px-8 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-4">Seu carrinho está vazio</h1>
        <p className="text-muted mb-8">Que tal dar uma olhada nos produtos recém-chegados de Miami?</p>
        <Link href="/loja" className="btn-primary inline-flex">Ir para a loja</Link>
      </div>
    )
  }

  return (
    <div className="max-w-container mx-auto px-4 md:px-8 py-16">
      <p className="tracking-code mb-2">MANIFESTO DE COMPRA</p>
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-10">Carrinho</h1>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border border-line rounded-sm p-4">
              <div className="w-20 h-20 bg-paperDim rounded-sm flex items-center justify-center shrink-0 overflow-hidden">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-xs text-ink/10">DS</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">{item.name}</p>
                {item.brand && <p className="text-sm text-muted">{item.brand}</p>}
              </div>

              <div className="flex items-center border border-line rounded-sm">
                <button
                  onClick={() => updateQty(item.id, item.qty - 1)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-paperDim"
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-mono text-sm">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-paperDim"
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={14} />
                </button>
              </div>

              <p className="font-mono font-semibold w-24 text-right shrink-0">{formatBRL(item.price * item.qty)}</p>

              <button
                onClick={() => removeItem(item.id)}
                className="text-muted hover:text-stamp transition-colors shrink-0"
                aria-label={`Remover ${item.name}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="border border-line rounded-sm p-6 h-fit flex flex-col gap-4">
          <div className="flex justify-between text-muted text-sm">
            <span>Subtotal</span>
            <span className="font-mono">{formatBRL(total)}</span>
          </div>
          <p className="text-xs text-muted">Frete e taxas de importação são calculados no checkout.</p>
          <div className="flight-divider" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="font-mono">{formatBRL(total)}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full mt-2">Finalizar compra</Link>
        </div>
      </div>
    </div>
  )
}
