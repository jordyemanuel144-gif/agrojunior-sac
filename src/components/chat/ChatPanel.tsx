import { ChatHeader } from '@/components/chat/ChatHeader'
import { MessageList } from '@/components/chat/MessageList'
import { QuickActions } from '@/components/chat/QuickActions'
import { ChatInput } from '@/components/chat/ChatInput'
import type { ChatMessage, ChatMode, QuickAction } from '@/components/chat/chatTypes'

interface Props {
  isOpen: boolean
  onClose: () => void
  messages: ChatMessage[]
  onSendMessage: (text: string) => void
  isProcessing: boolean
  mode: ChatMode
  quickActions: QuickAction[]
  onQuickAction: (intent: string, label: string) => void
  onNavigateTo: (route: string) => void
}

export function ChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isProcessing,
  mode,
  quickActions,
  onQuickAction,
  onNavigateTo: _onNavigateTo,
}: Props) {
  if (!isOpen) return null

  return (
    <div
      className={`
        fixed z-40
        /* Mobile: full-screen bottom sheet */
        inset-0 sm:inset-0
        flex flex-col
        bg-white
        /* Desktop: floating dialog */
        md:bottom-24 md:right-6 md:left-auto md:top-auto
        md:w-[380px] md:h-[520px]
        md:rounded-2xl md:shadow-2xl
        md:border md:border-gray-200
        animate-slide-up
      `}
    >
      <ChatHeader mode={mode} onClose={onClose} />
      <MessageList messages={messages} />
      <QuickActions
        actions={quickActions}
        onAction={onQuickAction}
        isProcessing={isProcessing}
      />
      <ChatInput onSend={onSendMessage} disabled={isProcessing} />
    </div>
  )
}
