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

  const stepNum = step === 'name' ? 1 : step === 'mission' ? 2 : 3

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        <div className="flex gap-2 mb-8">
          {[1,2,3].map(n => (
            <div key={n} className={`h-1 flex-1 rounded-full ${n <= stepNum ? 'bg-[#f97316]' : 'bg-gray-100'}`} />
          ))}
        </div>

        {step === 'name' && (
          <>
            <h1 className="text-2xl font-black mb-1">What should I call you?</h1>
            <p className="text-gray-400 text-sm mb-6">Your Chief of Staff needs a name for you.</p>
            <input
              type="text"
              placeholder="Your first name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#f97316]"
            />
            <button
              onClick={() => setStep('mission')}
              disabled={!name.trim()}
              className="w-full bg-black text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-30"
            >
              Next →
            </button>
          </>
        )}

        {step === 'mission' && (
          <>
            <h1 className="text-2xl font-black mb-1">What&apos;s your mission, {name}?</h1>
            <p className="text-gray-400 text-sm mb-2">One goal. Make it specific and revenue-related.</p>
            <p className="text-[10px] text-gray-300 uppercase tracking-wide mb-4">e.g. &quot;Land my first paying client&quot; · &quot;Launch MVP&quot; · &quot;Complete certification&quot;</p>
            <input
              type="text"
              placeholder="My mission is to..."
              value={mission}
              onChange={e => setMission(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#f97316]"
            />
            <button
              onClick={() => setStep('sahm')}
              disabled={!mission.trim()}
              className="w-full bg-black text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-30"
            >
              Next →
            </button>
          </>
        )}

        {step === 'sahm' && (
          <>
            <h1 className="text-2xl font-black mb-1">Limited time windows?</h1>
            <p className="text-gray-400 text-sm mb-6">SAHM Mode gives you one high-leverage task when you have less than an hour.</p>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSahmMode(false)}
                className={`w-full border-2 rounded-xl p-4 text-left text-sm font-semibold ${!sahmMode ? 'border-[#f97316] bg-orange-50' : 'border-gray-200'}`}
              >
                <div className="font-black">Standard Mode</div>
                <div className="text-gray-500 font-normal text-xs mt-1">Up to 3 tasks per day based on available hours</div>
              </button>
              <button
                onClick={() => setSahmMode(true)}
                className={`w-full border-2 rounded-xl p-4 text-left text-sm font-semibold ${sahmMode ? 'border-[#f97316] bg-orange-50' : 'border-gray-200'}`}
              >
                <div className="font-black">SAHM Mode ⚡</div>
                <div className="text-gray-500 font-normal text-xs mt-1">One highest-leverage task, sized to your available time</div>
              </button>
            </div>
            {sahmMode && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Default available time</p>
                <div className="flex gap-2">
                  {[15,30,45,60].map(m => (
                    <button
                      key={m}
                      onClick={() => setSahmMinutes(m)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border ${sahmMinutes === m ? 'border-[#f97316] bg-[#f97316] text-white' : 'border-gray-200 text-gray-600'}`}
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
              className="w-full bg-[#f97316] text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? 'Setting up...' : "Let's Go →"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
