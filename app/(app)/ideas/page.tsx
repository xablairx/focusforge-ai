'use client'
import { useState, useEffect } from 'react'
import IdeaForm from '@/components/ideas/IdeaForm'
import IdeaCard from '@/components/ideas/IdeaCard'
import type { Idea } from '@/types'

type Filter = 'active' | 'past'

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [filter, setFilter] = useState<Filter>('active')
  const [loading, setLoading] = useState(true)

  async function fetchIdeas(f: Filter) {
    setLoading(true)
    const res = await fetch(`/api/ideas?mission=${f}`)
    if (res.ok) setIdeas(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchIdeas(filter) }, [filter])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="px-4 pt-6 pb-5 border-b border-[#1a1a1a]">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-1">Idea Jail</p>
        <h1 className="text-2xl font-black text-white">Lock up distractions</h1>
        <p className="text-sm text-[#525252] mt-1">{ideas.length} ideas jailed · reviewed Sundays</p>
      </div>

      <IdeaForm onAdd={idea => setIdeas(prev => [idea, ...prev])} />

      <div className="flex border-b border-[#1a1a1a]">
        {(['active', 'past'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
              filter === f ? 'text-[#f97316] border-b-2 border-[#f97316]' : 'text-[#525252]'
            }`}
          >
            {f === 'active' ? 'This Mission' : 'Past Missions'}
          </button>
        ))}
      </div>

      <div className="px-4">
        {loading ? (
          <p className="text-[#525252] text-sm text-center py-10">Loading...</p>
        ) : ideas.length === 0 ? (
          <p className="text-[#525252] text-sm text-center py-10">No ideas jailed yet.</p>
        ) : (
          ideas.map(idea => <IdeaCard key={idea.id} idea={idea} />)
        )}
      </div>
    </div>
  )
}
