'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/', label: 'Home',
    icon: (a: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={a ? '#f97316' : 'none'} stroke={a ? '#f97316' : '#525252'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/checkin', label: 'Check-in',
    icon: (a: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? '#f97316' : '#525252'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    href: '/ideas', label: 'Ideas',
    icon: (a: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? '#f97316' : '#525252'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    href: '/chat', label: 'Chat',
    icon: (a: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? '#f97316' : '#525252'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href: '/review', label: 'Review',
    icon: (a: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a ? '#f97316' : '#525252'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#1a1a1a] grid grid-cols-5 z-50">
      {tabs.map(tab => {
        const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        return (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center py-3 gap-1">
            {tab.icon(active)}
            <span className={`text-[9px] font-semibold tracking-wide ${active ? 'text-[#f97316]' : 'text-[#525252]'}`}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
