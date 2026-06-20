'use client'
import type { Task } from '@/types'

interface Props {
  task: Task
  onComplete: (id: string) => void
}

export default function TaskCard({ task, onComplete }: Props) {
  const done = task.status === 'completed'
  return (
    <div className={`flex gap-3 items-start py-3.5 border-b border-[#1a1a1a] ${done ? 'opacity-40' : ''}`}>
      <button
        onClick={() => !done && onComplete(task.id)}
        className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${
          done
            ? 'border-[#f97316] bg-[#f97316]'
            : task.priority === 'primary'
            ? 'border-[#f97316]'
            : 'border-[#333]'
        }`}
      >
        {done && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {task.priority === 'primary' && (
            <span className="text-[9px] font-black uppercase tracking-widest text-[#f97316]">Primary</span>
          )}
          {task.priority === 'secondary' && (
            <span className="text-[9px] font-black uppercase tracking-widest text-[#525252]">Secondary</span>
          )}
          {task.priority === 'optional' && (
            <span className="text-[9px] font-black uppercase tracking-widest text-[#333]">Optional</span>
          )}
        </div>
        <p className={`text-sm font-semibold leading-snug ${done ? 'line-through text-[#525252]' : 'text-white'}`}>
          {task.title}
        </p>
      </div>
      <span className="text-[10px] tabular-nums text-[#333] flex-shrink-0 mt-0.5">{task.revenue_score}/10</span>
    </div>
  )
}
