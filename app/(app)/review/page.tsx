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
      setData(await res.json())
      setGenerated(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="px-4 pt-6 pb-5 border-b border-[#1a1a1a]">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-1">Weekly Review</p>
        <h1 className="text-2xl font-black text-white">Your week, assessed.</h1>
      </div>

      {!generated && (
        <div className="px-4 pt-10 text-center">
          <p className="text-[#525252] text-sm mb-6">Ready for an honest look at this week?</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-[#f97316] text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl text-sm disabled:opacity-30"
          >
            {loading ? 'Analyzing...' : "Generate Review →"}
          </button>
          <div className="mt-10">
            <Link href="/missions" className="text-[#525252] text-sm hover:text-white transition-colors">
              View mission history →
            </Link>
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
