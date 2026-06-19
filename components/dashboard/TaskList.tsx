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
      <div className="px-4 pt-6 text-center">
        <p className="text-gray-400 text-sm">No tasks yet.</p>
        <a href="/app/checkin" className="inline-block mt-2 bg-[#f97316] text-white font-black text-xs uppercase px-4 py-2 rounded-lg">
          Start Check-in →
        </a>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-black">Today&apos;s Tasks</h3>
        <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onComplete={handleComplete} />
      ))}
    </div>
  )
}
