'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'dos-states:cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [hydrated, setHydrated] = useState(false)

  // Carrega o carrinho salvo assim que o app abre no navegador.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch (e) {
      console.warn('Não foi possível ler o carrinho salvo:', e)
    } finally {
      setHydrated(true)
    }
  }, [])

  // Salva a cada mudança (depois da hidratação inicial, para não sobrescrever com [])
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.warn('Não foi possível salvar o carrinho:', e)
    }
  }, [items, hydrated])

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          price: Number(product.price),
          image_url: product.image_url || null,
          type: product.type || 'product',
          qty,
        },
      ]
    })
  }

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeItem(id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
  }

  const clear = () => setItems([])

  const { count, total } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        count: acc.count + i.qty,
        total: acc.total + i.qty * i.price,
      }),
      { count: 0, total: 0 }
    )
  }, [items])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, count, total, hydrated }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return ctx
}
