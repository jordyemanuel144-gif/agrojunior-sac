import { useEffect, useRef } from 'react'
import { MessageBubble } from '@/components/chat/MessageBubble'
import type { ChatMessage } from '@/components/chat/chatTypes'

interface Props {
  messages: ChatMessage[]
}

export function MessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch {
      // scrollIntoView may not be available in test environments (jsdom)
    }
  }, [messages])

  if (!messages.length) {
    return (
      <div className="flex items-center justify-center flex-1 px-4">
        <p className="text-sm text-gray-400 text-center">
          ¡Empezá a escribir!
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
