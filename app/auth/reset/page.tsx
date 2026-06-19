'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center px-6">
        <div className="max-w-sm mx-auto w-full text-center">
          <p className="text-2xl font-black">Check your email</p>
          <p className="text-gray-500 mt-2 text-sm">We sent a password reset link to {email}</p>
          <Link href="/auth/login" className="mt-6 inline-block text-[#f97316] font-semibold text-sm">← Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="text-2xl font-black mb-2">Reset password</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm"><Link href="/auth/login" className="text-gray-400">← Back to login</Link></p>
      </div>
    </div>
  )
}
