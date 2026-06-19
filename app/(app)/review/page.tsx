'use client'
import { useState } from 'react'
import ReviewStats from '@/components/review/ReviewStats'
import CoachingBlock from '@/components/review/CoachingBlock'
import Link from 'next/link'

interface ReviewData {
  review: {
    focus_score: number
    completion_score: number
    revenue_generated: number
    tasks_completed: number
    hours_spent: number
    ai_coaching: string
    week_start: string
  }
  wins: string[]
  failures: string[]
}

export default function ReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    const res = await fetch('/api/review/generate', { method: 'POST' })
    if (res.ok) {
      const json = await res.json()
      setData(json)
      setGenerated(true)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-[#f97316]">
        <h1 className="text-2xl font-black text-white">Weekly Review 📊</h1>
        <p className="text-gray-400 text-xs mt-1">Your Chief of Staff&apos;s honest assessment of this week.</p>
      </div>

      {!generated && (
        <div className="px-4 pt-6 text-center">
          <p className="text-gray-500 text-sm mb-4">Ready to see how this week went?</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-[#f97316] text-white font-black uppercase tracking-wide px-6 py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : "Generate This Week's Review →"}
          </button>
          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Past Reviews</p>
            <Link href="/app/missions" className="text-[#f97316] text-sm font-bold">View Mission History →</Link>
          </div>
        </div>
      )}

      {generated && data && (
        <>
          <ReviewStats
            focusScore={data.review.focus_score}
            completionScore={data.review.completion_score}
            revenue={data.review.revenue_generated}
            tasksCompleted={data.review.tasks_completed}
            hoursSpent={data.review.hours_spent}
          />
          <CoachingBlock
            coaching={data.review.ai_coaching}
            wins={data.wins}
            failures={data.failures}
          />
        </>
      )}
    </div>
  )
}
