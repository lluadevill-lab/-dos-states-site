import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-ink text-paper/80 mt-24">
      <div className="max-w-container mx-auto px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <span className="font-display text-2xl text-white tracking-wide">
            DOS STATES<span className="text-stamp">.</span>
          </span>
          <p className="text-sm text-paper/60 max-w-sm mt-4 leading-relaxed">
            Compramos, consolidamos e despachamos produtos originais dos Estados Unidos
            direto para a sua porta no Brasil.
          </p>
          <p className="tracking-code text-paper/40 mt-6">ROTA EUA → BR</p>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-wider text-paper/50 mb-4">Menu</h4>
          <ul className="text-sm text-paper/70 flex flex-col gap-2">
            <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
            <li><Link href="/loja" className="hover:text-white transition-colors">Loja</Link></li>
            <li><Link href="/conta" className="hover:text-white transition-colors">Minha conta</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-wider text-paper/50 mb-4">Suporte</h4>
          <ul className="text-sm text-paper/70 flex flex-col gap-2">
            <li>WhatsApp</li>
            <li>E-mail</li>
            <li>Rastreio de pedido</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-paper/40 font-mono">
        © {new Date().getFullYear()} Dos States — Importação sem fronteira
      </div>
    </footer>
  )
}
