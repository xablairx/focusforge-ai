interface Props {
  revenue: number
  tasksCompleted: number
  focusScore: number
}

export default function StatsRow({ revenue, tasksCompleted, focusScore }: Props) {
  return (
    <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
      <div className="py-3 px-4 text-center">
        <p className="text-xl font-black text-green-600">${revenue.toFixed(0)}</p>
        <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Revenue</p>
      </div>
      <div className="py-3 px-4 text-center">
        <p className="text-xl font-black text-[#f97316]">{tasksCompleted}</p>
        <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Tasks Done</p>
      </div>
      <div className="py-3 px-4 text-center">
        <p className="text-xl font-black text-black">{focusScore}</p>
        <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Focus Score</p>
      </div>
    </div>
  )
}
