import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { ChatInput } from '@/components/chat/ChatInput'
import { QuickActions } from '@/components/chat/QuickActions'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { MessageList } from '@/components/chat/MessageList'
import { ChatHeader } from '@/components/chat/ChatHeader'
import type { ChatMessage, QuickAction } from '@/components/chat/chatTypes'

// ===========================================================================
// Helpers
// ===========================================================================

function createMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    sender: 'bot',
    text: 'Hola, soy el asistente',
    timestamp: new Date('2026-06-22T10:30:00'),
    ...overrides,
  }
}

const defaultQuickActions: QuickAction[] = [
  { label: 'Precios', intent: 'precios' },
  { label: 'Horarios', intent: 'horarios' },
  { label: 'Ubicación', intent: 'direccion' },
]

// ===========================================================================
// ChatBubble
// ===========================================================================

describe('ChatBubble', () => {
  let onClick: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onClick = vi.fn()
  })

  it('debería renderizar el botón cerrado con icono de chat', () => {
    render(<ChatBubble isOpen={false} onClick={onClick} unreadCount={0} />)

    const button = screen.getByRole('button', { name: /abrir chat/i })
    expect(button).toBeInTheDocument()
    // Should have amber bg when closed
    expect(button.className).toContain('bg-amber-600')
  })

  it('debería renderizar el botón abierto con icono X', () => {
    render(<ChatBubble isOpen={true} onClick={onClick} unreadCount={0} />)

    const button = screen.getByRole('button', { name: /cerrar chat/i })
    expect(button).toBeInTheDocument()
    // Should have gray bg when open
    expect(button.className).toContain('bg-gray-700')
  })

  it('debería mostrar el badge de mensajes no leídos', () => {
    render(<ChatBubble isOpen={false} onClick={onClick} unreadCount={5} />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('debería mostrar 99+ cuando hay más de 99 no leídos', () => {
    render(<ChatBubble isOpen={false} onClick={onClick} unreadCount={150} />)

    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('debería llamar onClick al hacer clic', async () => {
    const user = userEvent.setup()
    render(<ChatBubble isOpen={false} onClick={onClick} unreadCount={0} />)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

// ===========================================================================
// ChatHeader
// ===========================================================================

describe('ChatHeader', () => {
  let onClose: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onClose = vi.fn()
  })

  it('debería mostrar el título y subtítulo para modo public', () => {
    render(<ChatHeader mode="public" onClose={onClose} />)

    expect(screen.getByText('Sam José Avícola')).toBeInTheDocument()
    expect(screen.getByText('Consultas')).toBeInTheDocument()
  })

  it('debería mostrar subtítulo "Asistente" para modo admin', () => {
    render(<ChatHeader mode="admin" onClose={onClose} />)

    expect(screen.getByText('Asistente')).toBeInTheDocument()
  })

  it('debería mostrar el botón de cerrar y llamar onClose', async () => {
    const user = userEvent.setup()
    render(<ChatHeader mode="public" onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /cerrar chat/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

// ===========================================================================
// MessageBubble
// ===========================================================================

describe('MessageBubble', () => {
  it('debería renderizar un mensaje de usuario con estilo azul', () => {
    const msg = createMessage({ sender: 'user', text: '¿Cuánto cuesta el pollo?' })
    render(<MessageBubble message={msg} />)

    expect(screen.getByText('¿Cuánto cuesta el pollo?')).toBeInTheDocument()
    // User message should have blue background
    const bubble = screen.getByText('¿Cuánto cuesta el pollo?').closest('div')
    expect(bubble?.className).toContain('bg-blue-100')
    expect(bubble?.className).toContain('rounded-br-sm')
  })

  it('debería renderizar un mensaje de bot con estilo gris y avatar', () => {
    const msg = createMessage({ sender: 'bot', text: 'El pollo está a S/8.50' })
    render(<MessageBubble message={msg} />)

    expect(screen.getByText('El pollo está a S/8.50')).toBeInTheDocument()
    // Bot message should have gray background
    const bubble = screen.getByText('El pollo está a S/8.50').closest('div')
    expect(bubble?.className).toContain('bg-gray-100')
    expect(bubble?.className).toContain('rounded-bl-sm')
    // Bot should have avatar
    expect(screen.getByRole('img', { name: /pollo/i })).toBeInTheDocument()
  })

  it('debería NO mostrar avatar para mensajes de usuario', () => {
    const msg = createMessage({ sender: 'user', text: 'Hola' })
    render(<MessageBubble message={msg} />)

    expect(screen.queryByRole('img', { name: /pollo/i })).not.toBeInTheDocument()
  })

  it('debería mostrar el timestamp formateado', () => {
    const date = new Date('2026-06-22T14:30:00')
    const msg = createMessage({ sender: 'bot', text: 'Test', timestamp: date })
    render(<MessageBubble message={msg} />)

    // Should show 14:30
    expect(screen.getByText('14:30')).toBeInTheDocument()
  })
})

// ===========================================================================
// MessageList
// ===========================================================================

describe('MessageList', () => {
  it('debería mostrar el estado vacío cuando no hay mensajes', () => {
    render(<MessageList messages={[]} />)

    expect(screen.getByText('¡Empezá a escribir!')).toBeInTheDocument()
  })

  it('debería renderizar todos los mensajes', () => {
    const messages: ChatMessage[] = [
      createMessage({ id: '1', sender: 'bot', text: 'Bienvenido' }),
      createMessage({ id: '2', sender: 'user', text: 'Gracias' }),
      createMessage({ id: '3', sender: 'bot', text: 'De nada' }),
    ]
    render(<MessageList messages={messages} />)

    expect(screen.getByText('Bienvenido')).toBeInTheDocument()
    expect(screen.getByText('Gracias')).toBeInTheDocument()
    expect(screen.getByText('De nada')).toBeInTheDocument()
  })
})

// ===========================================================================
// ChatInput
// ===========================================================================

describe('ChatInput', () => {
  let onSend: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSend = vi.fn()
  })

  it('debería llamar onSend con el texto ingresado y limpiar el input', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={onSend} disabled={false} />)

    const input = screen.getByPlaceholderText(/escribí un mensaje/i)
    await user.type(input, 'Hola bot')
    await user.keyboard('{Enter}')

    expect(onSend).toHaveBeenCalledTimes(1)
    expect(onSend).toHaveBeenCalledWith('Hola bot')
    expect(input).toHaveValue('')
  })

  it('debería enviar al hacer clic en el botón de enviar', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={onSend} disabled={false} />)

    const input = screen.getByPlaceholderText(/escribí un mensaje/i)
    await user.type(input, 'Mensaje de prueba')

    await user.click(screen.getByRole('button', { name: /enviar mensaje/i }))

    expect(onSend).toHaveBeenCalledWith('Mensaje de prueba')
    expect(input).toHaveValue('')
  })

  it('debería recortar espacios en blanco del texto', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={onSend} disabled={false} />)

    const input = screen.getByPlaceholderText(/escribí un mensaje/i)
    await user.type(input, '   texto con espacios   ')
    await user.keyboard('{Enter}')

    expect(onSend).toHaveBeenCalledWith('texto con espacios')
  })

  it('debería NO llamar onSend cuando el texto está vacío', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={onSend} disabled={false} />)

    const input = screen.getByPlaceholderText(/escribí un mensaje/i)
    await user.type(input, '   ')
    await user.keyboard('{Enter}')

    expect(onSend).not.toHaveBeenCalled()
  })

  it('debería deshabilitar el input y botón cuando disabled es true', () => {
    render(<ChatInput onSend={onSend} disabled={true} />)

    const input = screen.getByPlaceholderText(/escribí un mensaje/i)
    expect(input).toBeDisabled()

    const button = screen.getByRole('button', { name: /enviar mensaje/i })
    expect(button).toBeDisabled()
  })

  it('debería enviar con la tecla Enter', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={onSend} disabled={false} />)

    const input = screen.getByPlaceholderText(/escribí un mensaje/i)
    await user.type(input, 'Hola')
    await user.keyboard('{Enter}')

    expect(onSend).toHaveBeenCalledWith('Hola')
  })
})

