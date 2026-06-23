import { useState, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (text: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')

  function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 shrink-0">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribí un mensaje..."
        disabled={disabled}
        className="
          flex-1 min-w-0
          text-sm text-gray-800 placeholder-gray-400
          bg-transparent
          border-none outline-none ring-0
          focus:outline-none focus:ring-0
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        className="
          flex items-center justify-center
          w-9 h-9 rounded-full
          transition-colors duration-150
          text-amber-600
          hover:bg-amber-50
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
        "
        aria-label="Enviar mensaje"
      >
        <Send className="w-4.5 h-4.5" />
      </button>
    </div>
  )
}
