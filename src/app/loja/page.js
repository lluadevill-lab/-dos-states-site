import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { attachRatings } from '../../lib/ratings'
import ProductCard from '../../components/ProductCard'

export const revalidate = 60

async function getProducts(categoria) {
  let query = supabase.from('products').select('*').order('created_at', { ascending: false })
  if (categoria) query = query.eq('category', categoria)

  const { data, error } = await query
  if (error) {
    console.error('Erro ao buscar produtos:', error.message)
    return []
  }
  return attachRatings(data || [])
}

async function getCategorias() {
  const { data, error } = await supabase.from('products').select('category')
  if (error || !data) return []
  return [...new Set(data.map((p) => p.category).filter(Boolean))]
}

export default async function LojaPage({ searchParams }) {
  const categoria = searchParams?.categoria || ''
  const [products, categorias] = await Promise.all([getProducts(categoria), getCategorias()])

  return (
    <div className="max-w-container mx-auto px-4 md:px-8 py-16">
      <p className="tracking-code mb-2">CATÁLOGO COMPLETO</p>
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-10">Loja</h1>

      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/loja"
            className={`px-4 h-9 flex items-center border rounded-full text-sm ${!categoria ? 'bg-ink text-white border-ink' : 'border-line text-muted hover:border-ink'}`}
          >
            Todos
          </Link>
          {categorias.map((cat) => (
            <Link
              key={cat}
              href={`/loja?categoria=${encodeURIComponent(cat)}`}
              className={`px-4 h-9 flex items-center border rounded-full text-sm capitalize ${categoria === cat ? 'bg-ink text-white border-ink' : 'border-line text-muted hover:border-ink'}`}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
          Nenhum produto encontrado{categoria ? ` na categoria "${categoria}"` : ''}.
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
