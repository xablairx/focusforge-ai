'use client'
import { useState, useEffect } from 'react'
import type { RevenueEntry } from '@/types'

export default function RevenuePage() {
  const [entries, setEntries] = useState<RevenueEntry[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/revenue').then(r => r.json()).then(setEntries)
  }, [])

  const total = entries.reduce((sum, e) => sum + Number(e.amount), 0)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return
    setLoading(true)
    setError(null)
    const res = await fetch('/api/revenue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), description }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setEntries(prev => [data, ...prev])
    setAmount('')
    setDescription('')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="px-4 pt-6 pb-5 border-b border-[#1a1a1a]">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-1">This Month</p>
        <p className="text-4xl font-black text-[#22c55e] tabular-nums leading-none">${total.toFixed(2)}</p>
        <p className="text-[#525252] text-xs mt-1">revenue logged</p>
      </div>

      <form onSubmit={handleAdd} className="px-4 py-5 border-b border-[#1a1a1a] space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252]">Log Revenue</p>
        <input
          type="number"
          placeholder="Amount ($)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          className="w-full bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#22c55e]"
        />
        <input
          type="text"
          placeholder="What was this for? (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#22c55e]"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={!amount || loading}
          className="w-full bg-[#22c55e] text-white font-black uppercase tracking-widest py-3.5 rounded-xl text-sm disabled:opacity-30"
        >
          {loading ? 'Logging...' : '+ Log Revenue'}
        </button>
      </form>

      <div className="px-4 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-3">Entries</p>
        {entries.length === 0 ? (
          <p className="text-[#525252] text-sm text-center py-8">No revenue logged yet.</p>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between py-3.5 border-b border-[#1a1a1a]">
              <div>
                <p className="text-sm font-semibold text-white">{entry.description || 'Revenue'}</p>
                <p className="text-[10px] text-[#525252] mt-0.5 tabular-nums">{entry.entry_date}</p>
              </div>
              <p className="text-base font-black text-[#22c55e] tabular-nums">+${Number(entry.amount).toFixed(2)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
