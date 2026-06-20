'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        <div className="mb-10">
          <p className="text-[#f97316] font-black text-lg tracking-tight mb-1">
            FOCUS<span className="text-white">FORGE</span>
          </p>
          <h1 className="text-3xl font-black text-white">Welcome back.</h1>
          <p className="text-[#525252] text-sm mt-2">Sign in to your Chief of Staff.</p>
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
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#f97316]"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f97316] text-white font-black uppercase tracking-widest py-4 rounded-xl text-sm disabled:opacity-40 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          <p className="text-[#525252] text-sm">
            No account?{' '}
            <Link href="/auth/signup" className="text-white font-semibold hover:text-[#f97316] transition-colors">
              Create one
            </Link>
          </p>
          <p>
            <Link href="/auth/reset" className="text-[#333] text-xs hover:text-[#525252] transition-colors">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
