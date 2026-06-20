'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'name' | 'mission' | 'sahm'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [mission, setMission] = useState('')
  const [sahmMode, setSahmMode] = useState(false)
  const [sahmMinutes, setSahmMinutes] = useState(45)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const stepNum = step === 'name' ? 1 : step === 'mission' ? 2 : 3

  async function handleFinish() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      full_name:              name.trim(),
      sahm_mode:              sahmMode,
      sahm_available_minutes: sahmMinutes,
      onboarded:              true,
      updated_at:             new Date().toISOString(),
    }).eq('id', user.id)

    await fetch('/api/mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: mission.trim() }),
    })

    await supabase.from('streaks').insert({ user_id: user.id })

    router.push('/checkin')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        <div className="flex gap-1.5 mb-10">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className={`h-0.5 flex-1 rounded-full transition-all ${n <= stepNum ? 'bg-[#f97316]' : 'bg-[#1a1a1a]'}`}
            />
          ))}
        </div>

        {step === 'name' && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-2">Step 1 of 3</p>
            <h1 className="text-3xl font-black text-white mb-1">What should I<br />call you?</h1>
            <p className="text-[#525252] text-sm mb-8">Your Chief of Staff needs a name for you.</p>
            <input
              type="text"
              placeholder="First name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className="w-full bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#f97316] mb-4"
            />
            <button
              onClick={() => setStep('mission')}
              disabled={!name.trim()}
              className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl text-sm disabled:opacity-20"
            >
              Next →
            </button>
          </div>
        )}

        {step === 'mission' && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-2">Step 2 of 3</p>
            <h1 className="text-3xl font-black text-white mb-1">What's your<br />mission, {name}?</h1>
            <p className="text-[#525252] text-sm mb-2">One goal. Revenue-related. Specific.</p>
            <p className="text-[10px] text-[#333] mb-8">"Land my first paying client" · "Launch MVP" · "Hit $5k/mo"</p>
            <input
              type="text"
              placeholder="My mission is to..."
              value={mission}
              onChange={e => setMission(e.target.value)}
              autoFocus
              className="w-full bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#f97316] mb-4"
            />
            <button
              onClick={() => setStep('sahm')}
              disabled={!mission.trim()}
              className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl text-sm disabled:opacity-20"
            >
              Next →
            </button>
          </div>
        )}

        {step === 'sahm' && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-2">Step 3 of 3</p>
            <h1 className="text-3xl font-black text-white mb-1">Limited time<br />windows?</h1>
            <p className="text-[#525252] text-sm mb-8">SAHM Mode gives you one high-leverage task when you have under an hour.</p>
            <div className="space-y-2 mb-6">
              {[
                { label: 'Standard', sub: 'Up to 3 tasks based on your time', value: false },
                { label: 'SAHM Mode ⚡', sub: 'One highest-leverage task, time-capped', value: true },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setSahmMode(opt.value)}
                  className={`w-full border rounded-xl p-4 text-left transition-all ${
                    sahmMode === opt.value
                      ? 'border-[#f97316] bg-[#f97316]/5'
                      : 'border-[#222] bg-[#111]'
                  }`}
                >
                  <p className={`text-sm font-bold ${sahmMode === opt.value ? 'text-[#f97316]' : 'text-white'}`}>{opt.label}</p>
                  <p className="text-[#525252] text-xs mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>
            {sahmMode && (
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-2">Default available time</p>
                <div className="flex gap-2">
                  {[15, 30, 45, 60].map(m => (
                    <button
                      key={m}
                      onClick={() => setSahmMinutes(m)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${
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
            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full bg-[#f97316] text-white font-black uppercase tracking-widest py-4 rounded-xl text-sm disabled:opacity-40"
            >
              {loading ? 'Setting up...' : "Let's Go →"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
