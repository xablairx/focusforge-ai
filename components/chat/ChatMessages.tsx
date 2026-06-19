import type { ChatMessage } from '@/types'

export default function ChatMessages({ messages, streaming }: { messages: ChatMessage[]; streaming?: string }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {messages.map(msg => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'assistant' && (
            <div className="w-6 h-6 bg-[#f97316] rounded-lg flex items-center justify-center text-[10px] mr-2 mt-0.5 flex-shrink-0">⚡</div>
          )}
          <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            msg.role === 'user' ? 'bg-[#f97316] text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}>
            {msg.content}
          </div>
        </div>
      ))}
      {streaming && (
        <div className="flex justify-start">
          <div className="w-6 h-6 bg-[#f97316] rounded-lg flex items-center justify-center text-[10px] mr-2 mt-0.5 flex-shrink-0">⚡</div>
          <div className="max-w-[78%] bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-relaxed">
            {streaming}
          </div>
        </div>
      )}
    </div>
  )
}
