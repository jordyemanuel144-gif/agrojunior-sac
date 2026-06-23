import type { ChatMessage } from '@/components/chat/chatTypes'

interface Props {
  message: ChatMessage
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Renders message text with simple markdown support:
 * - **bold** → <strong>
 * - URLs (http/https/wa.me) → clickable <a>
 * - \n → line breaks
 */
function renderText(text: string): React.ReactNode[] {
  // Split by newlines first, then process each line
  const lines = text.split('\n')

  return lines.flatMap((line, lineIdx) => {
    const nodes: React.ReactNode[] = []

    // Token pattern: **bold** | URL
    const tokenPattern = /(\*\*(.+?)\*\*)|(https?:\/\/[^\s]+|wa\.me\/[^\s]+)/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = tokenPattern.exec(line)) !== null) {
      // Text before this token
      if (match.index > lastIndex) {
        nodes.push(line.slice(lastIndex, match.index))
      }

      if (match[1]) {
        // Bold: **text**
        nodes.push(
          <strong key={`${lineIdx}-b-${match.index}`} className="font-semibold">
            {match[2]}
          </strong>,
        )
      } else if (match[3]) {
        // URL
        const url = match[3].startsWith('http') ? match[3] : `https://${match[3]}`
        nodes.push(
          <a
            key={`${lineIdx}-a-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {match[3]}
          </a>,
        )
      }

      lastIndex = match.index + match[0].length
    }

    // Remaining text after last token
    if (lastIndex < line.length) {
      nodes.push(line.slice(lastIndex))
    }

    // Add line break between lines (not after the last)
    if (lineIdx < lines.length - 1) {
      nodes.push(<br key={`${lineIdx}-br`} />)
    }

    return nodes
  })
}

export function MessageBubble({ message }: Props) {
  const isUser = message.sender === 'user'

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {!isUser && (
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 shrink-0 mb-1">
          <span className="text-sm leading-none" role="img" aria-label="pollo">
            🐔
          </span>
        </div>
      )}

      <div className="flex flex-col max-w-[80%]">
        <div
          className={`
            px-3.5 py-2.5 text-sm leading-relaxed break-words
            ${
              isUser
                ? 'bg-blue-100 text-blue-900 rounded-2xl rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'
            }
          `}
        >
          {renderText(message.text)}
        </div>
        <span
          className={`text-[10px] text-gray-400 mt-0.5 ${isUser ? 'text-right' : 'text-left'}`}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
