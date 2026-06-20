import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'
import { WeeklyReviewSchema } from '@/lib/anthropic/schemas'
import { extractJson } from '@/lib/anthropic/parse'

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - day)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return {
    week_start: start.toISOString().split('T')[0],
    week_end:   end.toISOString().split('T')[0],
  }
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { week_start, week_end } = getWeekBounds()

  const { data: mission } = await supabase
    .from('missions').select('*').eq('user_id', user.id).eq('status', 'active').single()
  if (!mission) return NextResponse.json({ error: 'No active mission' }, { status: 404 })

  const [{ data: checkins }, { data: tasks }, { data: revenue }] = await Promise.all([
    supabase.from('daily_checkins').select('checkin_date,available_hours').eq('user_id', user.id).gte('checkin_date', week_start).lte('checkin_date', week_end),
    supabase.from('tasks').select('title,status,revenue_score').eq('user_id', user.id).gte('scheduled_date', week_start).lte('scheduled_date', week_end),
    supabase.from('revenue_entries').select('amount').eq('user_id', user.id).gte('entry_date', week_start).lte('entry_date', week_end),
  ])

  const totalRevenue   = (revenue ?? []).reduce((s: number, r: { amount: number }) => s + Number(r.amount), 0)
  const hoursSpent     = (checkins ?? []).reduce((s: number, c: { available_hours: number }) => s + Number(c.available_hours), 0)
  const completedTasks = (tasks ?? []).filter((t: { status: string }) => t.status === 'completed')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 768,
    system: `Generate a weekly review for an entrepreneur. Be direct, specific, and actionable. Return JSON only.`,
    messages: [{
      role: 'user',
      content: `Mission: "${mission.title}"
Week: ${week_start} to ${week_end}
Check-ins: ${checkins?.length ?? 0}/7 days
Hours worked: ${hoursSpent}
Tasks completed: ${completedTasks.length}/${tasks?.length ?? 0}
Revenue: $${totalRevenue}

Return JSON: { "wins": ["..."], "failures": ["..."], "coaching": "direct 2-3 sentence coaching note", "focus_score": 0-100, "completion_score": 0-100 }`,
    }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  let parsed
  try { parsed = WeeklyReviewSchema.parse(JSON.parse(extractJson(raw))) }
  catch { return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 }) }

  const { data, error } = await supabase
    .from('weekly_reviews')
    .upsert({
      user_id:           user.id,
      mission_id:        mission.id,
      week_start,
      week_end,
      revenue_generated: totalRevenue,
      hours_spent:       hoursSpent,
      focus_score:       parsed.focus_score,
      completion_score:  parsed.completion_score,
      tasks_completed:   completedTasks.length,
      ai_coaching:       parsed.coaching,
    }, { onConflict: 'user_id,week_start' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ review: data, wins: parsed.wins, failures: parsed.failures })
}
