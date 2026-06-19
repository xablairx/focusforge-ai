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

  function handleAdd(idea: Idea) {
    setIdeas(prev => [idea, ...prev])
  }

  return (
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-[#059669]">
        <h1 className="text-2xl font-black text-white">Idea Jail 🔒</h1>
        <p className="text-gray-400 text-xs mt-1">Lock up ideas before they steal your focus.</p>
        <p className="text-gray-500 text-[10px] mt-1">{ideas.length} ideas locked · Review on Sundays</p>
      </div>

      <IdeaForm onAdd={handleAdd} />

      <div className="flex border-b border-gray-100">
        {(['active', 'past'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wide ${filter === f ? 'text-[#f97316] border-b-2 border-[#f97316]' : 'text-gray-400'}`}
          >
            {f === 'active' ? 'Current Mission' : 'Past Missions'}
          </button>
        ))}
      </div>

      <div className="px-4 pt-3">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
        ) : ideas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No ideas jailed yet. Submit one above.</p>
        ) : (
          ideas.map(idea => <IdeaCard key={idea.id} idea={idea} />)
        )}
      </div>
    </div>
  )
}
