export default function CoachingBlock({ coaching, wins, failures }: {
  coaching: string
  wins: string[]
  failures: string[]
}) {
  return (
    <div className="px-4 space-y-3">
      <div className="bg-black rounded-xl p-4">
        <div className="text-[#f97316] text-[10px] font-black uppercase tracking-wide mb-2">⚡ Chief of Staff Coaching</div>
        <p className="text-gray-200 text-sm leading-relaxed">{coaching}</p>
      </div>
      {wins.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-3">
          <p className="text-green-700 font-black text-xs uppercase tracking-wide mb-1.5">Wins ✓</p>
          {wins.map((w, i) => <p key={i} className="text-green-800 text-sm">• {w}</p>)}
        </div>
      )}
      {failures.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
          <p className="text-red-700 font-black text-xs uppercase tracking-wide mb-1.5">Misses</p>
          {failures.map((f, i) => <p key={i} className="text-red-800 text-sm">• {f}</p>)}
        </div>
      )}
    </div>
  )
}
