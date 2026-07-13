'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    // O link do e-mail de recuperação cria uma sessão temporária (evento PASSWORD_RECOVERY).
    // Só liberamos o formulário depois que essa sessão existir.
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setReady(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) setReady(true)
    })
    return () => listener?.subscription?.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (senha.length < 6) return setErrorMsg('A senha precisa ter pelo menos 6 caracteres.')
    if (senha !== confirmar) return setErrorMsg('As senhas não conferem.')

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setLoading(false)
    if (error) return setErrorMsg('Não foi possível atualizar sua senha. Tente pedir um novo link.')
    setDone(true)
    setTimeout(() => router.push('/conta'), 2000)
  }

  if (!ready) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-muted">Abra esta página a partir do link que enviamos no seu e-mail.</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-3">Senha atualizada!</h1>
        <p className="text-muted">Redirecionando para sua conta…</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <p className="tracking-code mb-2 text-center">RECUPERAÇÃO DE SENHA</p>
      <h1 className="font-display text-3xl text-ink mb-8 text-center">Criar nova senha</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="label-field">Nova senha</label>
          <input required type="password" minLength={6} className="input-field" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
        <div>
          <label className="label-field">Confirmar nova senha</label>
          <input required type="password" minLength={6} className="input-field" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
        </div>
        {errorMsg && <p className="text-stamp text-sm">{errorMsg}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  )
}
