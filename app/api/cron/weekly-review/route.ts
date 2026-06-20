import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend } from '@/lib/resend/client'
import { weeklyReviewEmailHtml } from '@/lib/resend/templates'

interface ReviewResult {
  review: {
    focus_score: number
    completion_score: number
    revenue_generated: number
    tasks_completed: number
    ai_coaching: string
    week_start: string
    week_end: string
  }
  wins: string[]
  failures: string[]
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('onboarded', true)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000'

  const results = await Promise.allSettled(
    (profiles ?? []).map(async (p: { id: string; full_name: string | null }) => {
      try {
        const { data: { user } } = await supabase.auth.admin.getUserById(p.id)
        if (!user?.email) return { userId: p.id, status: 'no-email' }

        const reviewRes = await fetch(`${baseUrl}/api/review/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-cron-user-id': p.id },
        })
        if (!reviewRes.ok) return { userId: p.id, status: 'review-failed' }

        const data: ReviewResult = await reviewRes.json()
        const { data: mission } = await supabase
          .from('missions').select('title').eq('user_id', p.id).eq('status', 'active').single()

        await getResend().emails.send({
          from: 'FocusForge AI <noreply@focusforge.ai>',
          to: user.email,
          subject: `Your week in review — ${data.review.week_start}`,
          html: weeklyReviewEmailHtml({
            name:            p.full_name ?? 'there',
            missionTitle:    mission?.title ?? 'Your mission',
            weekStart:       data.review.week_start,
            weekEnd:         data.review.week_end,
            focusScore:      data.review.focus_score,
            completionScore: data.review.completion_score,
            revenue:         data.review.revenue_generated,
            tasksCompleted:  data.review.tasks_completed,
            coaching:        data.review.ai_coaching,
            wins:            data.wins,
            failures:        data.failures,
          }),
        })
        return { userId: p.id, status: 'sent' }
      } catch (e) {
        return { userId: p.id, status: 'error', error: String(e) }
      }
    })
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ processed: profiles?.length ?? 0, succeeded })
}
