'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type InterceptState = 'checking' | 'challenge' | 'form'

export default function NewMissionPage() {
  const [state, setState] = useState<InterceptState>('checking')
  const [missionAge, setMissionAge] = useState(0)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [challengeResponse, setChallengeResponse] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function checkActiveMission() {
      const res = await fetch('/api/mission/active')
      if (res.ok) {
        const data = await res.json()
        if (data?.started_at) {
          const days = Math.floor((Date.now() - new Date(data.started_at).getTime()) / 86_400_000) + 1
          setMissionAge(days)
          setState(days < 14 ? 'challenge' : 'form')
        } else {
          setState('form')
        }
      } else {
        setState('form')
      }
    }
    checkActiveMission()
  }, [])

  async function handleAbandonAndSwitch() {
    setLoading(true)
    const activeRes = await fetch('/api/mission/active')
    if (activeRes.ok) {
      const active = await activeRes.json()
      if (active?.id) {
        await fetch(`/api/mission/${active.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'abandoned', reason: challengeResponse || 'User chose to switch missions.' }),
        })
      }
    }
    setState('form')
    setLoading(false)
  }

  async function handleCreateMission(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const res = await fetch('/api/mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    })
    if (res.ok) router.push('/checkin')
    else setLoading(false)
  }

  if (state === 'checking') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#222] border-t-[#f97316] rounded-full animate-spin" />
      </div>
    )
  }

  if (state === 'challenge') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] px-4 pt-8">
        <div className="max-w-sm mx-auto">
          <div className="border border-[#1e1e1e] bg-[#111] rounded-2xl p-5 mb-5">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#f97316] mb-3">Chief of Staff</p>
            <p className="text-white text-sm leading-relaxed font-semibold">
              You've been on this mission for {missionAge} day{missionAge !== 1 ? 's' : ''}. Before you switch — is this mission no longer valid, or has executing on it become uncomfortable?
            </p>
            <p className="text-[#525252] text-sm leading-relaxed mt-3">
              There's a difference between a dead end and resistance. One requires a pivot. The other requires you to push through.
            </p>
          </div>
          <textarea
            placeholder="Why do you want to switch? (optional but encouraged)"
            value={challengeResponse}
            onChange={e => setChallengeResponse(e.target.value)}
            rows={3}
            className="w-full bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#f97316] resize-none"
          />
          <div className="space-y-2">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-[#f97316] text-white font-black uppercase tracking-widest py-4 rounded-xl text-sm"
            >
              You're right — stay the course
            </button>
            <button
              onClick={handleAbandonAndSwitch}
              disabled={loading}
              className="w-full border border-[#222] text-[#525252] font-semibold py-4 rounded-xl text-sm disabled:opacity-40 hover:text-white hover:border-[#333] transition-all"
            >
              Switch anyway
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 pt-8">
      <div className="max-w-sm mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-2">New Mission</p>
        <h1 className="text-3xl font-black text-white mb-1">What are you<br />building?</h1>
        <p className="text-[#525252] text-sm mb-8">Make it specific. Make it revenue-related.</p>
        <form onSubmit={handleCreateMission} className="space-y-4">
          <input
            type="text"
            placeholder="My mission is to..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            className="w-full bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#f97316]"
          />
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="w-full bg-[#f97316] text-white font-black uppercase tracking-widest py-4 rounded-xl text-sm disabled:opacity-30"
          >
            {loading ? 'Creating...' : 'Lock In Mission →'}
          </button>
        </form>
      </div>
    </div>
  )
}
