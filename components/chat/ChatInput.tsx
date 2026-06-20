'use client'
import { useState, useRef } from 'react'

interface Props {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-[#0a0a0a] border-t border-[#1a1a1a] px-4 py-3 flex gap-2.5 items-end">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask your Chief of Staff..."
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none bg-[#111] border border-[#222] text-white placeholder:text-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316] max-h-24 disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="w-10 h-10 bg-[#f97316] rounded-xl flex items-center justify-center disabled:opacity-30 flex-shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
        </svg>
      </button>
    </div>
  )
}
