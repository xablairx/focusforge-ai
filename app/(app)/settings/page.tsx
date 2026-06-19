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

  if (!profile) return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>

  return (
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-[#f97316]">
        <h1 className="text-2xl font-black text-white">Settings</h1>
      </div>

      {streak && (
        <div className="mx-4 mt-4 bg-black rounded-xl p-3.5 flex items-center gap-3">
          <div className="text-3xl font-black text-[#f97316]">{streak.current_streak}</div>
          <div>
            <p className="text-white text-sm font-bold">day streak 🔥</p>
            <p className="text-gray-400 text-xs">Best: {streak.longest_streak} days</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="px-4 pt-5 space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f97316]"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">SAHM Mode</label>
          <div className="space-y-2">
            {[{ label: 'Off — Standard (up to 3 tasks)', value: false }, { label: 'On — One task, time-capped', value: true }].map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setSahmMode(opt.value)}
                className={`w-full border-2 rounded-xl p-3 text-left text-xs font-semibold ${sahmMode === opt.value ? 'border-[#f97316] bg-orange-50' : 'border-gray-200'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {sahmMode && (
            <div className="mt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Default available time</label>
              <div className="flex gap-2">
                {[15,30,45,60].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSahmMinutes(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border ${sahmMinutes === m ? 'border-[#f97316] bg-[#f97316] text-white' : 'border-gray-200 text-gray-600'}`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
            Update Mission Progress
          </label>
          <MissionProgressSlider onSave={handleMissionProgress} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wide ${saved ? 'bg-green-600 text-white' : 'bg-black text-white'} disabled:opacity-50`}
        >
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="px-4 pt-4 pb-6">
        <button
          onClick={handleSignOut}
          className="w-full border border-gray-200 text-gray-400 font-bold py-3 rounded-xl text-sm"
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
    <div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={e => setPct(Number(e.target.value))}
          className="flex-1 accent-[#f97316]"
        />
        <span className="text-sm font-black w-10 text-right">{pct}%</span>
      </div>
      <button
        type="button"
        onClick={handleSave}
        className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-lg ${saved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
      >
        {saved ? '✓ Updated' : 'Update progress'}
      </button>
    </div>
  )
}
