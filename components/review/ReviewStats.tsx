interface Props {
  focusScore: number
  completionScore: number
  revenue: number
  tasksCompleted: number
  hoursSpent: number
}

export default function ReviewStats({ focusScore, completionScore, revenue, tasksCompleted }: Props) {
  return (
    <div className="px-4 py-4 grid grid-cols-2 gap-3">
      {[
        { label: 'Focus Score', value: `${focusScore}%`,        color: 'text-[#f97316]' },
        { label: 'Task Rate',   value: `${completionScore}%`,   color: 'text-blue-600'  },
        { label: 'Revenue',     value: `$${revenue.toFixed(0)}`, color: 'text-green-600' },
        { label: 'Tasks Done',  value: String(tasksCompleted),  color: 'text-black'     },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
          <p className={`text-2xl font-black ${color}`}>{value}</p>
          <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
