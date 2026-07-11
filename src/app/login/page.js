'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login') // 'login' | 'cadastro' | 'esqueci'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [infoMsg, setInfoMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setInfoMsg('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      setLoading(false)
      if (error) return setErrorMsg('E-mail ou senha incorretos.')
      router.push('/conta')
      return
    }

    if (mode === 'esqueci') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })
      setLoading(false)
      if (error) return setErrorMsg('Não foi possível enviar o e-mail de recuperação.')
      setInfoMsg('Enviamos um link pro seu e-mail. Abra ele para criar uma senha nova.')
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    })
    setLoading(false)
    if (error) return setErrorMsg(error.message === 'User already registered' ? 'Este e-mail já tem cadastro.' : 'Não foi possível criar sua conta.')
    setInfoMsg('Cadastro criado! Verifique seu e-mail para confirmar a conta antes de entrar.')
  }

  const titles = { login: 'Entrar', cadastro: 'Criar conta', esqueci: 'Recuperar senha' }
  const tracking = { login: 'ACESSO DO CLIENTE', cadastro: 'NOVO CADASTRO', esqueci: 'RECUPERAÇÃO DE SENHA' }

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <p className="tracking-code mb-2 text-center">{tracking[mode]}</p>
      <h1 className="font-display text-3xl text-ink mb-8 text-center">{titles[mode]}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'cadastro' && (
          <div>
            <label className="label-field">Nome</label>
            <input required className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
        )}
        <div>
          <label className="label-field">E-mail</label>
          <input required type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {mode !== 'esqueci' && (
          <div>
            <label className="label-field">Senha</label>
            <input required type="password" minLength={6} className="input-field" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
        )}

        {mode === 'login' && (
          <button
            type="button"
            onClick={() => { setMode('esqueci'); setErrorMsg(''); setInfoMsg('') }}
            className="text-xs text-muted hover:text-ink text-right underline underline-offset-4 -mt-2"
          >
            Esqueci minha senha
          </button>
        )}

        {errorMsg && <p className="text-stamp text-sm">{errorMsg}</p>}
        {infoMsg && <p className="text-teal text-sm">{infoMsg}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : mode === 'esqueci' ? 'Enviar link de recuperação' : 'Criar conta'}
        </button>
      </form>

      {mode === 'esqueci' ? (
        <button
          onClick={() => { setMode('login'); setErrorMsg(''); setInfoMsg('') }}
          className="w-full text-center text-sm text-muted hover:text-ink mt-6 underline underline-offset-4"
        >
          Voltar para o login
        </button>
      ) : (
        <button
          onClick={() => { setMode(mode === 'login' ? 'cadastro' : 'login'); setErrorMsg(''); setInfoMsg('') }}
          className="w-full text-center text-sm text-muted hover:text-ink mt-6 underline underline-offset-4"
        >
          {mode === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
        </button>
      )}
    </div>
  )
}
