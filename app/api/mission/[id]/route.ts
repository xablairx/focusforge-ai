import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const allowed = ['completed', 'abandoned', 'paused', 'active']

  if (!allowed.includes(body.status) && body.completion_pct === undefined) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.status) {
    updates.status = body.status
    if (body.status === 'completed')  updates.completed_at = new Date().toISOString()
    if (body.status === 'abandoned') {
      updates.abandoned_at     = new Date().toISOString()
      updates.abandoned_reason = body.reason ?? null
    }
  }
  if (body.completion_pct !== undefined) updates.completion_pct = body.completion_pct

  const { data, error } = await supabase
    .from('missions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
