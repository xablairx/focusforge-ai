export default function CoachingBlock({ coaching, wins, failures }: {
  coaching: string
  wins: string[]
  failures: string[]
}) {
  return (
    <div className="px-4 space-y-3 pb-6">
      <div className="border border-[#1e1e1e] rounded-xl p-4 bg-[#111]">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#f97316] mb-3">Chief of Staff</p>
        <p className="text-[#a1a1aa] text-sm leading-relaxed">{coaching}</p>
      </div>
      {wins.length > 0 && (
        <div className="border border-[#22c55e]/20 bg-[#22c55e]/5 rounded-xl p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#22c55e] mb-3">Wins</p>
          {wins.map((w, i) => (
            <p key={i} className="text-sm text-[#a1a1aa] flex gap-2"><span className="text-[#22c55e]">✓</span>{w}</p>
          ))}
        </div>
      )}
      {failures.length > 0 && (
        <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-red-400 mb-3">Missed</p>
          {failures.map((f, i) => (
            <p key={i} className="text-sm text-[#a1a1aa] flex gap-2"><span className="text-red-400">—</span>{f}</p>
          ))}
        </div>
      )}
    </div>
  )
}
