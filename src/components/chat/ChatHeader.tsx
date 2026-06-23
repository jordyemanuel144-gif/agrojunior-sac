import { X } from 'lucide-react'
import type { ChatMode } from '@/components/chat/chatTypes'

interface Props {
  mode: ChatMode
  onClose: () => void
}

function BotAvatar() {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 shrink-0">
      <span className="text-xl leading-none" role="img" aria-label="pollo">
        🐔
      </span>
    </div>
  )
}

const subtitulos: Record<ChatMode, string> = {
  public: 'Consultas',
  admin: 'Asistente',
}

export function ChatHeader({ mode, onClose }: Props) {
  return (
    <div className="relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white shrink-0">
      <BotAvatar />
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold truncate">Sam José Avícola</h2>
        <p className="text-xs text-white/80">{subtitulos[mode]}</p>
      </div>
      <button
        onClick={onClose}
        className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/20 shrink-0"
        aria-label="Cerrar chat"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
