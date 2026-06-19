/**
 * @jest-environment node
 */
import { POST } from '@/app/api/review/generate/route'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/anthropic/client', () => ({
  anthropic: { messages: { create: jest.fn() } },
}))

const mockClaudeResponse = {
  content: [{ type: 'text', text: JSON.stringify({
    wins: ['Sent 5 DMs'], failures: ['Missed two days'],
    coaching: 'Show up every day.', focus_score: 72, completion_score: 65,
  })}],
}

;(createClient as jest.Mock).mockResolvedValue({
  auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: { id: 'm1', title: 'Get clients', started_at: new Date().toISOString() } }),
        gte: jest.fn(() => ({ lte: jest.fn().mockResolvedValue({ data: [] }) })),
        order: jest.fn(() => ({ limit: jest.fn().mockResolvedValue({ data: [] }) })),
      })),
    })),
    upsert: jest.fn().mockResolvedValue({ data: { id: 'wr-1' }, error: null }),
  })),
})
;(anthropic.messages.create as jest.Mock).mockResolvedValue(mockClaudeResponse)

describe('POST /api/review/generate', () => {
  it('returns 401 when unauthenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValueOnce({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    })
    const req = new Request('http://localhost/api/review/generate', { method: 'POST' })
    const res = await POST()
    expect(res.status).toBe(401)
  })
})
