'use client'
import { useState } from 'react'
import type { Idea } from '@/types'

export default function IdeaForm({ onAdd }: { onAdd: (idea: Idea) => void }) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }

    setTitle('')
    setLoading(false)
    onAdd(data)
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4 border-b border-[#1a1a1a]">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Describe your idea..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="flex-1 bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#f97316]"
        />
        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="bg-[#f97316] text-white font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg disabled:opacity-30 whitespace-nowrap"
        >
          {loading ? '...' : 'Jail It'}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </form>
  )
}
