/**
 * @jest-environment node
 */
import { POST } from '@/app/api/mission/route'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server')

const mockSingle = jest.fn()

;(createClient as jest.Mock).mockResolvedValue({
  auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
  from: jest.fn(() => ({
    insert: jest.fn(() => ({ select: jest.fn(() => ({ single: mockSingle })) })),
  })),
})

describe('POST /api/mission', () => {
  it('returns 401 when unauthenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValueOnce({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    })
    const req = new Request('http://localhost/api/mission', {
      method: 'POST',
      body: JSON.stringify({ title: 'Get first client' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when title is missing', async () => {
    const req = new Request('http://localhost/api/mission', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
