import type { Mission, Task, Idea, Profile } from '@/types'

describe('types', () => {
  it('Mission type has required fields', () => {
    const m: Mission = {
      id: 'uuid',
      user_id: 'uuid',
      title: 'Get first client',
      description: null,
      status: 'active',
      completion_pct: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      abandoned_at: null,
      abandoned_reason: null,
      created_at: new Date().toISOString(),
    }
    expect(m.status).toBe('active')
  })
})
