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
    <form onSubmit={handleSubmit} className="bg-gray-50 border-b border-gray-100 px-4 py-3">
      <input
        type="text"
        placeholder="Describe your idea..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-[#f97316]"
      />
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="bg-black text-white font-black text-xs uppercase tracking-wide px-4 py-2 rounded-lg disabled:opacity-40"
        >
          {loading ? 'Scoring...' : 'Lock It Up →'}
        </button>
      </div>
    </form>
  )
}
