'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'

export default function ProductQuestions({ productId }) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const load = () => {
    fetch(`/api/questions?product_id=${productId}`)
      .then((r) => r.json())
      .then((data) => setQuestions(data.questions || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [productId])

  const submit = async (e) => {
    e.preventDefault()
    if (!newQuestion.trim()) return
    setSending(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ product_id: productId, question: newQuestion }),
    })
    setSending(false)
    if (res.ok) {
      setNewQuestion('')
      setSent(true)
    }
  }

  return (
    <div className="mt-10">
      <h4 className="font-semibold mb-3">Perguntas e respostas</h4>

      {loading ? (
        <p className="text-muted text-sm">Carregando…</p>
      ) : questions.length === 0 ? (
        <p className="text-muted italic text-sm mb-4">Nenhuma pergunta ainda sobre este produto.</p>
      ) : (
        <ul className="flex flex-col gap-3 mb-6">
          {questions.map((q) => (
            <li key={q.id} className="border border-line rounded-sm p-3 text-sm">
              <p className="font-semibold">P: {q.question}</p>
              <p className="text-muted mt-1">R: {q.answer}</p>
            </li>
          ))}
        </ul>
      )}

      {!user ? (
        <p className="text-sm text-muted">
          <Link href="/login" className="text-stamp font-semibold">Entre na sua conta</Link> pra perguntar algo sobre este produto.
        </p>
      ) : sent ? (
        <p className="text-sm text-teal">Pergunta enviada! Assim que respondermos, ela aparece aqui.</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <input
            className="input-field flex-1"
            placeholder="Tem alguma dúvida sobre este produto?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
          <button disabled={sending} className="btn-outline text-sm whitespace-nowrap">
            {sending ? 'Enviando…' : 'Perguntar'}
          </button>
        </form>
      )}
    </div>
  )
}
