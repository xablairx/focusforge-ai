'use client'
import { useState } from 'react'
import TaskCard from './TaskCard'
import type { Task } from '@/types'

export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)

  async function handleComplete(id: string) {
    await fetch(`/api/tasks/${id}/complete`, { method: 'POST' })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' as const } : t))
  }

  if (tasks.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-[#525252] text-sm mb-4">No tasks yet. Check in to generate your day.</p>
        <a
          href="/checkin"
          className="inline-flex items-center gap-2 bg-[#f97316] text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-lg"
        >
          Start Check-in →
        </a>
      </div>
    )
  }

  const remaining = tasks.filter(t => t.status !== 'completed').length

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252]">Today's Tasks</p>
        <span className="text-[10px] text-[#525252] tabular-nums">{remaining} left</span>
      </div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onComplete={handleComplete} />
      ))}
    </div>
  )
}
