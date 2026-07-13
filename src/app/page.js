import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { attachRatings } from '../lib/ratings'
import ProductCard from '../components/ProductCard'
import FlightPath from '../components/FlightPath'

export const revalidate = 60

async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4)

  if (error) {
    console.error('Erro ao buscar produtos em destaque:', error.message)
    return []
  }
  return attachRatings(data || [])
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="w-full bg-paperDim border-b border-line">
        <div className="max-w-container mx-auto px-4 md:px-8 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <FlightPath />
            <h1 className="font-display text-5xl md:text-7xl leading-[0.95] text-ink">
              Novas chegadas<br /> dos EUA.
            </h1>
            <p className="text-base text-muted max-w-[420px]">
              Sua ponte direta com as melhores lojas dos EUA. Compramos, conferimos e
              despachamos com originalidade e segurança garantidas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/loja" className="btn-primary">Ver loja</Link>
              <Link href="/encomendas" className="btn-outline">Encomendas</Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="w-full aspect-square max-w-sm bg-white border border-line rounded-sm flex items-center justify-center">
              <span className="font-display text-4xl text-ink/10 -rotate-3">DOS STATES</span>
            </div>
          </div>
        </div>
      </section>

      {/* Encomendas (teaser) */}
      <section className="max-w-container mx-auto px-4 md:px-8 py-20 scroll-mt-20">
        <div className="border border-line rounded-sm p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-paperDim">
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-ink mb-2">Não achou o que queria na loja?</h2>
            <p className="text-muted text-sm max-w-[420px]">
              A gente busca e envia qualquer produto dos EUA pra você. Veja como fazer uma encomenda.
            </p>
          </div>
          <Link href="/encomendas" className="btn-primary shrink-0">Encomendas</Link>
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="max-w-container mx-auto px-4 md:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-display text-3xl md:text-4xl text-ink">Recém-chegados</h2>
          <Link href="/loja" className="navBarItem">Ver tudo</Link>
        </div>

        {products.length === 0 ? (
          <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
            Nenhum produto cadastrado ainda. Adicione produtos na tabela{' '}
            <code className="font-mono text-ink">products</code> do Supabase para eles aparecerem aqui.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
