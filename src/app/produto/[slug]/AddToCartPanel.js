'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus } from 'lucide-react'
import { useCart } from '../../../context/CartContext'

export default function AddToCartPanel({ product }) {
  const { addItem } = useCart()
  const router = useRouter()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addItem(product, qty)
    router.push('/carrinho')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-line rounded-sm">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-11 h-11 flex items-center justify-center text-ink hover:bg-paperDim"
            aria-label="Diminuir quantidade"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center font-mono">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-11 h-11 flex items-center justify-center text-ink hover:bg-paperDim"
            aria-label="Aumentar quantidade"
          >
            <Plus size={16} />
          </button>
        </div>
        <button onClick={handleAdd} className="btn-outline flex-1">
          {added ? 'Adicionado ✓' : 'Adicionar ao carrinho'}
        </button>
      </div>
      <button onClick={handleBuyNow} className="btn-primary w-full">
        Comprar agora
      </button>
    </div>
  )
}
