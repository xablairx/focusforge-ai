import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Mission } from '@/types'

const statusColors: Record<string, string> = {
  active:    'text-[#22c55e] border-[#22c55e]/30',
  completed: 'text-blue-400 border-blue-400/30',
  abandoned: 'text-red-400 border-red-400/30',
  paused:    'text-amber-400 border-amber-400/30',
}

function dayCount(m: Mission) {
  const end = m.completed_at || m.abandoned_at || new Date().toISOString()
  return Math.floor((new Date(end).getTime() - new Date(m.started_at).getTime()) / 86_400_000) + 1
}

export default async function MissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: missions } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="px-4 pt-6 pb-5 border-b border-[#1a1a1a]">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-1">History</p>
        <h1 className="text-2xl font-black text-white">Mission Archive</h1>
        <p className="text-[#525252] text-xs mt-1">{missions?.length ?? 0} missions total</p>
      </div>

      <div className="px-4 pt-4">
        {(missions ?? []).map((m: Mission) => (
          <Link
            key={m.id}
            href={`/mission/${m.id}`}
            className="flex items-start justify-between py-4 border-b border-[#1a1a1a] gap-3 hover:opacity-70 transition-opacity"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate">{m.title}</p>
              <p className="text-[10px] text-[#525252] mt-1 tabular-nums">{dayCount(m)} days · {m.completion_pct}% complete</p>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border flex-shrink-0 ${statusColors[m.status] ?? 'text-[#525252] border-[#222]'}`}>
              {m.status}
            </span>
          </Link>
        ))}

        {(missions ?? []).every((m: Mission) => m.status !== 'active') && (
          <div className="pt-6 text-center">
            <Link
              href="/mission/new"
              className="inline-flex items-center gap-2 bg-[#f97316] text-white font-black uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl"
            >
              Start New Mission →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
