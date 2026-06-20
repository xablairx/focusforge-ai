import Link from 'next/link'

const actions = [
  { href: '/ideas',   label: 'Jail Idea',    sub: 'Lock distractions' },
  { href: '/revenue', label: 'Log Revenue',  sub: 'Track the money'   },
  { href: '/chat',    label: 'AI Chat',      sub: 'Get unstuck'       },
]

export default function QuickActions() {
  return (
    <div className="px-4 pt-5 pb-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-3">Quick Actions</p>
      <div className="grid grid-cols-3 gap-2">
        {actions.map(({ href, label, sub }) => (
          <Link
            key={href}
            href={href}
            className="bg-[#111] border border-[#1e1e1e] rounded-xl p-3 flex flex-col gap-1 hover:border-[#2a2a2a] transition-colors"
          >
            <p className="text-xs font-bold text-white leading-tight">{label}</p>
            <p className="text-[10px] text-[#525252] leading-tight">{sub}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
