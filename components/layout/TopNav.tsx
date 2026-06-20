import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function TopNav() {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('sahm_mode, full_name').single()

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
      <span className="text-[#f97316] font-black text-sm tracking-tight">
        FOCUS<span className="text-white">FORGE</span>
      </span>
      <div className="flex items-center gap-3">
        {profile?.sahm_mode && (
          <span className="text-[9px] font-black tracking-widest text-[#f97316] border border-[#f97316]/30 px-2 py-0.5 rounded">
            SAHM
          </span>
        )}
        <Link href="/settings" className="w-7 h-7 rounded-md flex items-center justify-center text-[#525252] hover:text-white transition-colors">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1C7.22386 1 7 1.22386 7 1.5V2.10197C6.17503 2.2784 5.43543 2.65682 4.83213 3.18404L4.30554 2.65745C4.1103 2.46222 3.79372 2.46222 3.59848 2.65745L2.65745 3.59848C2.46222 3.79372 2.46222 4.1103 2.65745 4.30554L3.18404 4.83213C2.65682 5.43543 2.2784 6.17503 2.10197 7H1.5C1.22386 7 1 7.22386 1 7.5C1 7.77614 1.22386 8 1.5 8H2.10197C2.2784 8.82497 2.65682 9.56457 3.18404 10.1679L2.65745 10.6945C2.46222 10.8897 2.46222 11.2063 2.65745 11.4015L3.59848 12.3426C3.79372 12.5378 4.1103 12.5378 4.30554 12.3426L4.83213 11.816C5.43543 12.3432 6.17503 12.7216 7 12.898V13.5C7 13.7761 7.22386 14 7.5 14C7.77614 14 8 13.7761 8 13.5V12.898C8.82497 12.7216 9.56457 12.3432 10.1679 11.816L10.6945 12.3426C10.8897 12.5378 11.2063 12.5378 11.4015 12.3426L12.3426 11.4015C12.5378 11.2063 12.5378 10.8897 12.3426 10.6945L11.816 10.1679C12.3432 9.56457 12.7216 8.82497 12.898 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H12.898C12.7216 6.17503 12.3432 5.43543 11.816 4.83213L12.3426 4.30554C12.5378 4.1103 12.5378 3.79372 12.3426 3.59848L11.4015 2.65745C11.2063 2.46222 10.8897 2.46222 10.6945 2.65745L10.1679 3.18404C9.56457 2.65682 8.82497 2.2784 8 2.10197V1.5C8 1.22386 7.77614 1 7.5 1ZM7.5 5C6.11929 5 5 6.11929 5 7.5C5 8.88071 6.11929 10 7.5 10C8.88071 10 10 8.88071 10 7.5C10 6.11929 8.88071 5 7.5 5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
          </svg>
        </Link>
      </div>
    </header>
  )
}
