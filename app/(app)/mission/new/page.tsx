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
    if (res.ok) router.push('/app/checkin')
    else setLoading(false)
  }

  if (state === 'checking') {
    return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>
  }

  if (state === 'challenge') {
    return (
      <div className="min-h-screen bg-white px-4 pt-8">
        <div className="max-w-sm mx-auto">
          <div className="bg-black rounded-2xl p-5 mb-6">
            <div className="text-[#f97316] text-xs font-black uppercase tracking-wide mb-3">⚡ Chief of Staff</div>
            <p className="text-white text-sm leading-relaxed">
              You&apos;ve been on this mission for {missionAge} day{missionAge !== 1 ? 's' : ''}. Before you switch, answer honestly: is this mission no longer valid — or has executing on it become uncomfortable?
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mt-3">
              There&apos;s a difference between a dead end and resistance. One requires a pivot. The other requires you to push through.
            </p>
          </div>
          <textarea
            placeholder="Why do you want to switch? (optional but encouraged)"
            value={challengeResponse}
            onChange={e => setChallengeResponse(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-[#f97316] resize-none"
          />
          <div className="space-y-2">
            <button
              onClick={() => router.push('/app')}
              className="w-full bg-[#f97316] text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm"
            >
              You&apos;re right — I&apos;ll continue my mission
            </button>
            <button
              onClick={handleAbandonAndSwitch}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-xl text-sm disabled:opacity-50"
            >
              I want to switch anyway
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-4 pt-8">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-black mb-1">New mission</h1>
        <p className="text-gray-400 text-sm mb-6">Make it specific. Make it revenue-related.</p>
        <form onSubmit={handleCreateMission} className="space-y-4">
          <input
            type="text"
            placeholder="My mission is to..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]"
          />
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="w-full bg-black text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-40"
          >
            {loading ? 'Creating...' : 'Lock In Mission →'}
          </button>
        </form>
      </div>
    </div>
  )
}
