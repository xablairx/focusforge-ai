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
    router.push('/app')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-black">
            Focus<span className="text-[#f97316]">Forge</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your Chief of Staff</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
          <p><Link href="/auth/signup" className="text-[#f97316] font-semibold">Create account</Link></p>
          <p><Link href="/auth/reset" className="text-gray-400">Forgot password?</Link></p>
        </div>
      </div>
    </div>
  )
}
