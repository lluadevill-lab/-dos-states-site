import { supabase } from './supabase'

// Busca as notas de todos os produtos da lista de uma vez só (evita 1 query por card)
// e calcula a média + quantidade de avaliações de cada um.
export async function attachRatings(products) {
  if (!products.length) return products
  const ids = products.map((p) => p.id)
  const { data: reviews, error } = await supabase.from('reviews').select('product_id, rating').in('product_id', ids)
  if (error || !reviews) return products

  const byProduct = {}
  for (const r of reviews) {
    if (!byProduct[r.product_id]) byProduct[r.product_id] = []
    byProduct[r.product_id].push(r.rating)
  }

  return products.map((p) => {
    const ratings = byProduct[p.id]
    if (!ratings?.length) return p
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
    return { ...p, avg_rating: avg, review_count: ratings.length }
  })
}
