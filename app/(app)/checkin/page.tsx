'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIME_OPTIONS = [
  { label: '30 min', value: 0.5 },
  { label: '45 min', value: 0.75 },
  { label: '1 hr',   value: 1 },
  { label: '2 hrs',  value: 2 },
  { label: 'All day', value: 8 },
]

export default function CheckinPage() {
  const [availableHours, setAvailableHours] = useState<number | null>(null)
  const [obstacles, setObstacles] = useState('')
  const [yesterdayProgress, setYesterdayProgress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (availableHours === null) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available_hours: availableHours, obstacles, yesterday_progress: yesterdayProgress }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="px-4 pt-6 pb-5 border-b border-[#1a1a1a]">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-1">Daily Check-in</p>
        <h1 className="text-2xl font-black text-white">Build your day</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-5 space-y-6">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] block mb-3">
            Time available today
          </label>
          <div className="flex gap-2 flex-wrap">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAvailableHours(opt.value)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                  availableHours === opt.value
                    ? 'bg-[#f97316] border-[#f97316] text-white'
                    : 'bg-[#111] border-[#222] text-[#a1a1aa] hover:border-[#333]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] block mb-2">
            Obstacles today? <span className="normal-case text-[#333]">(optional)</span>
          </label>
          <textarea
            value={obstacles}
            onChange={e => setObstacles(e.target.value)}
            placeholder="e.g. kids are home, no laptop, feeling anxious..."
            rows={2}
            className="w-full bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#f97316] resize-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] block mb-2">
            Yesterday's progress <span className="normal-case text-[#333]">(optional)</span>
          </label>
          <textarea
            value={yesterdayProgress}
            onChange={e => setYesterdayProgress(e.target.value)}
            placeholder="e.g. sent 2 DMs, wrote proposal, had a discovery call..."
            rows={2}
            className="w-full bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#f97316] resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={availableHours === null || loading}
          className="w-full bg-[#f97316] text-white font-black uppercase tracking-widest py-4 rounded-xl text-sm disabled:opacity-30 transition-opacity"
        >
          {loading ? 'Generating tasks...' : 'Generate My Tasks →'}
        </button>
      </form>
    </div>
  )
}
