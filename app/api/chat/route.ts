import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'
import { buildChatSystemPrompt } from '@/lib/anthropic/prompts'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await request.json()
  const userMessage: string = body.message?.trim()
  if (!userMessage) return new Response('Message required', { status: 400 })

  const today = new Date().toISOString().split('T')[0]
  const [
    { data: mission },
    { data: profile },
    { data: tasks },
    { data: streak },
    { data: recentIdeas },
    { data: history },
  ] = await Promise.all([
    supabase.from('missions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('tasks').select('title,status').eq('user_id', user.id).eq('scheduled_date', today),
    supabase.from('streaks').select('current_streak').eq('user_id', user.id).single(),
    supabase.from('ideas').select('title').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('chat_messages').select('role,content').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  if (!mission || !profile) return new Response('No active mission', { status: 404 })

  const taskTitles = (tasks ?? []).map((t: { title: string; status: string }) => `${t.title}${t.status === 'completed' ? ' ✓' : ''}`)
  const completedCount = (tasks ?? []).filter((t: { status: string }) => t.status === 'completed').length
  const ideaTitles = (recentIdeas ?? []).map((i: { title: string }) => i.title)
  const sortedHistory = [...(history ?? [])].reverse()

  const systemPrompt = buildChatSystemPrompt({
    mission,
    profile,
    tasksToday: taskTitles,
    completedCount,
    revenueTotal: 0,
    streak: streak?.current_streak ?? 0,
    recentIdeas: ideaTitles,
  })

  await supabase.from('chat_messages').insert({
    user_id: user.id, mission_id: mission.id, role: 'user', content: userMessage,
  })

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      ...sortedHistory.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ],
  })

  const encoder = new TextEncoder()
  let fullResponse = ''

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text
          fullResponse += text
          controller.enqueue(encoder.encode(text))
        }
      }
      await supabase.from('chat_messages').insert({
        user_id: user.id, mission_id: mission.id, role: 'assistant', content: fullResponse,
      })
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}
