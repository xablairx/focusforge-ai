'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile, Streak } from '@/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [streak, setStreak] = useState<Streak | null>(null)
  const [name, setName] = useState('')
  const [sahmMode, setSahmMode] = useState(false)
  const [sahmMinutes, setSahmMinutes] = useState(45)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => r.json()),
      fetch('/api/streak').then(r => r.json()).catch(() => null),
    ]).then(([p, s]) => {
      setProfile(p)
      setName(p.full_name ?? '')
      setSahmMode(p.sahm_mode ?? false)
      setSahmMinutes(p.sahm_available_minutes ?? 45)
      if (s) setStreak(s)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, sahm_mode: sahmMode, sahm_available_minutes: sahmMinutes }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  async function handleMissionProgress(pct: number) {
    const res = await fetch('/api/mission/active')
    if (res.ok) {
      const mission = await res.json()
      if (mission?.id) {
        await fetch(`/api/mission/${mission.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completion_pct: pct }),
        })
      }
    }
  }

  if (!profile) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-[#222] border-t-[#f97316] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="px-4 pt-6 pb-5 border-b border-[#1a1a1a]">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-1">Account</p>
        <h1 className="text-2xl font-black text-white">Settings</h1>
      </div>

      {streak && (
        <div className="mx-4 mt-5 border border-[#1e1e1e] bg-[#111] rounded-xl p-4 flex items-center gap-4">
          <div>
            <p className="text-4xl font-black text-[#f97316] tabular-nums leading-none">{streak.current_streak}</p>
          </div>
          <div>
            <p className="text-white font-bold text-sm">day streak 🔥</p>
            <p className="text-[#525252] text-xs mt-0.5">Best: {streak.longest_streak} days</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="px-4 pt-5 space-y-5">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] block mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-[#111] border border-[#222] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] block mb-2">Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Standard', sub: 'Up to 3 tasks', value: false },
              { label: 'SAHM', sub: 'One task, timed', value: true },
            ].map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setSahmMode(opt.value)}
                className={`border rounded-xl p-3 text-left transition-all ${
                  sahmMode === opt.value
                    ? 'border-[#f97316] bg-[#f97316]/5'
                    : 'border-[#222] bg-[#111]'
                }`}
              >
                <p className={`text-xs font-bold ${sahmMode === opt.value ? 'text-[#f97316]' : 'text-white'}`}>{opt.label}</p>
                <p className="text-[10px] text-[#525252] mt-0.5">{opt.sub}</p>
              </button>
            ))}
          </div>
          {sahmMode && (
            <div className="mt-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] block mb-2">Default time</label>
              <div className="flex gap-2">
                {[15, 30, 45, 60].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSahmMinutes(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                      sahmMinutes === m
                        ? 'border-[#f97316] bg-[#f97316] text-white'
                        : 'border-[#222] bg-[#111] text-[#a1a1aa]'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] block mb-2">Mission Progress</label>
          <MissionProgressSlider onSave={handleMissionProgress} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 ${
            saved ? 'bg-[#22c55e] text-white' : 'bg-white text-black'
          }`}
        >
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="px-4 pt-4 pb-8">
        <button
          onClick={handleSignOut}
          className="w-full border border-[#222] text-[#525252] font-semibold py-3.5 rounded-xl text-sm hover:text-white hover:border-[#333] transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

function MissionProgressSlider({ onSave }: { onSave: (pct: number) => void }) {
  const [pct, setPct] = useState(0)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    await onSave(pct)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={e => setPct(Number(e.target.value))}
        className="flex-1"
      />
      <span className="text-sm font-black text-white tabular-nums w-10 text-right">{pct}%</span>
      <button
        type="button"
        onClick={handleSave}
        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
          saved ? 'border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/5' : 'border-[#222] text-[#525252] hover:text-white'
        }`}
      >
        {saved ? '✓' : 'Set'}
      </button>
    </div>
  )
}
