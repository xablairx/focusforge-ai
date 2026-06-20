'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/',        icon: '🏠', label: 'Home'     },
  { href: '/checkin', icon: '✅', label: 'Check-in' },
  { href: '/ideas',   icon: '🔒', label: 'Ideas'    },
  { href: '/chat',    icon: '⚡', label: 'Chat'     },
  { href: '/review',  icon: '📊', label: 'Review'   },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 grid grid-cols-5 z-50">
      {tabs.map(tab => {
        const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        return (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center py-2 pt-3">
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className={`text-[9px] uppercase tracking-wide font-bold mt-1 ${active ? 'text-[#f97316]' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
