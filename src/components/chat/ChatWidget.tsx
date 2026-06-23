import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { useChat } from '@/hooks/useChat'

export function ChatWidget() {
  const {
    messages,
    isOpen,
    isProcessing,
    mode,
    unreadCount,
    quickActions,
    toggleChat,
    closeChat,
    sendMessage,
    handleQuickAction,
    handleNavigateTo,
  } = useChat()

  return (
    <>
      <ChatPanel
        isOpen={isOpen}
        onClose={closeChat}
        messages={messages}
        onSendMessage={sendMessage}
        isProcessing={isProcessing}
        mode={mode}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onNavigateTo={handleNavigateTo}
      />
      <ChatBubble
        isOpen={isOpen}
        onClick={toggleChat}
        unreadCount={unreadCount}
      />
    </>
  )
}
