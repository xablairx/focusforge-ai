import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <TopNav />
      <main className="pb-24">{children}</main>
      <BottomNav />
    </div>
  )
}
