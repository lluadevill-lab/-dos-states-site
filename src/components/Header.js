'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, User, Menu, X, Shield } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useIsAdmin } from '../lib/useIsAdmin'

const NAV_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/loja', label: 'Loja' },
  { href: '/como-funciona', label: 'Como funciona' },
  { href: '/conta', label: 'Minha conta' },
]

export default function Header() {
  const { count } = useCart()
  const { isAdmin } = useIsAdmin()
  const [open, setOpen] = useState(false)

  return (
    <header className="w-full bg-paper/95 backdrop-blur border-b border-line sticky top-0 z-50">
      <div className="max-w-container mx-auto h-20 px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <span className="font-display text-2xl md:text-3xl tracking-wide text-ink">
            DOS STATES<span className="text-stamp">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="navBarItem">
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="navBarItem flex items-center gap-1 text-stamp">
              <Shield size={15} /> Painel admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/conta" className="hidden sm:flex text-ink hover:text-stamp transition-colors" aria-label="Minha conta">
            <User size={22} strokeWidth={1.75} />
          </Link>
          <Link href="/carrinho" className="relative flex text-ink hover:text-stamp transition-colors" aria-label="Carrinho">
            <ShoppingBag size={22} strokeWidth={1.75} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-stamp text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            className="md:hidden text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-line bg-paper flex flex-col px-4 py-4 gap-4">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="navBarItem" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="navBarItem flex items-center gap-1 text-stamp" onClick={() => setOpen(false)}>
              <Shield size={15} /> Painel admin
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
