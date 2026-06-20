interface Props {
  focusScore: number
  completionScore: number
  revenue: number
  tasksCompleted: number
  hoursSpent: number
}

export default function ReviewStats({ focusScore, completionScore, revenue, tasksCompleted }: Props) {
  const stats = [
    { label: 'Focus Score',    value: `${focusScore}%`,         color: 'text-[#f97316]' },
    { label: 'Completion',     value: `${completionScore}%`,    color: 'text-white'     },
    { label: 'Revenue',        value: `$${revenue.toFixed(0)}`, color: 'text-[#22c55e]' },
    { label: 'Tasks Done',     value: String(tasksCompleted),   color: 'text-white'     },
  ]
  return (
    <div className="grid grid-cols-2 gap-px bg-[#1a1a1a] border-t border-b border-[#1a1a1a] my-5">
      {stats.map(({ label, value, color }) => (
        <div key={label} className="bg-[#0a0a0a] py-5 px-4 text-center">
          <p className={`text-3xl font-black tabular-nums leading-none ${color}`}>{value}</p>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#525252] mt-2">{label}</p>
        </div>
      ))}
    </div>
  )
}