// ===========================================================================
// QuickActions
// ===========================================================================

describe('QuickActions', () => {
  let onAction: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onAction = vi.fn()
  })

  it('debería renderizar todas las acciones', () => {
    render(
      <QuickActions
        actions={defaultQuickActions}
        onAction={onAction}
        isProcessing={false}
      />
    )

    expect(screen.getByText('Precios')).toBeInTheDocument()
    expect(screen.getByText('Horarios')).toBeInTheDocument()
    expect(screen.getByText('Ubicación')).toBeInTheDocument()
  })

  it('debería llamar onAction con el intent correcto al hacer clic', async () => {
    const user = userEvent.setup()
    render(
      <QuickActions
        actions={defaultQuickActions}
        onAction={onAction}
        isProcessing={false}
      />
    )

    await user.click(screen.getByText('Precios'))
    expect(onAction).toHaveBeenCalledWith('precios', 'Precios')

    await user.click(screen.getByText('Ubicación'))
    expect(onAction).toHaveBeenCalledWith('direccion', 'Ubicación')
  })

  it('debería deshabilitar los botones cuando isProcessing es true', () => {
    render(
      <QuickActions
        actions={defaultQuickActions}
        onAction={onAction}
        isProcessing={true}
      />
    )

    const buttons = screen.getAllByRole('button')
    for (const btn of buttons) {
      expect(btn).toBeDisabled()
    }
  })

  it('debería renderizar nada cuando actions está vacío', () => {
    const { container } = render(
      <QuickActions actions={[]} onAction={onAction} isProcessing={false} />
    )

    expect(container.innerHTML).toBe('')
  })
})

