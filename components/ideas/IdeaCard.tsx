import type { Idea } from '@/types'

const statusConfig = {
  jailed:   { bg: 'bg-red-50',    border: 'border-red-200',   badge: 'bg-red-100 text-red-700',    label: '🔒 Jailed'          },
  flagged:  { bg: 'bg-amber-50',  border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', label: '⚠️ Review Sunday'   },
  approved: { bg: 'bg-green-50',  border: 'border-green-200', badge: 'bg-green-100 text-green-700', label: '✅ Supports mission' },
  promoted: { bg: 'bg-blue-50',   border: 'border-blue-200',  badge: 'bg-blue-100 text-blue-700',   label: '→ Task added'       },
  dismissed:{ bg: 'bg-gray-50',   border: 'border-gray-200',  badge: 'bg-gray-100 text-gray-500',   label: 'Dismissed'          },
}

export default function IdeaCard({ idea }: { idea: Idea }) {
  const s = statusConfig[idea.status] ?? statusConfig.jailed
  return (
    <div className={`rounded-xl p-3 mb-2 border ${s.bg} ${s.border}`}>
      <p className="text-sm font-bold text-gray-900 mb-1.5">{idea.title}</p>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
        {idea.ai_alignment_score !== null && (
          <span className="text-[10px] text-gray-400">Score {idea.ai_alignment_score}/10</span>
        )}
      </div>
      {idea.ai_notes && (
        <p className="text-[11px] text-gray-500 italic mt-1">&quot;{idea.ai_notes}&quot;</p>
      )}
    </div>
  )
}
