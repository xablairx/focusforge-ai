/**
 * @jest-environment node
 */
import { POST } from '@/app/api/ideas/route'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/anthropic/client', () => ({
  anthropic: { messages: { create: jest.fn() } },
}))

const mockClaudeResponse = {
  content: [{ type: 'text', text: JSON.stringify({
    alignment_score: 2,
    status: 'jailed',
    ai_notes: 'Zero connection to your current mission.',
  })}],
}

;(createClient as jest.Mock).mockResolvedValue({
  auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
  from: jest.fn(() => ({
    select: jest.fn(() => ({ eq: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn().mockResolvedValue({ data: { id: 'm1', title: 'Get first client', started_at: new Date().toISOString() } }) })) })) })),
    insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn().mockResolvedValue({ data: { id: 'idea-1', status: 'jailed' } }) })) })),
  })),
})
;(anthropic.messages.create as jest.Mock).mockResolvedValue(mockClaudeResponse)

describe('POST /api/ideas', () => {
  it('returns 401 when unauthenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValueOnce({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    })
    const req = new Request('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify({ title: 'New SaaS idea' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when title missing', async () => {
    const req = new Request('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
