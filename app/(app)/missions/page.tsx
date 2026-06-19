import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Mission } from '@/types'

const statusStyles: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  abandoned: 'bg-red-100 text-red-700',
  paused:    'bg-amber-100 text-amber-700',
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
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-[#f97316]">
        <h1 className="text-2xl font-black text-white">Mission Archive</h1>
        <p className="text-gray-400 text-xs mt-1">{missions?.length ?? 0} missions total</p>
      </div>
      <div className="px-4 pt-3">
        {(missions ?? []).map((m: Mission) => (
          <Link
            key={m.id}
            href={`/app/mission/${m.id}`}
            className="block border border-gray-100 rounded-xl p-3.5 mb-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-gray-900 leading-tight">{m.title}</p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${statusStyles[m.status] ?? 'bg-gray-100'}`}>
                {m.status}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{dayCount(m)} day{dayCount(m) !== 1 ? 's' : ''} · {m.completion_pct}% complete</p>
          </Link>
        ))}
        {(missions ?? []).every((m: Mission) => m.status !== 'active') && (
          <div className="mt-4 text-center">
            <Link
              href="/app/mission/new"
              className="inline-block bg-[#f97316] text-white font-black uppercase text-xs px-5 py-3 rounded-xl"
            >
              Start New Mission →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
