'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { useIsAdmin } from '../../lib/useIsAdmin'

const TABS = [
  { href: '/admin/produtos', label: 'Produtos' },
  { href: '/admin/pedidos', label: 'Pedidos' },
]

export default function AdminLayout({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const pathname = usePathname()

  if (authLoading || adminLoading) {
    return (
      <div className="max-w-container mx-auto px-4 py-24 text-center text-muted">Carregando…</div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-container mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-4">Acesso restrito</h1>
        <p className="text-muted mb-8">Esta área é só para a equipe da Dos States.</p>
        <Link href="/" className="btn-outline inline-flex">Voltar para o site</Link>
      </div>
    )
  }

  return (
    <div className="max-w-container mx-auto px-4 md:px-8 py-12">
      <p className="tracking-code mb-2">PAINEL INTERNO</p>
      <h1 className="font-display text-3xl text-ink mb-8">Administração</h1>

      <nav className="flex gap-6 border-b border-line mb-10">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-3 text-sm font-semibold uppercase tracking-wide -mb-px border-b-2 transition-colors ${
              pathname?.startsWith(tab.href) ? 'text-stamp border-stamp' : 'text-muted border-transparent hover:text-ink'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  )
}
