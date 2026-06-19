export type MissionStatus = 'active' | 'completed' | 'abandoned' | 'paused'
export type IdeaStatus = 'jailed' | 'flagged' | 'approved' | 'promoted' | 'dismissed'
export type TaskPriority = 'primary' | 'secondary' | 'optional'
export type TaskStatus = 'pending' | 'completed' | 'skipped'
export type MessageRole = 'user' | 'assistant'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  sahm_mode: boolean
  sahm_available_minutes: number
  onboarded: boolean
  created_at: string
  updated_at: string
}

export interface Mission {
  id: string
  user_id: string
  title: string
  description: string | null
  status: MissionStatus
  completion_pct: number
  started_at: string
  completed_at: string | null
  abandoned_at: string | null
  abandoned_reason: string | null
  created_at: string
}

export interface Idea {
  id: string
  user_id: string
  mission_id: string
  title: string
  description: string | null
  status: IdeaStatus
  ai_alignment_score: number | null
  ai_notes: string | null
  scheduled_review_date: string | null
  created_at: string
}

export interface DailyCheckin {
  id: string
  user_id: string
  mission_id: string
  checkin_date: string
  available_hours: number
  obstacles: string | null
  yesterday_progress: string | null
  ai_coaching_notes: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  mission_id: string
  checkin_id: string | null
  title: string
  description: string | null
  priority: TaskPriority
  revenue_score: number
  status: TaskStatus
  scheduled_date: string | null
  completed_at: string | null
  created_at: string
}

export interface RevenueEntry {
  id: string
  user_id: string
  mission_id: string
  amount: number
  currency: string
  description: string | null
  entry_date: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  mission_id: string
  role: MessageRole
  content: string
  created_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  mission_id: string
  week_start: string
  week_end: string
  revenue_generated: number
  hours_spent: number
  focus_score: number
  completion_score: number
  tasks_completed: number
  ai_coaching: string | null
  created_at: string
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_checkin_date: string | null
  updated_at: string
}
