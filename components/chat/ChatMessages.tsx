import type { ChatMessage } from '@/types'

export default function ChatMessages({ messages, streaming }: { messages: ChatMessage[]; streaming?: string }) {
  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      {messages.map(msg => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'assistant' && (
            <div className="w-6 h-6 bg-[#f97316] rounded-md flex items-center justify-center text-[10px] mr-2.5 mt-0.5 flex-shrink-0 font-black text-white">
              F
            </div>
          )}
          <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            msg.role === 'user'
              ? 'bg-[#f97316] text-white rounded-tr-sm'
              : 'bg-[#111] border border-[#1e1e1e] text-[#e5e5e5] rounded-tl-sm'
          }`}>
            {msg.content}
          </div>
        </div>
      ))}
      {streaming && (
        <div className="flex justify-start">
          <div className="w-6 h-6 bg-[#f97316] rounded-md flex items-center justify-center text-[10px] mr-2.5 mt-0.5 flex-shrink-0 font-black text-white">
            F
          </div>
          <div className="max-w-[78%] bg-[#111] border border-[#1e1e1e] text-[#e5e5e5] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
            {streaming}
            <span className="inline-block w-1.5 h-3.5 bg-[#f97316] ml-0.5 animate-pulse rounded-sm" />
          </div>
        </div>
      )}
    </div>
  )
}