// ===========================================================================
// ChatPanel
// ===========================================================================

describe('ChatPanel', () => {
  let onClose: ReturnType<typeof vi.fn>
  let onSendMessage: ReturnType<typeof vi.fn>
  let onQuickAction: ReturnType<typeof vi.fn>
  let onNavigateTo: ReturnType<typeof vi.fn>

  const baseProps = {
    isOpen: true,
    onClose: () => onClose(),
    messages: [] as ChatMessage[],
    onSendMessage: (text: string) => onSendMessage(text),
    isProcessing: false,
    mode: 'public' as const,
    quickActions: [] as QuickAction[],
    onQuickAction: (intent: string) => onQuickAction(intent),
    onNavigateTo: (route: string) => onNavigateTo(route),
  }

  beforeEach(() => {
    onClose = vi.fn()
    onSendMessage = vi.fn()
    onQuickAction = vi.fn()
    onNavigateTo = vi.fn()
  })

  it('debería renderizar nada cuando isOpen es false', () => {
    const { container } = render(<ChatPanel {...baseProps} isOpen={false} />)

    expect(container.innerHTML).toBe('')
  })

  it('debería renderizar todos los subcomponentes cuando isOpen es true', () => {
    const messages: ChatMessage[] = [
      createMessage({ id: '1', sender: 'bot', text: '¡Hola!' }),
      createMessage({ id: '2', sender: 'user', text: 'Hola bot' }),
    ]

    render(
      <ChatPanel
        {...baseProps}
        messages={messages}
        quickActions={defaultQuickActions}
      />
    )

    // Header
    expect(screen.getByText('Sam José Avícola')).toBeInTheDocument()
    // Messages
    expect(screen.getByText('¡Hola!')).toBeInTheDocument()
    expect(screen.getByText('Hola bot')).toBeInTheDocument()
    // Quick actions
    expect(screen.getByText('Precios')).toBeInTheDocument()
    // Input
    expect(screen.getByPlaceholderText(/escribí un mensaje/i)).toBeInTheDocument()
  })

  it('debería mostrar el estado vacío de mensajes cuando no hay mensajes', () => {
    render(<ChatPanel {...baseProps} />)

    expect(screen.getByText('¡Empezá a escribir!')).toBeInTheDocument()
  })

  it('debería deshabilitar input y quick actions cuando isProcessing es true', () => {
    render(
      <ChatPanel
        {...baseProps}
        isProcessing={true}
        quickActions={defaultQuickActions}
      />
    )

    // Input disabled
    const input = screen.getByPlaceholderText(/escribí un mensaje/i)
    expect(input).toBeDisabled()

    // Quick actions disabled
    const actionButtons = screen.getAllByRole('button')
    // Filter out the close button, keep action pills
    for (const btn of actionButtons) {
      if (btn.textContent && ['Precios', 'Horarios', 'Ubicación'].includes(btn.textContent)) {
        expect(btn).toBeDisabled()
      }
    }
  })
})
