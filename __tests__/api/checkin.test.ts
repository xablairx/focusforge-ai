/**
 * @jest-environment node
 */
import { POST } from '@/app/api/checkin/route'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/anthropic/client', () => ({
  anthropic: { messages: { create: jest.fn() } },
}))

const mockUser = { id: 'user-1' }
const mockMission = { id: 'm1', user_id: 'user-1', title: 'Get first client', started_at: new Date().toISOString(), status: 'active' }
const mockProfile = { id: 'user-1', sahm_mode: false, sahm_available_minutes: 45 }

const mockClaudeResponse = {
  content: [{ type: 'text', text: JSON.stringify({
    tasks: [{ title: 'Send 3 DMs', description: 'Cold outreach', priority: 'primary', revenue_score: 10 }],
    coaching_note: 'Do the outreach first.',
  })}],
}

;(createClient as jest.Mock).mockResolvedValue({
  auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
  from: jest.fn((table: string) => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({
          data: table === 'missions' ? mockMission : table === 'profiles' ? mockProfile : null,
        }),
        eq: jest.fn(() => ({ single: jest.fn().mockResolvedValue({ data: null }) })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({ single: jest.fn().mockResolvedValue({ data: { id: 'ci-1' } }) })),
    })),
  })),
})

;(anthropic.messages.create as jest.Mock).mockResolvedValue(mockClaudeResponse)

describe('POST /api/checkin', () => {
  it('returns 401 when unauthenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValueOnce({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    })
    const req = new Request('http://localhost/api/checkin', {
      method: 'POST',
      body: JSON.stringify({ available_hours: 2, obstacles: '', yesterday_progress: '' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when available_hours missing', async () => {
    const req = new Request('http://localhost/api/checkin', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
