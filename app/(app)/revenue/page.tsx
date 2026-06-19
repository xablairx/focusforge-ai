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
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-green-500">
        <h1 className="text-2xl font-black text-white">Revenue 💰</h1>
        <div className="mt-2">
          <p className="text-gray-400 text-xs uppercase tracking-widest">This Month</p>
          <p className="text-4xl font-black text-green-400">${total.toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="px-4 pt-4 pb-2 border-b border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Log Revenue</p>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Amount ($)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f97316]"
          />
        </div>
        <input
          type="text"
          placeholder="What was this for? (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-[#f97316]"
        />
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        <button
          type="submit"
          disabled={!amount || loading}
          className="w-full bg-green-600 text-white font-black uppercase tracking-wide py-2.5 rounded-xl text-sm disabled:opacity-40"
        >
          {loading ? 'Logging...' : '+ Add Revenue'}
        </button>
      </form>

      <div className="px-4 pt-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">This Month&apos;s Entries</p>
        {entries.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No revenue logged yet. Every dollar starts here.</p>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-900">{entry.description || 'Revenue'}</p>
                <p className="text-[10px] text-gray-400">{entry.entry_date}</p>
              </div>
              <p className="text-base font-black text-green-600">+${Number(entry.amount).toFixed(2)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
