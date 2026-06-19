import type { Mission } from '@/types'

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000) + 1
}

export default function MissionHero({ mission }: { mission: Mission }) {
  const days = daysSince(mission.started_at)
  return (
    <div className="bg-black px-4 pt-4 pb-6 border-b-4 border-[#f97316]">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Active Mission</p>
      <h2 className="text-2xl font-black text-white leading-tight mb-3">{mission.title}</h2>
      <div className="flex gap-2 flex-wrap mb-4">
        <span className="bg-[#1a1a1a] border border-[#333] text-gray-300 text-[10px] px-3 py-1 rounded-full">
          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 align-middle" />
          Day {days}
        </span>
      </div>
      <div>
        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
          <span>Mission progress</span>
          <span>{mission.completion_pct}%</span>
        </div>
        <div className="bg-[#222] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#f97316] to-amber-400 h-full rounded-full transition-all"
            style={{ width: `${mission.completion_pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
