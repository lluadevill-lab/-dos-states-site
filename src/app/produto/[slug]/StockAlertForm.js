'use client'

import { useState } from 'react'

export default function StockAlertForm({ productId }) {
  const [contact, setContact] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!contact.trim()) return
    setSending(true)
    const res = await fetch('/api/stock-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, contact }),
    })
    setSending(false)
    if (res.ok) setSent(true)
  }

  if (sent) {
    return <p className="text-sm text-teal mt-3">Combinado! Avisamos você assim que chegar.</p>
  }

  return (
    <form onSubmit={submit} className="mt-3 flex gap-2">
      <input
        className="input-field text-sm flex-1"
        placeholder="Seu e-mail ou WhatsApp"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />
      <button disabled={sending} className="btn-outline text-sm whitespace-nowrap">
        {sending ? 'Enviando…' : 'Avise-me quando chegar'}
      </button>
    </form>
  )
}
