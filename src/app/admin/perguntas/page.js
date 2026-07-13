'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminPerguntasPage() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [onlyPending, setOnlyPending] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/questions', {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    const data = await res.json()
    setQuestions(data.questions || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const answer = async (q) => {
    const text = drafts[q.id]
    if (!text?.trim()) return
    setSavingId(q.id)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/questions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ id: q.id, answer: text }),
    })
    setSavingId(null)
    if (res.ok) load()
    else alert('Não foi possível salvar a resposta.')
  }

  if (loading) return <p className="text-muted">Carregando perguntas…</p>

  const visible = onlyPending ? questions.filter((q) => !q.answer) : questions

  return (
    <div>
      <label className="flex items-center gap-2 text-sm mb-6 cursor-pointer w-fit">
        <input type="checkbox" checked={onlyPending} onChange={(e) => setOnlyPending(e.target.checked)} />
        Mostrar só perguntas sem resposta
      </label>

      {visible.length === 0 ? (
        <div className="border border-dashed border-line rounded-sm p-12 text-center text-muted">
          Nenhuma pergunta por aqui.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((q) => (
            <div key={q.id} className="border border-line rounded-sm p-4">
              <p className="text-xs text-muted mb-1">
                {q.products?.name || 'Produto removido'} · {new Date(q.created_at).toLocaleString('pt-BR')}
              </p>
              <p className="font-semibold mb-3">{q.question}</p>

              {q.answer ? (
                <div className="bg-paperDim border border-line rounded-sm p-3 text-sm">
                  <span className="font-semibold uppercase tracking-wide text-[10px] block mb-1">Sua resposta</span>
                  {q.answer}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="input-field w-full text-sm"
                    rows={2}
                    placeholder="Escreva a resposta…"
                    value={drafts[q.id] ?? ''}
                    onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                  />
                  <button
                    disabled={savingId === q.id}
                    onClick={() => answer(q)}
                    className="btn-primary text-xs w-fit"
                  >
                    {savingId === q.id ? 'Salvando…' : 'Responder'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
