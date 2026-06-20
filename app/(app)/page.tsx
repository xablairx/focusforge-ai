import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MissionHero from '@/components/dashboard/MissionHero'
import StatsRow from '@/components/dashboard/StatsRow'
import TaskList from '@/components/dashboard/TaskList'
import AICoachNudge from '@/components/dashboard/AICoachNudge'
import QuickActions from '@/components/dashboard/QuickActions'
import type { Task } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const today = new Date().toISOString().split('T')[0]

  const [{ data: mission }, { data: tasks }, { data: checkin }, { data: streak }, { data: revenue }] =
    await Promise.all([
      supabase.from('missions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('scheduled_date', today).order('revenue_score', { ascending: false }),
      supabase.from('daily_checkins').select('ai_coaching_notes').eq('user_id', user.id).eq('checkin_date', today).single(),
      supabase.from('streaks').select('*').eq('user_id', user.id).single(),
      supabase.from('revenue_entries').select('amount').eq('user_id', user.id).gte('entry_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
    ])

  if (!mission) redirect('/mission/new')

  const totalRevenue = (revenue ?? []).reduce((sum: number, r: { amount: number }) => sum + r.amount, 0)
  const completedCount = (tasks ?? []).filter((t: { status: string }) => t.status === 'completed').length

  return (
    <div>
      <MissionHero mission={mission} />
      <StatsRow
        revenue={totalRevenue}
        tasksCompleted={completedCount}
        focusScore={streak?.current_streak ? Math.min(100, streak.current_streak * 10) : 0}
      />
      <TaskList initialTasks={(tasks ?? []) as Task[]} />
      {checkin?.ai_coaching_notes && <AICoachNudge note={checkin.ai_coaching_notes} />}
      <QuickActions />
    </div>
  )
}
