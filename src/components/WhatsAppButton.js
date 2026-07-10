'use client'

import { MessageCircle } from 'lucide-react'
import { whatsappLink } from '../lib/whatsapp'

export default function WhatsAppButton({ message = 'Olá! Vim pelo site da Dos States e tenho uma dúvida.' }) {
  const href = whatsappLink(message)

  if (!process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-teal hover:bg-tealDark text-white w-14 h-14 rounded-full flex items-center justify-center shadow-tag transition-colors"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={26} strokeWidth={1.75} />
    </a>
  )
}
