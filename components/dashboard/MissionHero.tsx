import type { Mission } from '@/types'

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000) + 1
}

export default function MissionHero({ mission }: { mission: Mission }) {
  const days = daysSince(mission.started_at)
  return (
    <div className="px-4 pt-5 pb-4 border-b border-[#1a1a1a]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-1.5">Active Mission</p>
          <h2 className="text-xl font-black text-white leading-tight">{mission.title}</h2>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-3xl font-black text-[#f97316] leading-none tabular-nums">{days}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#525252] mt-0.5">days in</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-[10px] text-[#525252]">Progress</span>
          <span className="text-[10px] font-bold text-[#a1a1aa] tabular-nums">{mission.completion_pct}%</span>
        </div>
        <div className="h-px bg-[#1a1a1a] relative">
          <div
            className="absolute top-0 left-0 h-full bg-[#f97316] transition-all"
            style={{ width: `${mission.completion_pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
