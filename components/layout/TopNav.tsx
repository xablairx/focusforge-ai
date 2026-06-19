import { createClient } from '@/lib/supabase/server'

export default async function TopNav() {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('sahm_mode')
    .single()

  return (
    <header className="bg-black px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <span className="text-[#f97316] font-black text-base">
        Focus<span className="text-white">Forge</span>
      </span>
      <div className="flex items-center gap-2">
        {profile?.sahm_mode && (
          <span className="bg-[#f97316] text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wide">
            SAHM
          </span>
        )}
        <a href="/app/settings" className="w-8 h-8 bg-[#222] rounded-lg flex items-center justify-center text-sm">⚙️</a>
      </div>
    </header>
  )
}
