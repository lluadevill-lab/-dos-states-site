'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../../../lib/supabase'
import { formatBRL } from '../../../lib/format'

const PAID_STATUSES = ['pago', 'enviado', 'entregue']

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [goal, setGoal] = useState(0)
  const [goalInput, setGoalInput] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const headers = { Authorization: `Bearer ${session?.access_token}` }
    const [ordersRes, settingsRes] = await Promise.all([
      fetch('/api/admin/orders', { headers }),
      fetch('/api/admin/settings', { headers }),
    ])
    const ordersData = await ordersRes.json()
    const settingsData = await settingsRes.json()
    setOrders(ordersData.orders || [])
    setGoal(Number(settingsData.settings?.monthly_goal) || 0)
    setGoalInput(String(settingsData.settings?.monthly_goal ?? ''))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveGoal = async () => {
    setSavingGoal(true)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ monthly_goal: Number(goalInput) || 0 }),
    })
    setSavingGoal(false)
    load()
  }

  const stats = useMemo(() => {
    const now = new Date()
    const paidOrders = orders.filter((o) => PAID_STATUSES.includes(o.status))
    const monthOrders = paidOrders.filter((o) => {
      const d = new Date(o.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    const monthTotal = monthOrders.reduce((acc, o) => acc + Number(o.total), 0)
    const allTimeTotal = paidOrders.reduce((acc, o) => acc + Number(o.total), 0)

    const byDay = {}
    for (const o of monthOrders) {
      const day = new Date(o.created_at).getDate()
      byDay[day] = (byDay[day] || 0) + Number(o.total)
    }
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const chartData = Array.from({ length: daysInMonth }, (_, i) => ({
      dia: i + 1,
      total: byDay[i + 1] || 0,
    }))

    const productTotals = {}
    for (const o of paidOrders) {
      for (const it of o.order_items || []) {
        productTotals[it.product_name] = (productTotals[it.product_name] || 0) + it.quantity
      }
    }
    const topProducts = Object.entries(productTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return { monthTotal, allTimeTotal, monthOrdersCount: monthOrders.length, chartData, topProducts }
  }, [orders])

  if (loading) return <p className="text-muted">Carregando dashboard…</p>

  const progressPct = goal > 0 ? Math.min((stats.monthTotal / goal) * 100, 100) : 0

  return (
    <div className="flex flex-col gap-8">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="border border-line rounded-sm p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Faturamento no mês</p>
          <p className="font-mono text-2xl font-semibold">{formatBRL(stats.monthTotal)}</p>
        </div>
        <div className="border border-line rounded-sm p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Pedidos pagos no mês</p>
          <p className="font-mono text-2xl font-semibold">{stats.monthOrdersCount}</p>
        </div>
        <div className="border border-line rounded-sm p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Faturamento total</p>
          <p className="font-mono text-2xl font-semibold">{formatBRL(stats.allTimeTotal)}</p>
        </div>
      </div>

      <div className="border border-line rounded-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted uppercase tracking-wide">Meta do mês</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              className="input-field h-8 w-32 py-0 text-xs"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
            />
            <button onClick={saveGoal} disabled={savingGoal} className="btn-outline text-xs">
              {savingGoal ? 'Salvando…' : 'Salvar meta'}
            </button>
          </div>
        </div>
        {goal > 0 ? (
          <>
            <div className="h-3 bg-paperDim rounded-full overflow-hidden">
              <div className="h-full bg-stamp transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-muted mt-1">
              {formatBRL(stats.monthTotal)} de {formatBRL(goal)} ({progressPct.toFixed(0)}%)
            </p>
          </>
        ) : (
          <p className="text-xs text-muted">Defina uma meta mensal pra acompanhar o progresso aqui.</p>
        )}
      </div>

      <div className="border border-line rounded-sm p-4">
        <p className="text-xs text-muted uppercase tracking-wide mb-4">Faturamento por dia (mês atual)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.chartData}>
            <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
            <Tooltip formatter={(v) => formatBRL(v)} labelFormatter={(d) => `Dia ${d}`} />
            <Bar dataKey="total" fill="#b3402b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-line rounded-sm p-4">
        <p className="text-xs text-muted uppercase tracking-wide mb-4">Produtos mais vendidos</p>
        {stats.topProducts.length === 0 ? (
          <p className="text-muted text-sm">Nenhuma venda registrada ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.topProducts.map(([name, qty]) => (
              <li key={name} className="flex justify-between text-sm">
                <span>{name}</span>
                <span className="font-mono font-semibold">{qty} un.</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
