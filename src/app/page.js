import Link from 'next/link'
import { Package, ShieldCheck, Headset } from 'lucide-react'
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
              Novas chegadas<br /> de Miami.
            </h1>
            <p className="text-base text-muted max-w-[420px]">
              Sua ponte direta com as melhores lojas dos EUA. Compramos, conferimos e
              despachamos com originalidade e segurança garantidas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/loja" className="btn-primary">Ver loja</Link>
              <Link href="/#como-funciona" className="btn-outline">Como funciona</Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="w-full aspect-square max-w-sm bg-white border border-line rounded-sm flex items-center justify-center">
              <span className="font-display text-4xl text-ink/10 -rotate-3">DOS STATES</span>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="max-w-container mx-auto px-4 md:px-8 py-20 scroll-mt-20">
        <p className="tracking-code mb-2">MANIFESTO DE ENVIO</p>
        <h2 className="font-display text-3xl md:text-4xl text-ink mb-12">Como funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-3">
            <Package className="text-stamp" size={28} strokeWidth={1.75} />
            <h3 className="font-semibold text-lg">Logística reversa</h3>
            <p className="text-muted text-sm leading-relaxed">
              Compramos e consolidamos tudo em Miami para você economizar no frete.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:border-l md:pl-10 border-line">
            <ShieldCheck className="text-stamp" size={28} strokeWidth={1.75} />
            <h3 className="font-semibold text-lg">Segurança total</h3>
            <p className="text-muted text-sm leading-relaxed">
              Você acompanha cada passo da sua carga pelo nosso sistema de rastreio.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:border-l md:pl-10 border-line">
            <Headset className="text-stamp" size={28} strokeWidth={1.75} />
            <h3 className="font-semibold text-lg">Atendimento VIP</h3>
            <p className="text-muted text-sm leading-relaxed">
              Dúvidas? Nossa equipe no Brasil e nos EUA responde rápido pelo WhatsApp.
            </p>
          </div>
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
