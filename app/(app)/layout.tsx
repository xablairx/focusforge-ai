import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
