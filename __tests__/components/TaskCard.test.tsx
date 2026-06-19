import { render, screen } from '@testing-library/react'
import TaskCard from '@/components/dashboard/TaskCard'
import type { Task } from '@/types'

const mockTask: Task = {
  id: '1', user_id: 'u1', mission_id: 'm1', checkin_id: null,
  title: 'Send 3 DMs', description: null,
  priority: 'primary', revenue_score: 10, status: 'pending',
  scheduled_date: null, completed_at: null, created_at: new Date().toISOString(),
}

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={mockTask} onComplete={jest.fn()} />)
    expect(screen.getByText('Send 3 DMs')).toBeInTheDocument()
  })

  it('shows revenue score badge', () => {
    render(<TaskCard task={mockTask} onComplete={jest.fn()} />)
    expect(screen.getByText('Score 10')).toBeInTheDocument()
  })

  it('applies primary styling for primary tasks', () => {
    const { container } = render(<TaskCard task={mockTask} onComplete={jest.fn()} />)
    expect(container.firstChild).toHaveClass('bg-black')
  })
})
