import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Mission } from '@/types'

function fmt(d: string | null) {
  if (!d) return '–'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const [{ data: mission }, { data: tasks }, { data: ideas }] = await Promise.all([
    supabase.from('missions').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('tasks').select('title,status,revenue_score').eq('mission_id', id).eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('ideas').select('title,status,ai_alignment_score').eq('mission_id', id).eq('user_id', user.id).limit(10),
  ])

  if (!mission) return notFound()

  const m = mission as Mission
  const completedTasks = (tasks ?? []).filter((t: { status: string }) => t.status === 'completed').length

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="px-4 pt-6 pb-5 border-b border-[#1a1a1a]">
        <Link href="/missions" className="text-[10px] font-bold uppercase tracking-widest text-[#525252] hover:text-white transition-colors">
          ← Missions
        </Link>
        <h1 className="text-xl font-black text-white mt-3 leading-tight">{m.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] text-[#525252] capitalize">{m.status}</span>
          <span className="text-[#333]">·</span>
          <span className="text-[10px] text-[#525252] tabular-nums">{m.completion_pct}% complete</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-[#1a1a1a] border-b border-[#1a1a1a]">
        {[
          { label: 'Started', value: fmt(m.started_at) },
          { label: m.status === 'completed' ? 'Completed' : 'Ended', value: fmt(m.completed_at ?? m.abandoned_at ?? null) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#0a0a0a] px-4 py-4">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-[#525252]">{label}</p>
            <p className="text-sm font-bold text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      {tasks && tasks.length > 0 && (
        <div className="px-4 pt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-1">
            Tasks <span className="tabular-nums">({completedTasks}/{tasks.length})</span>
          </p>
          {tasks.slice(0, 10).map((t: { title: string; status: string; revenue_score: number }, i: number) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-[#1a1a1a]">
              <span className={`text-xs ${t.status === 'completed' ? 'text-[#22c55e]' : 'text-[#333]'}`}>
                {t.status === 'completed' ? '✓' : '○'}
              </span>
              <p className={`text-sm flex-1 ${t.status === 'completed' ? 'text-[#525252] line-through' : 'text-white'}`}>{t.title}</p>
              <span className="text-[10px] text-[#333] tabular-nums">{t.revenue_score}/10</span>
            </div>
          ))}
        </div>
      )}

      {ideas && ideas.length > 0 && (
        <div className="px-4 pt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-1">
            Idea Jail <span className="tabular-nums">({ideas.length})</span>
          </p>
          {ideas.map((idea: { title: string; status: string; ai_alignment_score: number | null }, i: number) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-[#1a1a1a]">
              <p className="text-sm text-[#a1a1aa] flex-1">{idea.title}</p>
              <span className="text-[10px] text-[#333] tabular-nums">{idea.ai_alignment_score ?? '–'}/10</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
