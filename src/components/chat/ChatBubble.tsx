import { MessageCircle, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClick: () => void
  unreadCount: number
}

export function ChatBubble({ isOpen, onClick, unreadCount }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center justify-center
        w-14 h-14 rounded-full shadow-lg
        transition-all duration-200 ease-in-out
        hover:scale-105 active:scale-95
        ${isOpen
          ? 'bg-gray-700 hover:bg-gray-800'
          : 'bg-amber-600 hover:bg-amber-700'
        }
        text-white
      `}
      aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <>
          <MessageCircle className="w-6 h-6 animate-pulse" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  )
}
