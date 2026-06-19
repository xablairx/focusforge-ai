import Link from 'next/link'

export default function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3 px-4 pb-4">
      {[
        { href: '/app/ideas',   icon: '💡', label: 'Jail Idea'   },
        { href: '/app/revenue', icon: '💰', label: 'Log Revenue' },
        { href: '/app/chat',    icon: '💬', label: 'AI Chat'     },
      ].map(({ href, icon, label }) => (
        <Link
          key={href}
          href={href}
          className="bg-gray-50 border border-gray-100 rounded-xl py-3 flex flex-col items-center gap-1"
        >
          <span className="text-xl">{icon}</span>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">{label}</span>
        </Link>
      ))}
    </div>
  )
}
