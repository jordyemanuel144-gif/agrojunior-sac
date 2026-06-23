import type { QuickAction } from '@/components/chat/chatTypes'

interface Props {
  actions: QuickAction[]
  onAction: (intent: string, label: string) => void
  isProcessing: boolean
}

export function QuickActions({ actions, onAction, isProcessing }: Props) {
  if (!actions.length) return null

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 shrink-0 scrollbar-none">
      {actions.map((action) => (
        <button
          key={action.intent}
          onClick={() => onAction(action.intent, action.label)}
          disabled={isProcessing}
          className="
            shrink-0
            px-3 py-1.5
            text-xs font-medium
            border border-gray-200 text-gray-600
            rounded-full
            transition-colors duration-150
            hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700
            focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-gray-600
          "
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
