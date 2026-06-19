import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.amount || isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
    return NextResponse.json({ error: 'Valid positive amount required' }, { status: 400 })
  }

  const { data: mission } = await supabase
    .from('missions').select('id').eq('user_id', user.id).eq('status', 'active').single()

  const { data, error } = await supabase
    .from('revenue_entries')
    .insert({
      user_id:     user.id,
      mission_id:  mission?.id ?? null,
      amount:      Number(body.amount),
      currency:    body.currency ?? 'USD',
      description: body.description ?? null,
      entry_date:  body.entry_date ?? new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const firstOfMonth = new Date()
  firstOfMonth.setDate(1)
  const startDate = firstOfMonth.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('revenue_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('entry_date', startDate)
    .order('entry_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
