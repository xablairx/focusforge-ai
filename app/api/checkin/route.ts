import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'
import { TaskOutputSchema } from '@/lib/anthropic/schemas'
import { buildCheckinSystemPrompt, buildCheckinUserPrompt } from '@/lib/anthropic/prompts'
import { extractJson } from '@/lib/anthropic/parse'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (body.available_hours === undefined || body.available_hours === null) {
    return NextResponse.json({ error: 'available_hours is required' }, { status: 400 })
  }

  const [{ data: mission }, { data: profile }] = await Promise.all([
    supabase.from('missions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  if (!mission) return NextResponse.json({ error: 'No active mission' }, { status: 404 })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('daily_checkins')
    .select('id')
    .eq('user_id', user.id)
    .eq('checkin_date', today)
    .single()

  if (existing) return NextResponse.json({ error: 'Already checked in today' }, { status: 409 })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildCheckinSystemPrompt(mission, profile),
    messages: [{ role: 'user', content: buildCheckinUserPrompt({
      availableHours:    body.available_hours,
      obstacles:         body.obstacles ?? '',
      yesterdayProgress: body.yesterday_progress ?? '',
    })}],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  let parsed
  try {
    parsed = TaskOutputSchema.parse(JSON.parse(extractJson(raw)))
  } catch {
    return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 })
  }

  const { data: checkin } = await supabase
    .from('daily_checkins')
    .insert({
      user_id:            user.id,
      mission_id:         mission.id,
      checkin_date:       today,
      available_hours:    body.available_hours,
      obstacles:          body.obstacles ?? null,
      yesterday_progress: body.yesterday_progress ?? null,
      ai_coaching_notes:  parsed.coaching_note,
    })
    .select()
    .single()

  const tasksToInsert = parsed.tasks.map(t => ({
    user_id:        user.id,
    mission_id:     mission.id,
    checkin_id:     checkin?.id ?? null,
    title:          t.title,
    description:    t.description,
    priority:       t.priority,
    revenue_score:  t.revenue_score,
    scheduled_date: today,
  }))

  await supabase.from('tasks').insert(tasksToInsert)

  await updateStreak(supabase, user.id, today)

  return NextResponse.json({ checkin, tasks: tasksToInsert, coaching_note: parsed.coaching_note })
}

async function updateStreak(supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>, userId: string, today: string) {
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!streak) {
    await supabase.from('streaks').insert({ user_id: userId, current_streak: 1, longest_streak: 1, last_checkin_date: today })
    return
  }

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
  const isConsecutive = streak.last_checkin_date === yesterday
  const newCurrent = isConsecutive ? streak.current_streak + 1 : 1
  const newLongest = Math.max(streak.longest_streak, newCurrent)

  await supabase.from('streaks').update({
    current_streak:    newCurrent,
    longest_streak:    newLongest,
    last_checkin_date: today,
    updated_at:        new Date().toISOString(),
  }).eq('user_id', userId)
}
