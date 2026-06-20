'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIME_OPTIONS = [
  { label: '30 min',   value: 0.5 },
  { label: '45 min',   value: 0.75 },
  { label: '1 hr',     value: 1 },
  { label: '2 hrs',    value: 2 },
  { label: 'Full day', value: 8 },
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
    <div className="min-h-screen bg-white">
      <div className="bg-black px-4 pt-4 pb-6 border-b-4 border-[#f97316]">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Good morning 👊</p>
        <h1 className="text-2xl font-black text-white">Let&apos;s build your day</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-5 space-y-5">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 block mb-2">
            How much time do you have today?
          </label>
          <div className="flex gap-2 flex-wrap">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAvailableHours(opt.value)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                  availableHours === opt.value
                    ? 'bg-[#f97316] text-white border-[#f97316]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 block mb-2">
            Any obstacles today?
          </label>
          <textarea
            value={obstacles}
            onChange={e => setObstacles(e.target.value)}
            placeholder="e.g. kids are home, feeling anxious, no laptop..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f97316] resize-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 block mb-2">
            What did you accomplish yesterday?
          </label>
          <textarea
            value={yesterdayProgress}
            onChange={e => setYesterdayProgress(e.target.value)}
            placeholder="e.g. sent 2 DMs, wrote proposal, had a discovery call..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f97316] resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={availableHours === null || loading}
          className="w-full bg-[#f97316] text-white font-black uppercase tracking-wide py-3.5 rounded-xl text-sm disabled:opacity-40"
        >
          {loading ? 'Generating tasks...' : 'Generate My Tasks →'}
        </button>
      </form>
    </div>
  )
}
