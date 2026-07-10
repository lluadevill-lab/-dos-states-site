import { notFound } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { formatBRL } from '../../../lib/format'
import AddToCartPanel from './AddToCartPanel'

export const revalidate = 60

async function getProduct(slug) {
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single()
  if (error || !data) return null
  return data
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Produto não encontrado — Dos States' }
  return {
    title: `${product.name} — Dos States`,
    description: product.description || undefined,
  }
}

export default async function ProdutoPage({ params }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  return (
    <div className="max-w-container mx-auto px-4 md:px-8 py-16 grid md:grid-cols-2 gap-12 md:gap-20">
      <div className="aspect-square bg-paperDim flex items-center justify-center rounded-sm overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display text-5xl text-ink/10">DOS STATES</span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {product.code && <span className="tracking-code">{product.code}</span>}
        {product.badge && <span className="stamp-badge w-fit">{product.badge}</span>}
        <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight">{product.name}</h1>
        {product.brand && <p className="text-muted">{product.brand}</p>}
        <p className="font-mono text-2xl font-semibold text-stamp">{formatBRL(product.price)}</p>

        <div className="border-y border-line py-6 text-muted leading-relaxed">
          {product.description ||
            'Este produto é 100% original, adquirido diretamente em revendedores oficiais nos Estados Unidos.'}
        </div>

        <AddToCartPanel product={product} />

        <div className="mt-6">
          <h4 className="font-semibold mb-2">Avaliações</h4>
          <p className="text-muted italic text-sm">Nenhuma avaliação para este produto ainda.</p>
        </div>
      </div>
    </div>
  )
}
