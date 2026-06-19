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
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-[#f97316]">
        <Link href="/app/missions" className="text-gray-500 text-xs">← Missions</Link>
        <h1 className="text-xl font-black text-white mt-2 leading-tight">{m.title}</h1>
        <div className="flex gap-2 mt-2">
          <span className="text-[10px] text-gray-400 capitalize">Status: {m.status}</span>
          <span className="text-[10px] text-gray-400">{m.completion_pct}% complete</span>
        </div>
      </div>

      <div className="px-4 pt-4 grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400">Started</p>
          <p className="font-bold text-sm">{fmt(m.started_at)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400">{m.status === 'completed' ? 'Completed' : 'Last updated'}</p>
          <p className="font-bold text-sm">{fmt(m.completed_at ?? m.abandoned_at ?? m.started_at)}</p>
        </div>
      </div>

      {tasks && tasks.length > 0 && (
        <div className="px-4 pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Tasks ({completedTasks}/{tasks.length} completed)
          </p>
          {tasks.slice(0, 10).map((t: { title: string; status: string; revenue_score: number }, i: number) => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-50">
              <span className="text-sm">{t.status === 'completed' ? '✅' : '⬜'}</span>
              <p className="text-sm text-gray-800 flex-1">{t.title}</p>
              <span className="text-[10px] text-gray-400">Score {t.revenue_score}</span>
            </div>
          ))}
        </div>
      )}

      {ideas && ideas.length > 0 && (
        <div className="px-4 pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Idea Jail ({ideas.length} ideas)
          </p>
          {ideas.map((idea: { title: string; status: string; ai_alignment_score: number | null }, i: number) => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-50">
              <p className="text-sm text-gray-600 flex-1">{idea.title}</p>
              <span className="text-[10px] text-gray-400">{idea.ai_alignment_score ?? '–'}/10</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
