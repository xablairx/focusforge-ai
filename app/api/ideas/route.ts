import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'
import { IdeaScoreSchema } from '@/lib/anthropic/schemas'
import { extractJson } from '@/lib/anthropic/parse'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const { data: mission } = await supabase
    .from('missions')
    .select('id, title, started_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!mission) return NextResponse.json({ error: 'No active mission' }, { status: 404 })

  const days = Math.floor((Date.now() - new Date(mission.started_at).getTime()) / 86_400_000) + 1

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: `You evaluate whether a new idea supports a user's current mission. Be honest and direct. Return JSON only.`,
    messages: [{
      role: 'user',
      content: `Current mission: "${mission.title}" (Day ${days})
New idea: "${body.title}"
${body.description ? `Details: ${body.description}` : ''}

Does this idea directly support the current mission?
Return JSON: { "alignment_score": 0-10, "status": "jailed"|"flagged"|"approved", "ai_notes": "1-2 sentence honest assessment" }
Score guide: 0-4=jailed, 5-7=flagged, 8-10=approved`,
    }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  let scored
  try {
    scored = IdeaScoreSchema.parse(JSON.parse(extractJson(raw)))
  } catch {
    return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 })
  }

  const { data: idea } = await supabase
    .from('ideas')
    .insert({
      user_id:               user.id,
      mission_id:            mission.id,
      title:                 body.title.trim(),
      description:           body.description ?? null,
      status:                scored.status,
      ai_alignment_score:    scored.alignment_score,
      ai_notes:              scored.ai_notes,
      scheduled_review_date: scored.status === 'flagged'
        ? new Date(Date.now() + 7 * 86_400_000).toISOString().split('T')[0]
        : null,
    })
    .select()
    .single()

  return NextResponse.json(idea, { status: 201 })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const missionFilter = searchParams.get('mission')

  let query = supabase.from('ideas').select('*, missions(title)').eq('user_id', user.id)

  if (missionFilter === 'active') {
    const { data: mission } = await supabase.from('missions').select('id').eq('user_id', user.id).eq('status', 'active').single()
    if (mission) query = query.eq('mission_id', mission.id)
  } else if (missionFilter === 'past') {
    const { data: missions } = await supabase.from('missions').select('id').eq('user_id', user.id).neq('status', 'active')
    const ids = (missions ?? []).map((m: { id: string }) => m.id)
    if (ids.length) query = query.in('mission_id', ids)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
