import { render, screen } from '@testing-library/react'
import IdeaCard from '@/components/ideas/IdeaCard'
import type { Idea } from '@/types'

const mockIdea: Idea = {
  id: '1', user_id: 'u1', mission_id: 'm1',
  title: 'New SaaS idea', description: null,
  status: 'jailed', ai_alignment_score: 2,
  ai_notes: 'Zero connection to mission.',
  scheduled_review_date: null, created_at: new Date().toISOString(),
}

describe('IdeaCard', () => {
  it('renders idea title', () => {
    render(<IdeaCard idea={mockIdea} />)
    expect(screen.getByText('New SaaS idea')).toBeInTheDocument()
  })

  it('shows jailed status badge', () => {
    render(<IdeaCard idea={mockIdea} />)
    expect(screen.getByText('🔒 Jailed')).toBeInTheDocument()
  })

  it('renders AI notes', () => {
    render(<IdeaCard idea={mockIdea} />)
    expect(screen.getByText('"Zero connection to mission."')).toBeInTheDocument()
  })
})
