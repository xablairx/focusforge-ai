'use client'
import type { Task } from '@/types'

interface Props {
  task: Task
  onComplete: (id: string) => void
}

const priorityStyles = {
  primary:   { wrapper: 'bg-black border-l-4 border-[#f97316]', title: 'text-white', badge: 'bg-[#f97316] text-white', label: 'bg-[#f97316] text-white' },
  secondary: { wrapper: 'bg-gray-50 border border-gray-200',     title: 'text-black', badge: 'bg-amber-100 text-amber-800', label: 'bg-amber-100 text-amber-800' },
  optional:  { wrapper: 'bg-gray-50 border border-dashed border-gray-200 opacity-70', title: 'text-gray-600', badge: 'bg-gray-100 text-gray-500', label: 'bg-gray-100 text-gray-500' },
}

const priorityLabels = { primary: 'Primary', secondary: 'Secondary', optional: 'Optional' }

export default function TaskCard({ task, onComplete }: Props) {
  const s = priorityStyles[task.priority]
  return (
    <div className={`rounded-xl p-3 mb-2 flex gap-3 items-start ${s.wrapper}`}>
      <button
        onClick={() => onComplete(task.id)}
        className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-[10px] border-2 ${task.priority === 'primary' ? 'border-[#f97316] bg-[#f97316] text-white' : 'border-gray-300'}`}
      >
        {task.status === 'completed' ? '✓' : ''}
      </button>
      <div className="flex-1">
        <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded mr-1 ${s.label}`}>
          {priorityLabels[task.priority]}
        </span>
        <p className={`text-sm font-bold mt-1 ${s.title}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.badge}`}>
            Score {task.revenue_score}
          </span>
        </div>
      </div>
    </div>
  )
}
