import { z } from 'zod'

export const TaskOutputSchema = z.object({
  tasks: z.array(z.object({
    title:         z.string().min(1),
    description:   z.string(),
    priority:      z.enum(['primary', 'secondary', 'optional']),
    revenue_score: z.number().int().min(0).max(10),
  })).max(3),
  coaching_note: z.string().min(1),
})

export const IdeaScoreSchema = z.object({
  alignment_score: z.number().int().min(0).max(10),
  status:          z.enum(['jailed', 'flagged', 'approved']),
  ai_notes:        z.string().min(1),
})

export const WeeklyReviewSchema = z.object({
  wins:             z.array(z.string()),
  failures:         z.array(z.string()),
  coaching:         z.string().min(1),
  focus_score:      z.number().int().min(0).max(100),
  completion_score: z.number().int().min(0).max(100),
})

export type TaskOutput         = z.infer<typeof TaskOutputSchema>
export type IdeaScore          = z.infer<typeof IdeaScoreSchema>
export type WeeklyReviewOutput = z.infer<typeof WeeklyReviewSchema>
