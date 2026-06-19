import { TaskOutputSchema, IdeaScoreSchema, WeeklyReviewSchema } from '@/lib/anthropic/schemas'

describe('Claude output schemas', () => {
  it('TaskOutputSchema accepts valid task output', () => {
    const result = TaskOutputSchema.safeParse({
      tasks: [
        { title: 'Send 3 DMs', description: 'Cold outreach', priority: 'primary', revenue_score: 10 },
      ],
      coaching_note: 'Do the DMs first.',
    })
    expect(result.success).toBe(true)
  })

  it('TaskOutputSchema rejects more than 3 tasks', () => {
    const result = TaskOutputSchema.safeParse({
      tasks: [
        { title: 'T1', description: '', priority: 'primary', revenue_score: 9 },
        { title: 'T2', description: '', priority: 'secondary', revenue_score: 6 },
        { title: 'T3', description: '', priority: 'optional', revenue_score: 3 },
        { title: 'T4', description: '', priority: 'optional', revenue_score: 2 },
      ],
      coaching_note: 'Too many',
    })
    expect(result.success).toBe(false)
  })

  it('IdeaScoreSchema accepts valid score', () => {
    const result = IdeaScoreSchema.safeParse({
      alignment_score: 7,
      status: 'flagged',
      ai_notes: 'Possible but not urgent.',
    })
    expect(result.success).toBe(true)
  })
})
