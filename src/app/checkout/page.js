'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { formatBRL } from '../../lib/format'
import { ESTADOS_BR } from '../../lib/estadosBR'

const PAYMENT_METHODS = [
  {
    id: 'mercado_pago',
    label: 'Cartão, Pix ou boleto',
    description: 'Pagamento automático via Mercado Pago. Aprovação na hora.',
  },
  {
    id: 'pix_manual',
    label: 'Pix direto (sem taxas)',
    description: 'Você paga na chave Pix e envia o comprovante pelo WhatsApp.',
  },
  {
    id: 'whatsapp',
    label: 'Fechar pelo WhatsApp',
    description: 'Enviamos seu pedido e combinamos os detalhes por lá.',
  },
]

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [method, setMethod] = useState('mercado_pago')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({
    nome: '',
    email: user?.email || '',
    telefone: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    observacoes: '',
  })

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const isFormValid =
    form.nome && form.email && form.telefone && form.cep && form.rua &&
    form.numero && form.bairro && form.cidade && form.estado

  if (items.length === 0) {
    return (
      <div className="max-w-container mx-auto px-4 md:px-8 py-24 text-center">
        <h1 className="font-display text-3xl text-ink mb-4">Seu carrinho está vazio</h1>
        <Link href="/loja" className="btn-primary inline-flex">Ir para a loja</Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid || loading) return
    setLoading(true)
    setErrorMsg('')

    const payload = {
      customer: {
        user_id: user?.id || null,
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        endereco: {
          cep: form.cep,
          rua: form.rua,
          numero: form.numero,
          complemento: form.complemento,
          bairro: form.bairro,
          cidade: form.cidade,
          estado: form.estado,
        },
        observacoes: form.observacoes,
      },
      items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    }

    try {
      const res = await fetch(`/api/checkout/${method === 'mercado_pago' ? 'mercadopago' : method === 'pix_manual' ? 'pix' : 'whatsapp'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Não foi possível processar seu pedido. Tente novamente.')
        setLoading(false)
        return
      }

      sessionStorage.setItem('dos-states:last-order', JSON.stringify({ method, ...data }))
      clear()

      if (method === 'mercado_pago' && data.init_point) {
        window.location.href = data.init_point
        return
      }

      if (method === 'whatsapp' && data.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank', 'noopener,noreferrer')
      }

      router.push('/checkout/sucesso')
    } catch (err) {
      console.error(err)
      setErrorMsg('Erro de conexão. Verifique sua internet e tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-container mx-auto px-4 md:px-8 py-16">
      <p className="tracking-code mb-2">DECLARAÇÃO DE ENTREGA</p>
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-10">Finalizar compra</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 flex flex-col gap-10">
          <section>
            <h2 className="font-semibold text-lg mb-4">Seus dados</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label-field">Nome completo</label>
                <input required className="input-field" value={form.nome} onChange={update('nome')} />
              </div>
              <div>
                <label className="label-field">E-mail</label>
                <input required type="email" className="input-field" value={form.email} onChange={update('email')} />
              </div>
              <div>
                <label className="label-field">WhatsApp / telefone</label>
                <input required className="input-field" placeholder="(21) 99999-9999" value={form.telefone} onChange={update('telefone')} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-4">Endereço de entrega</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">CEP</label>
                <input required className="input-field" value={form.cep} onChange={update('cep')} />
              </div>
              <div>
                <label className="label-field">Cidade</label>
                <input required className="input-field" value={form.cidade} onChange={update('cidade')} />
              </div>
              <div className="sm:col-span-2">
                <label className="label-field">Rua</label>
                <input required className="input-field" value={form.rua} onChange={update('rua')} />
              </div>
              <div>
                <label className="label-field">Número</label>
                <input required className="input-field" value={form.numero} onChange={update('numero')} />
              </div>
              <div>
                <label className="label-field">Complemento</label>
                <input className="input-field" value={form.complemento} onChange={update('complemento')} />
              </div>
              <div>
                <label className="label-field">Bairro</label>
                <input required className="input-field" value={form.bairro} onChange={update('bairro')} />
              </div>
              <div>
                <label className="label-field">Estado</label>
                <select required className="input-field" value={form.estado} onChange={update('estado')}>
                  <option value="">Selecione</option>
                  {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label-field">Observações (opcional)</label>
                <input className="input-field" value={form.observacoes} onChange={update('observacoes')} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-4">Forma de pagamento</h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-start gap-3 border rounded-sm p-4 cursor-pointer transition-colors ${method === pm.id ? 'border-ink bg-paperDim' : 'border-line hover:border-ink/40'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1 accent-stamp"
                    checked={method === pm.id}
                    onChange={() => setMethod(pm.id)}
                  />
                  <div>
                    <p className="font-semibold text-sm">{pm.label}</p>
                    <p className="text-muted text-xs mt-0.5">{pm.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="border border-line rounded-sm p-6 h-fit flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Resumo</h2>
          {items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm text-muted">
              <span className="truncate pr-2">{i.qty}× {i.name}</span>
              <span className="font-mono shrink-0">{formatBRL(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="flight-divider" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="font-mono">{formatBRL(total)}</span>
          </div>

          {errorMsg && <p className="text-stamp text-sm">{errorMsg}</p>}

          <button type="submit" disabled={!isFormValid || loading} className="btn-primary w-full mt-2">
            {loading ? 'Processando…' : 'Confirmar pedido'}
          </button>
        </div>
      </form>
    </div>
  )
}
