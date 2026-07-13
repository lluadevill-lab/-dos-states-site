'use client'

import { useState } from 'react'
import { Search, ShieldCheck, Headset } from 'lucide-react'
import { whatsappLink } from '../../lib/whatsapp'

export default function EncomendasPage() {
  const [nome, setNome] = useState('')
  const [contato, setContato] = useState('')
  const [produto, setProduto] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const message =
      `Olá! Quero fazer uma encomenda pela Dos States.\n` +
      `Nome: ${nome}\nContato: ${contato}\n` +
      `Produto desejado: ${produto}\n` +
      (observacoes ? `Observações: ${observacoes}\n` : '')
    window.open(whatsappLink(message), '_blank')
  }

  return (
    <div className="max-w-container mx-auto px-4 md:px-8 py-16">
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">Encomendas</h1>
      <p className="text-muted max-w-[560px] mb-12">
        Não achou o que queria na loja? Conta pra gente o que você está procurando nos EUA
        e nós compramos e enviamos até você.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
        <div className="flex flex-col gap-3">
          <Search className="text-stamp" size={28} strokeWidth={1.75} />
          <h3 className="font-semibold text-lg">Busca de produtos</h3>
          <p className="text-muted text-sm leading-relaxed">
            Compramos os produtos que você escolher e enviamos dos EUA para o Brasil.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:border-l md:pl-10 border-line">
          <ShieldCheck className="text-stamp" size={28} strokeWidth={1.75} />
          <h3 className="font-semibold text-lg">Segurança total</h3>
          <p className="text-muted text-sm leading-relaxed">
            Você acompanha cada passo da sua carga pelo nosso sistema de rastreio.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:border-l md:pl-10 border-line">
          <Headset className="text-stamp" size={28} strokeWidth={1.75} />
          <h3 className="font-semibold text-lg">Atendimento VIP</h3>
          <p className="text-muted text-sm leading-relaxed">
            Dúvidas? Nossa equipe no Brasil e nos EUA responde rápido pelo WhatsApp.
          </p>
        </div>
      </div>

      <div className="max-w-xl border border-line rounded-sm p-6 md:p-8">
        <h2 className="font-display text-2xl text-ink mb-2">Fazer uma encomenda</h2>
        <p className="text-muted text-sm mb-6">
          Preencha os dados abaixo — vamos te chamar no WhatsApp pra confirmar preço e prazo.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label-field">Nome</label>
            <input required className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <label className="label-field">WhatsApp / e-mail</label>
            <input required className="input-field" placeholder="(21) 99999-9999" value={contato} onChange={(e) => setContato(e.target.value)} />
          </div>
          <div>
            <label className="label-field">O que você quer encomendar?</label>
            <textarea
              required
              className="input-field"
              rows={3}
              placeholder="Nome do produto, link da loja americana, tamanho, cor etc."
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Observações (opcional)</label>
            <textarea className="input-field" rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">Enviar pelo WhatsApp</button>
        </form>
      </div>
    </div>
  )
}
