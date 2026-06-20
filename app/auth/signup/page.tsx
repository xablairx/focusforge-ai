'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        <div className="mb-10">
          <p className="text-[#f97316] font-black text-lg tracking-tight mb-1">
            FOCUS<span className="text-white">FORGE</span>
          </p>
          <h1 className="text-3xl font-black text-white">One mission.<br />No distractions.</h1>
          <p className="text-[#525252] text-sm mt-2">Your AI Chief of Staff awaits.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#f97316]"
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
            className="w-full bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#f97316]"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f97316] text-white font-black uppercase tracking-widest py-4 rounded-xl text-sm disabled:opacity-40 mt-2"
          >
            {loading ? 'Creating account...' : 'Start My Mission →'}
          </button>
        </form>

        <p className="mt-8 text-center text-[#525252] text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white font-semibold hover:text-[#f97316] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
