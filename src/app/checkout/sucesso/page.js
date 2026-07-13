'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, XCircle, MessageCircle } from 'lucide-react'
import { formatBRL } from '../../../lib/format'

export default function CheckoutSucessoPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSucessoContent />
    </Suspense>
  )
}

function CheckoutSucessoContent() {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState(null)

  const mpStatus = searchParams.get('status') || searchParams.get('collection_status')
  const mpOrderId = searchParams.get('external_reference')

  useEffect(() => {
    if (!mpStatus) {
      try {
        const raw = sessionStorage.getItem('dos-states:last-order')
        if (raw) setOrder(JSON.parse(raw))
      } catch (e) {
        console.warn(e)
      }
    }
  }, [mpStatus])

  // --- Retorno do Mercado Pago ---
  if (mpStatus) {
    const isApproved = mpStatus === 'approved'
    const isPending = mpStatus === 'pending' || mpStatus === 'in_process'

    return (
      <div className="max-w-container mx-auto px-4 md:px-8 py-24 text-center flex flex-col items-center gap-4">
        {isApproved && <CheckCircle2 className="text-teal" size={56} strokeWidth={1.5} />}
        {isPending && <Clock className="text-gold" size={56} strokeWidth={1.5} />}
        {!isApproved && !isPending && <XCircle className="text-stamp" size={56} strokeWidth={1.5} />}

        <h1 className="font-display text-3xl text-ink">
          {isApproved && 'Pagamento aprovado!'}
          {isPending && 'Pagamento em análise'}
          {!isApproved && !isPending && 'Pagamento não concluído'}
        </h1>
        <p className="text-muted max-w-md">
          {isApproved && 'Recebemos seu pagamento e já vamos começar a preparar sua carga.'}
          {isPending && 'Assim que o Mercado Pago confirmar, avisamos você por e-mail e WhatsApp.'}
          {!isApproved && !isPending && 'Algo deu errado na cobrança. Você pode tentar novamente a partir do carrinho.'}
        </p>
        {mpOrderId && <p className="tracking-code">Pedido {mpOrderId.slice(0, 8).toUpperCase()}</p>}
        <Link href="/loja" className="btn-outline mt-4">Voltar para a loja</Link>
      </div>
    )
  }

  // --- Pix manual ou WhatsApp ---
  if (order) {
    return (
      <div className="max-w-container mx-auto px-4 md:px-8 py-24 text-center flex flex-col items-center gap-4">
        <CheckCircle2 className="text-teal" size={56} strokeWidth={1.5} />
        <h1 className="font-display text-3xl text-ink">Pedido registrado!</h1>
        {order.display_code && <p className="tracking-code">{order.display_code}</p>}

        {order.method === 'pix_manual' && (
          <div className="border border-line rounded-sm p-6 max-w-md w-full text-left mt-4 flex flex-col gap-3">
            <p className="text-sm text-muted">Pague via Pix na chave abaixo e depois envie o comprovante pelo WhatsApp:</p>
            <p className="font-mono text-lg bg-paperDim rounded-sm px-4 py-3 break-all">{order.pix_key}</p>
            <p className="text-sm">Valor: <span className="font-mono font-semibold">{formatBRL(order.amount)}</span></p>
            {order.whatsapp_url && (
              <a href={order.whatsapp_url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-2 inline-flex items-center gap-2 justify-center">
                <MessageCircle size={18} /> Enviar comprovante no WhatsApp
              </a>
            )}
          </div>
        )}

        {order.method === 'whatsapp' && (
          <div className="flex flex-col items-center gap-3 mt-4">
            <p className="text-muted max-w-md">Continue a conversa no WhatsApp para combinar os últimos detalhes do seu pedido.</p>
            {order.whatsapp_url && (
              <a href={order.whatsapp_url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2 justify-center">
                <MessageCircle size={18} /> Abrir WhatsApp
              </a>
            )}
          </div>
        )}

        <Link href="/loja" className="btn-outline mt-4">Voltar para a loja</Link>
      </div>
    )
  }

  return (
    <div className="max-w-container mx-auto px-4 md:px-8 py-24 text-center">
      <h1 className="font-display text-3xl text-ink mb-4">Nenhum pedido recente encontrado</h1>
      <Link href="/loja" className="btn-primary inline-flex">Ir para a loja</Link>
    </div>
  )
}
