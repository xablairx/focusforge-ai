interface Props {
  revenue: number
  tasksCompleted: number
  focusScore: number
}

export default function StatsRow({ revenue, tasksCompleted, focusScore }: Props) {
  return (
    <div className="grid grid-cols-3 border-b border-[#1a1a1a]">
      {[
        { value: `$${revenue.toFixed(0)}`, label: 'Revenue',     color: 'text-[#22c55e]' },
        { value: String(tasksCompleted),    label: 'Done today',  color: 'text-[#f97316]' },
        { value: String(focusScore),        label: 'Streak',      color: 'text-white'     },
      ].map(({ value, label, color }, i) => (
        <div key={i} className={`py-4 px-3 text-center ${i < 2 ? 'border-r border-[#1a1a1a]' : ''}`}>
          <p className={`text-2xl font-black tabular-nums leading-none ${color}`}>{value}</p>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#525252] mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}
