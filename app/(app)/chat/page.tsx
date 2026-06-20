'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import ChatMessages from '@/components/chat/ChatMessages'
import ChatInput from '@/components/chat/ChatInput'
import type { ChatMessage } from '@/types'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState<string>('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => { if (data) setMessages(data) })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  async function handleSend(message: string) {
    setSending(true)

    const optimistic: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: '', mission_id: '',
      role: 'user', content: message,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!res.body) throw new Error('No stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setStreaming(full)
      }

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        user_id: '', mission_id: '',
        role: 'assistant', content: full,
        created_at: new Date().toISOString(),
      }])
      setStreaming('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="px-4 pt-6 pb-4 border-b border-[#1a1a1a]">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#525252] mb-1">AI Chief of Staff</p>
        <h1 className="text-2xl font-black text-white">FocusForge <span className="text-[#f97316]">⚡</span></h1>
      </div>

      <div className="pb-36">
        {messages.length === 0 && !streaming && (
          <div className="px-4 pt-12 text-center">
            <div className="w-12 h-12 bg-[#f97316] rounded-2xl flex items-center justify-center text-xl font-black text-white mx-auto mb-4">F</div>
            <p className="font-bold text-white mb-2">Your AI Chief of Staff</p>
            <p className="text-[#525252] text-sm max-w-xs mx-auto">Ask me anything about your mission. Get unstuck. Tell me what's in your way.</p>
          </div>
        )}
        <ChatMessages messages={messages} streaming={streaming || undefined} />
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  )
}
