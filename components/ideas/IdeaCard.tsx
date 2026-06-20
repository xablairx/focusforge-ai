import type { Idea } from '@/types'

const statusConfig = {
  jailed:    { badge: 'text-red-400 border-red-400/30 bg-red-400/5',       label: 'Jailed'          },
  flagged:   { badge: 'text-amber-400 border-amber-400/30 bg-amber-400/5', label: 'Review Sunday'   },
  approved:  { badge: 'text-green-400 border-green-400/30 bg-green-400/5', label: 'Aligned'         },
  promoted:  { badge: 'text-blue-400 border-blue-400/30 bg-blue-400/5',    label: 'Promoted'        },
  dismissed: { badge: 'text-[#525252] border-[#222] bg-transparent',       label: 'Dismissed'       },
}

export default function IdeaCard({ idea }: { idea: Idea }) {
  const s = statusConfig[idea.status] ?? statusConfig.jailed
  return (
    <div className="py-4 border-b border-[#1a1a1a]">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-semibold text-white leading-snug">{idea.title}</p>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border flex-shrink-0 ${s.badge}`}>
          {s.label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {idea.ai_alignment_score !== null && (
          <span className="text-[10px] tabular-nums text-[#525252]">Score {idea.ai_alignment_score}/10</span>
        )}
        {idea.ai_notes && (
          <p className="text-[11px] text-[#525252] italic truncate">{idea.ai_notes}</p>
        )}
      </div>
    </div>
  )
}
