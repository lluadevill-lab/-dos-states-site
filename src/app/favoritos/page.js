'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { attachRatings } from '../../lib/ratings'
import ProductCard from '../../components/ProductCard'

export default function FavoritosPage() {
  const { user, loading } = useAuth()
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    if (!user) { setProductsLoading(false); return }
    setProductsLoading(true)
    supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(async ({ data, error }) => {
        if (error) { console.error(error.message); setProductsLoading(false); return }
        const ids = (data || []).map((f) => f.product_id)
        if (!ids.length) { setProducts([]); setProductsLoading(false); return }
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', ids)
        if (productsError) { console.error(productsError.message); setProductsLoading(false); return }
        // Mantém a ordem de "favoritado mais recente primeiro".
        const byId = Object.fromEntries((productsData || []).map((p) => [p.id, p]))
        const ordered = ids.map((id) => byId[id]).filter(Boolean)
        setProducts(await attachRatings(ordered))
        setProductsLoading(false)
      })
  }, [user])

  if (loading || productsLoading) {
    return <div className="max-w-container mx-auto px-4 md:px-8 py-24 text-center text-muted">Carregando…</div>
  }

  if (!user) {
    return (
      <div className="max-w-container mx-auto px-4 md:px-8 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-4">Favoritos</h1>
        <p className="text-muted mb-8">Entre na sua conta para ver seus produtos favoritos.</p>
        <Link href="/login" className="btn-primary inline-flex">Entrar ou criar conta</Link>
      </div>
    )
  }

  return (
    <div className="max-w-container mx-auto px-4 md:px-8 py-16">
      <p className="tracking-code mb-2">LISTA DE DESEJOS</p>
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-10">Meus favoritos</h1>

      {products.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
          Você ainda não favoritou nenhum produto. Clique no coração de um produto na loja pra salvá-lo aqui.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
